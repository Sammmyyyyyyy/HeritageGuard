"""Inference engine for site-specific crowd prediction."""

import os
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional, Union
import joblib
import numpy as np
import pandas as pd

from ai.crowd.preprocessing.cleaner import DataCleaner
from ai.crowd.preprocessing.feature_engineering import FeatureEngineer
from ai.crowd.prediction.peak_detection import PeakHourDetector
from ai.crowd.prediction.best_time import BestTimeOptimizer

logger = logging.getLogger(__name__)


class CrowdPredictor:
    """Production inference engine for heritage crowd prediction."""

    def __init__(self, models_dir: Optional[str] = None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if models_dir is None:
            models_dir = os.path.join(base_dir, "models")
        
        self.models_dir = models_dir
        self.cleaner = DataCleaner()
        self.peak_detector = PeakHourDetector()
        self.best_time_optimizer = BestTimeOptimizer()
        
        self.model = None
        self.feature_engineer = None
        self.metadata = {}
        self._load_artifacts()

    def _load_artifacts(self):
        """Loads saved LightGBM model and feature engineering pipeline."""
        model_path = os.path.join(self.models_dir, "best_model.joblib")
        prep_path = os.path.join(self.models_dir, "preprocessor.joblib")
        meta_path = os.path.join(self.models_dir, "metadata.json")

        if not os.path.exists(model_path) or not os.path.exists(prep_path):
            raise FileNotFoundError(
                f"Trained model artifacts not found in {self.models_dir}. "
                "Please run training pipeline (python ai/crowd/train.py) first."
            )

        self.model = joblib.load(model_path)
        prep_data = joblib.load(prep_path)
        self.feature_engineer = FeatureEngineer.from_dict(prep_data)

        if os.path.exists(meta_path):
            with open(meta_path, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

    def predict_site_date(
        self,
        site_id: str,
        date: Union[str, datetime],
        weather: Optional[str] = None,
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """Generates hourly crowd forecasts for a specified heritage site and date.
        
        Args:
            site_id: Registered site ID (e.g. 'DEL001', 'BOM001').
            date: Target date string 'YYYY-MM-DD' or datetime object.
            weather: Optional weather override ('Clear', 'Sunny', 'Rainy', 'Cloudy').
            temperature: Optional temperature override in Celsius.
            
        Returns:
            Structured prediction dictionary.
        """
        # 1. Validate site_id strictly
        site_meta = self.cleaner.validate_site_id(site_id)
        
        # 2. Parse target date
        if isinstance(date, str):
            try:
                target_date = datetime.strptime(date.strip(), "%Y-%m-%d")
            except ValueError:
                try:
                    target_date = pd.to_datetime(date).to_pydatetime()
                except Exception as e:
                    raise ValueError(f"Invalid date format '{date}'. Expected YYYY-MM-DD.") from e
        elif isinstance(date, datetime):
            target_date = date
        else:
            raise ValueError(f"Invalid date type: {type(date)}. Expected 'YYYY-MM-DD' string or datetime.")

        formatted_date = target_date.strftime("%Y-%m-%d")
        day_name = target_date.strftime("%A")
        is_sunday = target_date.weekday() == 6
        is_weekend = target_date.weekday() in [5, 6]
        
        # Weather and temperature defaults based on season/month if not provided
        month = target_date.month
        if weather is None:
            if month in [6, 7, 8, 9]:
                weather = "Rainy"
            elif month in [3, 4, 5]:
                weather = "Sunny"
            elif month in [12, 1, 2]:
                weather = "Clear"
            else:
                weather = "Clear"

        if temperature is None:
            # Average seasonal temperature by region
            if month in [5, 6]:
                temperature = 34.0
            elif month in [12, 1]:
                temperature = 18.0
            elif month in [7, 8, 9]:
                temperature = 28.0
            else:
                temperature = 26.0

        # Operating hours for the site
        open_hour = site_meta.get("open_hour", 8)
        close_hour = site_meta.get("close_hour", 18)
        safe_capacity = float(site_meta.get("safe_capacity", 15000))

        # Build hourly slot inference rows
        hours = list(range(open_hour, close_hour + 1))
        rows = []
        for h in hours:
            rows.append({
                "Site_ID": site_meta["site_id"],
                "Date": formatted_date,
                "Parsed_Date": target_date,
                "Time": f"{h:02d}:00",
                "Hour": h,
                "Minute": 0,
                "Weather": weather,
                "Is_Holiday": 1 if is_sunday else 0,
                "Is_Event": 0,
                "Temperature": temperature
            })

        slot_df = pd.DataFrame(rows)
        
        # Feature transformation
        X = self.feature_engineer.transform(slot_df)
        
        # Model Inference
        raw_predictions = self.model.predict(X)
        predicted_visitors = np.maximum(0, raw_predictions)

        # Statistical scaling factor for crowd percentage based on safe physical capacity
        # crowd_percent = (predicted_visitors / safe_capacity) * 100 clamped in [0, 100]
        hourly_predictions = []
        total_visitors = 0

        for i, h in enumerate(hours):
            visitors_count = int(round(predicted_visitors[i]))
            total_visitors += visitors_count
            
            # Statistical crowd percentage calculation
            crowd_pct = round((visitors_count / safe_capacity) * 100.0, 1)
            crowd_pct = max(0.0, min(100.0, crowd_pct))

            hourly_predictions.append({
                "time": f"{h:02d}:00",
                "crowd_percent": int(round(crowd_pct)),
                "expected_visitors": visitors_count
            })

        # Dynamic Peak Hours & Best Visiting Window
        peak_hours = self.peak_detector.detect_peak_hours(hourly_predictions)
        best_time = self.best_time_optimizer.calculate_best_time(
            hourly_predictions,
            open_hour=open_hour,
            close_hour=close_hour
        )

        return {
            "site_id": site_meta["site_id"],
            "site_name": site_meta["name"],
            "city": site_meta["city"],
            "state": site_meta["state"],
            "date": formatted_date,
            "day_of_week": day_name,
            "operating_hours": f"{open_hour:02d}:00-{close_hour:02d}:00",
            "weather": weather,
            "temperature_c": temperature,
            "safe_capacity": int(safe_capacity),
            "daily_expected_total": total_visitors,
            "predictions": hourly_predictions,
            "peak_hours": peak_hours,
            "best_time": best_time
        }
