"""Data models and risk classifications for Heritage Pressure Scoring."""

from enum import Enum
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field


class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class PressureFactors(BaseModel):
    """Component factors contributing to total Heritage Pressure Score."""
    
    visitor_pressure: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Dynamic strain from visitor density and capacity utilization (0-100)"
    )
    physical_vulnerability: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Intrinsic architectural vulnerability and material sensitivity (0-100)"
    )
    recent_deterioration: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Observed material erosion, micro-cracks, and weathering (0-100)"
    )
    maintenance_delay: Optional[float] = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Deferred conservation and maintenance backlog pressure (0-100)"
    )
    historical_importance: Optional[float] = Field(
        default=50.0,
        ge=0.0,
        le=100.0,
        description="Conservation priority weight based on UNESCO/national status (0-100)"
    )

    def to_dict(self) -> Dict[str, float]:
        return {
            "visitor_pressure": round(self.visitor_pressure, 1),
            "physical_vulnerability": round(self.physical_vulnerability, 1),
            "recent_deterioration": round(self.recent_deterioration, 1),
            "maintenance_delay": round(self.maintenance_delay or 0.0, 1),
            "historical_importance": round(self.historical_importance or 50.0, 1)
        }
