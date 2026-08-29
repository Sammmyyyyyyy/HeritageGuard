"""CLI script to train the crowd prediction model and save all artifacts."""

import os
import sys
import argparse
import json
import logging

# Ensure project root is in python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ai.crowd.training.train_pipeline import ModelTrainingPipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("TrainCrowdModel")


def main():
    parser = argparse.ArgumentParser(description="Train Heritage Crowd Prediction System")
    parser.add_argument(
        "--data",
        type=str,
        default=None,
        help="Path to merged crowd dataset CSV (defaults to ai/crowd_prediction/dataset_merge/merged_crowd_dataset.csv)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default=None,
        help="Directory to save model artifacts (defaults to ai/crowd/models)"
    )

    args = parser.parse_args()
    logger.info("Starting Crowd Prediction Model Training Pipeline...")

    pipeline = ModelTrainingPipeline(data_path=args.data, output_dir=args.output)
    report = pipeline.run()

    print("\n" + "=" * 60)
    print("TRAINING & EVALUATION COMPLETE")
    print("=" * 60)
    print(f"Overall Test MAE : {report['overall']['mae']}")
    print(f"Overall Test RMSE: {report['overall']['rmse']}")
    print(f"Overall Test R²  : {report['overall']['r2']}")
    print(f"Overall Test MAPE: {report['overall']['mape']}%")
    print("=" * 60)
    print("Artifacts successfully saved in:", pipeline.output_dir)


if __name__ == "__main__":
    main()
