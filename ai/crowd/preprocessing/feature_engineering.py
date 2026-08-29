"""Feature engineering pipeline for crowd prediction."""

import json
from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd


class FeatureEngineer:
    """Computes time-aware, cyclical, meteorological, and site-specific features."""

    WEATHER_MAP = {"Clear": 0, "Cloudy": 1, "Rainy": 2, "Sunny": 3}

    FEATURE_COLUMNS = [
        "site_code",
        "Hour",
        "Minute",
        "Year",
        "Month",
        "Day",
        "DayOfWeek",
        "DayOfYear",
        "WeekOfYear",
        "DaysSinceStart",
        "Is_Weekend",
        "Is_Holiday",
        "Is_Event",
        "Temperature",
        "weather_code",
        "sin_hour",
        "cos_hour",
        "sin_month",
        "cos_month",
        "sin_dayofweek",
        "cos_dayofweek",
        "site_hist_mean",
        "site_hist_median",
        "site_hist_std",
        "site_hour_mean",
        "site_dow_mean"
    ]

    def __init__(self, site_metadata: Optional[List[Dict[str, Any]]] = None):
        self.site_metadata = site_metadata or []
        self.site_ids = sorted([s["site_id"] for s in self.site_metadata]) if self.site_metadata else []
        self.site_to_code = {s: i for i, s in enumerate(self.site_ids)}
        self.code_to_site = {i: s for i, s in enumerate(self.site_ids)}
        
        # Historical priors (fitted on training data)
        self.base_date = pd.Timestamp("2022-01-01")
        self.site_stats: Dict[str, Dict[str, float]] = {}
        self.site_hour_stats: Dict[str, Dict[int, float]] = {}
        self.site_dow_stats: Dict[str, Dict[int, float]] = {}
        self.is_fitted = False

    def fit(self, train_df: pd.DataFrame) -> "FeatureEngineer":
        """Fits historical prior statistics strictly on training data."""
        if not self.site_ids:
            self.site_ids = sorted(train_df["Site_ID"].unique().tolist())
            self.site_to_code = {s: i for i, s in enumerate(self.site_ids)}
            self.code_to_site = {i: s for i, s in enumerate(self.site_ids)}

        if "Parsed_Date" in train_df.columns:
            self.base_date = train_df["Parsed_Date"].min()

        # Compute site-level statistics
        for site_id, grp in train_df.groupby("Site_ID"):
            self.site_stats[site_id] = {
                "mean": float(grp["Crowd_Count"].mean()),
                "median": float(grp["Crowd_Count"].median()),
                "std": float(grp["Crowd_Count"].std()) if len(grp) > 1 else 100.0,
                "max": float(grp["Crowd_Count"].max()),
                "p95": float(grp["Crowd_Count"].quantile(0.95)),
                "p99": float(grp["Crowd_Count"].quantile(0.99))
            }
            
            # Hour of day means
            h_means = grp.groupby("Hour")["Crowd_Count"].mean().to_dict()
            self.site_hour_stats[site_id] = {int(h): float(m) for h, m in h_means.items()}
            
            # Day of week means
            dow = grp["Parsed_Date"].dt.dayofweek
            d_means = grp.groupby(dow)["Crowd_Count"].mean().to_dict()
            self.site_dow_stats[site_id] = {int(d): float(m) for d, m in d_means.items()}

        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        """Transforms cleaned dataframe into feature matrix."""
        data = df.copy()
        
        # Ensure Parsed_Date exists
        if "Parsed_Date" not in data.columns:
            data["Parsed_Date"] = pd.to_datetime(data["Date"], errors="coerce")
        
        # Temporal elements
        data["Year"] = data["Parsed_Date"].dt.year
        data["Month"] = data["Parsed_Date"].dt.month
        data["Day"] = data["Parsed_Date"].dt.day
        data["DayOfWeek"] = data["Parsed_Date"].dt.dayofweek
        data["DayOfYear"] = data["Parsed_Date"].dt.dayofyear
        data["WeekOfYear"] = data["Parsed_Date"].dt.isocalendar().week.astype(int)
        data["DaysSinceStart"] = (data["Parsed_Date"] - self.base_date).dt.days.clip(lower=0)

        # Weekend indicator
        data["Is_Weekend"] = data["DayOfWeek"].isin([5, 6]).astype(int)

        # Cyclical transformations
        time_hour = data["Hour"] + (data["Minute"] if "Minute" in data.columns else 0) / 60.0
        data["sin_hour"] = np.sin(2 * np.pi * time_hour / 24.0)
        data["cos_hour"] = np.cos(2 * np.pi * time_hour / 24.0)
        data["sin_month"] = np.sin(2 * np.pi * data["Month"] / 12.0)
        data["cos_month"] = np.cos(2 * np.pi * data["Month"] / 12.0)
        data["sin_dayofweek"] = np.sin(2 * np.pi * data["DayOfWeek"] / 7.0)
        data["cos_dayofweek"] = np.cos(2 * np.pi * data["DayOfWeek"] / 7.0)

        # Categorical codes
        data["site_code"] = data["Site_ID"].map(lambda s: self.site_to_code.get(s, -1))
        data["weather_code"] = data["Weather"].map(lambda w: self.WEATHER_MAP.get(w, 0))

        # Default holiday / event flags if missing
        if "Is_Holiday" not in data.columns:
            data["Is_Holiday"] = 0
        if "Is_Event" not in data.columns:
            data["Is_Event"] = 0
        if "Temperature" not in data.columns:
            data["Temperature"] = 25.0

        # Site historical priors lookup
        def get_site_stat(site, key, default):
            return self.site_stats.get(site, {}).get(key, default)

        def get_hour_stat(site, hour):
            site_dict = self.site_hour_stats.get(site, {})
            if hour in site_dict:
                return site_dict[hour]
            return self.site_stats.get(site, {}).get("mean", 500.0)

        def get_dow_stat(site, dow):
            site_dict = self.site_dow_stats.get(site, {})
            if dow in site_dict:
                return site_dict[dow]
            return self.site_stats.get(site, {}).get("mean", 500.0)

        data["site_hist_mean"] = data["Site_ID"].map(lambda s: get_site_stat(s, "mean", 500.0))
        data["site_hist_median"] = data["Site_ID"].map(lambda s: get_site_stat(s, "median", 500.0))
        data["site_hist_std"] = data["Site_ID"].map(lambda s: get_site_stat(s, "std", 100.0))
        
        data["site_hour_mean"] = data.apply(lambda r: get_hour_stat(r["Site_ID"], int(r["Hour"])), axis=1)
        data["site_dow_mean"] = data.apply(lambda r: get_dow_stat(r["Site_ID"], int(r["DayOfWeek"])), axis=1)

        return data[self.FEATURE_COLUMNS]

    def to_dict(self) -> Dict[str, Any]:
        """Serializes preprocessor state for persistence."""
        return {
            "site_ids": self.site_ids,
            "site_to_code": self.site_to_code,
            "base_date": self.base_date.strftime("%Y-%m-%d"),
            "site_stats": self.site_stats,
            "site_hour_stats": {
                s: {str(k): v for k, v in h.items()} for s, h in self.site_hour_stats.items()
            },
            "site_dow_stats": {
                s: {str(k): v for k, v in d.items()} for s, d in self.site_dow_stats.items()
            },
            "feature_columns": self.FEATURE_COLUMNS,
            "is_fitted": self.is_fitted
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "FeatureEngineer":
        """Reconstructs preprocessor from serialized dictionary."""
        fe = cls()
        fe.site_ids = data["site_ids"]
        fe.site_to_code = data["site_to_code"]
        fe.code_to_site = {int(v): k for k, v in fe.site_to_code.items()}
        fe.base_date = pd.Timestamp(data["base_date"])
        fe.site_stats = data["site_stats"]
        fe.site_hour_stats = {
            s: {int(k): v for k, v in h.items()} for s, h in data["site_hour_stats"].items()
        }
        fe.site_dow_stats = {
            s: {int(k): v for k, v in d.items()} for s, d in data["site_dow_stats"].items()
        }
        fe.is_fitted = data.get("is_fitted", True)
        return fe
