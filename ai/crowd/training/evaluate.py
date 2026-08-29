"""Model evaluation metrics calculation and reporting."""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


class ModelEvaluator:
    """Computes comprehensive time-aware evaluation metrics."""

    @staticmethod
    def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
        """Calculates regression error metrics."""
        y_true = np.asarray(y_true, dtype=float)
        y_pred = np.asarray(y_pred, dtype=float)
        y_pred = np.maximum(0, y_pred)  # Clamp negative predictions to 0

        mae = float(mean_absolute_error(y_true, y_pred))
        rmse = float(np.sqrt(mean_squared_error(y_true, y_pred)))
        r2 = float(r2_score(y_true, y_pred)) if len(y_true) > 1 else 0.0
        
        # Symmetric MAPE (SMAPE) and standard MAPE with safe denominator
        denom = np.maximum(y_true, 1.0)
        mape = float(np.mean(np.abs((y_true - y_pred) / denom)) * 100.0)
        
        smape_denom = (np.abs(y_true) + np.abs(y_pred)) / 2.0
        smape = float(np.mean(np.abs(y_pred - y_true) / np.maximum(smape_denom, 1.0)) * 100.0)

        return {
            "mae": round(mae, 2),
            "rmse": round(rmse, 2),
            "r2": round(r2, 4),
            "mape": round(mape, 2),
            "smape": round(smape, 2)
        }

    def generate_full_report(
        self,
        df_eval: pd.DataFrame,
        y_true_col: str = "Crowd_Count",
        y_pred_col: str = "Predicted_Crowd"
    ) -> Dict[str, Any]:
        """Generates detailed evaluation report across overall, per-site, and per-hour slices."""
        overall_metrics = self.calculate_metrics(df_eval[y_true_col], df_eval[y_pred_col])
        
        # Per-site evaluation
        per_site_metrics = {}
        for site_id, grp in df_eval.groupby("Site_ID"):
            site_metrics = self.calculate_metrics(grp[y_true_col], grp[y_pred_col])
            site_metrics["sample_count"] = int(len(grp))
            site_metrics["mean_actual"] = round(float(grp[y_true_col].mean()), 2)
            site_metrics["mean_pred"] = round(float(grp[y_pred_col].mean()), 2)
            per_site_metrics[site_id] = site_metrics

        # Per-hour evaluation
        per_hour_metrics = {}
        for hour, grp in df_eval.groupby("Hour"):
            hour_metrics = self.calculate_metrics(grp[y_true_col], grp[y_pred_col])
            hour_metrics["sample_count"] = int(len(grp))
            per_hour_metrics[int(hour)] = hour_metrics

        # Peak vs Non-Peak evaluation (defined as top 25% of actual crowd counts per site)
        peak_records = []
        non_peak_records = []
        for _, grp in df_eval.groupby("Site_ID"):
            q75 = grp[y_true_col].quantile(0.75)
            peak_records.append(grp[grp[y_true_col] >= q75])
            non_peak_records.append(grp[grp[y_true_col] < q75])

        peak_df = pd.concat(peak_records) if peak_records else pd.DataFrame()
        non_peak_df = pd.concat(non_peak_records) if non_peak_records else pd.DataFrame()

        peak_metrics = self.calculate_metrics(peak_df[y_true_col], peak_df[y_pred_col]) if not peak_df.empty else {}
        non_peak_metrics = self.calculate_metrics(non_peak_df[y_true_col], non_peak_df[y_pred_col]) if not non_peak_df.empty else {}

        return {
            "overall": overall_metrics,
            "per_site": per_site_metrics,
            "per_hour": per_hour_metrics,
            "peak_period": peak_metrics,
            "non_peak_period": non_peak_metrics,
            "total_test_samples": int(len(df_eval))
        }
