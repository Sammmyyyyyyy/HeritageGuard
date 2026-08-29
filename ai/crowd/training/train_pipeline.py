"""Full training pipeline for time-aware crowd prediction models."""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, Tuple, Optional
import joblib
import numpy as np
import pandas as pd
import lightgbm as lgb

from ai.crowd.preprocessing.cleaner import DataCleaner
from ai.crowd.preprocessing.feature_engineering import FeatureEngineer
from ai.crowd.training.evaluate import ModelEvaluator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


class ModelTrainingPipeline:
    """End-to-end training, validation, and artifact persistence pipeline."""

    def __init__(
        self,
        data_path: Optional[str] = None,
        output_dir: Optional[str] = None
    ):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        if data_path is None:
            data_path = os.path.join(
                os.path.dirname(base_dir),
                "crowd_prediction",
                "dataset_merge",
                "merged_crowd_dataset.csv"
            )
        
        if output_dir is None:
            output_dir = os.path.join(base_dir, "models")

        self.data_path = data_path
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        self.cleaner = DataCleaner()
        self.feature_engineer = FeatureEngineer(site_metadata=self.cleaner.site_metadata)
        self.evaluator = ModelEvaluator()
        self.model = None

    def time_aware_split(
        self,
        df: pd.DataFrame,
        train_ratio: float = 0.70,
        val_ratio: float = 0.15
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
        """Splits data strictly chronologically per site to prevent future-data leakage."""
        train_indices, val_indices, test_indices = [], [], []

        for site_id, grp in df.groupby("Site_ID"):
            n = len(grp)
            n_train = int(n * train_ratio)
            n_val = int(n * val_ratio)
            
            idx = grp.index.values
            train_indices.extend(idx[:n_train])
            val_indices.extend(idx[n_train:n_train + n_val])
            test_indices.extend(idx[n_train + n_val:])

        train_df = df.loc[train_indices].copy()
        val_df = df.loc[val_indices].copy()
        test_df = df.loc[test_indices].copy()

        logger.info(
            f"Chronological split completed: Train={len(train_df):,} | Val={len(val_df):,} | Test={len(test_df):,}"
        )
        return train_df, val_df, test_df

    def run(self) -> Dict[str, Any]:
        """Executes full data cleaning, feature engineering, model training, and evaluation."""
        logger.info(f"Loading raw dataset from {self.data_path}")
        raw_df = pd.read_csv(self.data_path, encoding="utf-8-sig", low_memory=False)
        
        logger.info("Cleaning raw dataset...")
        clean_df = self.cleaner.clean_raw_data(raw_df)
        logger.info(f"Dataset cleaned successfully: {len(clean_df):,} records across 20 sites.")

        # Chronological Partitioning
        train_df, val_df, test_df = self.time_aware_split(clean_df)

        # Fit preprocessor strictly on training data
        logger.info("Fitting feature engineering pipeline on training data...")
        self.feature_engineer.fit(train_df)

        X_train = self.feature_engineer.transform(train_df)
        y_train = train_df["Crowd_Count"].values

        X_val = self.feature_engineer.transform(val_df)
        y_val = val_df["Crowd_Count"].values

        X_test = self.feature_engineer.transform(test_df)
        y_test = test_df["Crowd_Count"].values

        # LightGBM Model Architecture with Hyperparameter Tuning
        logger.info("Training LightGBM Regressor with early stopping...")
        self.model = lgb.LGBMRegressor(
            n_estimators=600,
            learning_rate=0.03,
            num_leaves=127,
            min_child_samples=20,
            subsample=0.8,
            colsample_bytree=0.8,
            reg_alpha=0.1,
            reg_lambda=1.0,
            random_state=42,
            verbose=-1,
            n_jobs=-1
        )

        self.model.fit(
            X_train,
            y_train,
            eval_set=[(X_val, y_val)],
            callbacks=[lgb.early_stopping(stopping_rounds=40, verbose=False)]
        )

        logger.info(f"Model converged at iteration: {self.model.best_iteration_}")

        # Predictions on test set
        test_pred = np.maximum(0, self.model.predict(X_test))
        test_eval_df = test_df.copy()
        test_eval_df["Predicted_Crowd"] = test_pred

        # Comprehensive Evaluation
        logger.info("Computing multi-dimensional evaluation metrics...")
        report = self.evaluator.generate_full_report(test_eval_df)

        logger.info(
            f"TEST METRICS: MAE={report['overall']['mae']} | "
            f"RMSE={report['overall']['rmse']} | "
            f"R2={report['overall']['r2']} | "
            f"MAPE={report['overall']['mape']}%"
        )

        # Save artifacts
        self.save_artifacts(report)
        return report

    def save_artifacts(self, report: Dict[str, Any]):
        """Persists trained model, preprocessor, configuration, and metrics."""
        model_file = os.path.join(self.output_dir, "best_model.joblib")
        preprocessor_file = os.path.join(self.output_dir, "preprocessor.joblib")
        metadata_file = os.path.join(self.output_dir, "metadata.json")
        metrics_file = os.path.join(self.output_dir, "metrics.json")

        joblib.dump(self.model, model_file)
        joblib.dump(self.feature_engineer.to_dict(), preprocessor_file)

        metadata = {
            "model_type": "LightGBMRegressor",
            "trained_at": datetime.now().isoformat(),
            "best_iteration": int(self.model.best_iteration_),
            "feature_columns": self.feature_engineer.FEATURE_COLUMNS,
            "total_sites": len(self.cleaner.site_metadata),
            "supported_site_ids": list(self.cleaner.site_id_to_meta.keys()),
            "data_source": self.data_path
        }

        with open(metadata_file, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        with open(metrics_file, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        logger.info(f"Artifacts saved successfully in {self.output_dir}")
