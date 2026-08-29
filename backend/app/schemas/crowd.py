from typing import List, Optional
from pydantic import BaseModel, Field


class HourlyPrediction(BaseModel):
    time: str
    crowd_percent: int = Field(ge=0, le=100)
    expected_visitors: int = Field(ge=0)


class CrowdPredictionRequest(BaseModel):
    site_id: str
    date: Optional[str] = None
    weather: Optional[str] = None
    temperature: Optional[float] = None


class CrowdPredictionResponse(BaseModel):
    site_id: str
    site_name: str
    city: str
    state: str
    date: str
    day_of_week: str
    operating_hours: str
    weather: str
    temperature_c: float
    safe_capacity: int
    daily_expected_total: int
    predictions: List[HourlyPrediction]
    peak_hours: List[str]
    best_time: str