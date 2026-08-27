from typing import List

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float


class DamageDetection(BaseModel):
    type: str

    confidence: float = Field(
        ge=0.0,
        le=1.0,
    )

    bbox: BoundingBox


class DamageAIResponse(BaseModel):
    site_id: str

    damage_score: float = Field(
        ge=0,
        le=100,
    )

    priority: str

    detections: List[
        DamageDetection
    ]


class DamageAnalysisResponse(BaseModel):
    success: bool = True
    data: DamageAIResponse