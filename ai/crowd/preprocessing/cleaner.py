"""Data cleaning and validation module for historical crowd datasets."""

import os
import json
import logging
from typing import Dict, Any, Optional, Tuple
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)


class DataCleaner:
    """Cleans and validates raw visitor dataset records."""

    def __init__(self, metadata_path: Optional[str] = None):
        if metadata_path is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            metadata_path = os.path.join(base_dir, "data", "site_metadata.json")
        
        self.metadata_path = metadata_path
        self.site_metadata = self._load_site_metadata()
        self.place_to_site_id = {
            item["dataset_place"]: item["site_id"] for item in self.site_metadata
        }
        self.site_id_to_meta = {
            item["site_id"]: item for item in self.site_metadata
        }

    def _load_site_metadata(self) -> list:
        if not os.path.exists(self.metadata_path):
            raise FileNotFoundError(f"Site metadata not found at {self.metadata_path}")
        with open(self.metadata_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def clean_raw_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Cleans and normalizes raw dataframe from CSV.
        
        Args:
            df: Raw pandas DataFrame.
            
        Returns:
            Cleaned and enriched DataFrame.
        """
        data = df.copy()
        
        # 1. Clean column names
        data.columns = [c.strip() for c in data.columns]
        temp_cols = [c for c in data.columns if "Temp" in c]
        if temp_cols:
            data = data.rename(columns={temp_cols[0]: "Temperature"})

        # 2. Map Place to Site_ID
        if "Site_ID" not in data.columns:
            if "Place" not in data.columns:
                raise ValueError("Dataset must contain 'Place' or 'Site_ID' column.")
            data["Site_ID"] = data["Place"].map(self.place_to_site_id)
            
            # Fallback fuzzy match if exact place name differed
            unmapped = data["Site_ID"].isnull()
            if unmapped.any():
                for idx, row in data[unmapped].iterrows():
                    place_str = str(row["Place"]).lower()
                    for item in self.site_metadata:
                        if item["name"].lower() in place_str or item["city"].lower() in place_str:
                            data.at[idx, "Site_ID"] = item["site_id"]
                            break

        # Filter out rows that could not be mapped to one of the 20 sites
        data = data.dropna(subset=["Site_ID"]).copy()

        # 3. Parse Date and Time
        data["Parsed_Date"] = pd.to_datetime(data["Date"], errors="coerce")
        data = data.dropna(subset=["Parsed_Date"]).copy()

        if "Time" in data.columns:
            data["Parsed_Time"] = pd.to_datetime(data["Time"], format="%H:%M", errors="coerce")
            data["Hour"] = data["Parsed_Time"].dt.hour.fillna(12).astype(int)
            data["Minute"] = data["Parsed_Time"].dt.minute.fillna(0).astype(int)
        elif "Hour" in data.columns:
            data["Hour"] = data["Hour"].astype(int)
            data["Minute"] = 0
        else:
            data["Hour"] = 12
            data["Minute"] = 0

        # Clamp hours to valid range [0, 23]
        data["Hour"] = data["Hour"].clip(0, 23)
        data["Minute"] = data["Minute"].clip(0, 59)

        # 4. Clean and validate Crowd_Count
        if "Crowd_Count" in data.columns:
            data["Crowd_Count"] = pd.to_numeric(data["Crowd_Count"], errors="coerce").fillna(0)
            data["Crowd_Count"] = data["Crowd_Count"].clip(lower=0).astype(float)

        # 5. Clean Weather
        allowed_weather = {"Sunny", "Rainy", "Cloudy", "Clear"}
        if "Weather" in data.columns:
            data["Weather"] = data["Weather"].astype(str).str.strip().str.capitalize()
            data.loc[~data["Weather"].isin(allowed_weather), "Weather"] = "Clear"
        else:
            data["Weather"] = "Clear"

        # 6. Clean Holiday and Event
        if "Holiday" in data.columns:
            data["Is_Holiday"] = (data["Holiday"].astype(str).str.strip().str.lower() == "yes").astype(int)
        else:
            data["Is_Holiday"] = 0

        if "Event" in data.columns:
            data["Is_Event"] = (data["Event"].astype(str).str.strip().str.lower() == "national holiday").astype(int)
        else:
            data["Is_Event"] = 0

        # 7. Clean Temperature
        if "Temperature" in data.columns:
            data["Temperature"] = pd.to_numeric(data["Temperature"], errors="coerce").fillna(25.0)
            data["Temperature"] = data["Temperature"].clip(lower=-10.0, upper=55.0)
        else:
            data["Temperature"] = 25.0

        # Sort chronologically per site
        data = data.sort_values(by=["Site_ID", "Parsed_Date", "Hour", "Minute"]).reset_index(drop=True)
        return data

    def validate_site_id(self, site_id: str) -> Dict[str, Any]:
        """Validates site_id against registered sites."""
        clean_id = str(site_id).strip().upper()
        if clean_id not in self.site_id_to_meta:
            valid_ids = list(self.site_id_to_meta.keys())
            raise ValueError(
                f"Unknown site_id: '{site_id}'. Must be one of the 20 supported sites: {valid_ids}"
            )
        return self.site_id_to_meta[clean_id]
