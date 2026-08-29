from typing import Optional, Dict, Any
from pydantic import BaseModel, Field


class PressureFactors(BaseModel):
    visitor_pressure: float = Field(ge=0, le=100)
    physical_vulnerability: float = Field(ge=0, le=100)
    recent_deterioration: float = Field(ge=0, le=100)
    maintenance_delay: Optional[float] = Field(default=None, ge=0, le=100)
    historical_importance: Optional[float] = Field(default=None, ge=0, le=100)


class PressureResponse(BaseModel):
    site_id: str
    site_name: Optional[str] = None
    pressure_score: float = Field(ge=0, le=100)
    risk: str
    factors: PressureFactors
    metadata: Optional[Dict[str, Any]] = None