"""
Output contract and schemas for HeritageGuard Crowd & Pressure Model.
Provides a stable, decoupled interface for the backend API.
"""

from enum import Enum
from typing import List, Union
from pydantic import BaseModel, Field


class RiskCategory(str, Enum):
    """Risk category indicating the heritage pressure level."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class CrowdPrediction(BaseModel):
    """Hourly time and crowd density percentage prediction."""
    time: str = Field(..., description="Time slot or hour (e.g., '11:00')", examples=["11:00"])
    crowd_percent: int = Field(..., ge=0, le=100, description="Predicted crowd occupancy percentage (0-100%)", examples=[64])


class HeritageModelOutput(BaseModel):
    """
    Stable output contract for the HeritageGuard Model.
    The backend connects against this schema. Internal model calculations
    and features are kept private and not exposed in this contract.
    """
    site_id: str = Field(..., description="Unique identifier for the heritage site", examples=["SITE_001"])
    predictions: List[CrowdPrediction] = Field(..., description="Array of time and crowd percentage prediction objects")
    best_time: str = Field(..., description="Recommended lower-crowd visiting time slot", examples=["15:00-16:00"])
    pressure_score: Union[int, float] = Field(..., ge=0, le=100, description="Computed Heritage Pressure Score (0-100)", examples=[91])
    risk: RiskCategory = Field(..., description="Categorical risk assessment (LOW, MEDIUM, HIGH)", examples=[RiskCategory.HIGH])

    model_config = {
        "json_schema_extra": {
            "example": {
                "site_id": "SITE_001",
                "predictions": [
                    {"time": "06:00", "crowd_percent": 15},
                    {"time": "07:00", "crowd_percent": 28},
                    {"time": "08:00", "crowd_percent": 42},
                    {"time": "09:00", "crowd_percent": 58},
                    {"time": "10:00", "crowd_percent": 76},
                    {"time": "11:00", "crowd_percent": 88},
                    {"time": "12:00", "crowd_percent": 74},
                    {"time": "13:00", "crowd_percent": 48},
                    {"time": "14:00", "crowd_percent": 54},
                    {"time": "15:00", "crowd_percent": 78},
                    {"time": "16:00", "crowd_percent": 70},
                    {"time": "17:00", "crowd_percent": 35}
                ],
                "best_time": "06:00-08:00",
                "pressure_score": 91,
                "risk": "HIGH"
            }
        }
    }


def get_sample_response(site_id: str = "SITE_001") -> HeritageModelOutput:
    """
    Returns a sample contract-compliant response for testing and backend integration.
    """
    return HeritageModelOutput(
        site_id=site_id,
        predictions=[
            CrowdPrediction(time="06:00", crowd_percent=15),
            CrowdPrediction(time="07:00", crowd_percent=28),
            CrowdPrediction(time="08:00", crowd_percent=42),
            CrowdPrediction(time="09:00", crowd_percent=58),
            CrowdPrediction(time="10:00", crowd_percent=76),
            CrowdPrediction(time="11:00", crowd_percent=88),
            CrowdPrediction(time="12:00", crowd_percent=74),
            CrowdPrediction(time="13:00", crowd_percent=48),
            CrowdPrediction(time="14:00", crowd_percent=54),
            CrowdPrediction(time="15:00", crowd_percent=78),
            CrowdPrediction(time="16:00", crowd_percent=70),
            CrowdPrediction(time="17:00", crowd_percent=35),
        ],
        best_time="06:00-08:00",
        pressure_score=91,
        risk=RiskCategory.HIGH,
    )


def predict_crowd(site_id: str) -> HeritageModelOutput:
    """
    Main public inference entrypoint for the HeritageGuard Crowd & Pressure Model.
    Currently delegates to get_sample_response(site_id).
    The actual ML inference pipeline will replace this internal implementation later,
    while maintaining this exact stable signature and HeritageModelOutput return type.
    """
    return get_sample_response(site_id)


if __name__ == "__main__":
    import json
    sample = predict_crowd("SITE_001")
    print(json.dumps(sample.model_dump(), indent=2))
