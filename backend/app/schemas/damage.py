from typing import List, Optional, Any, Dict

from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    x1: Optional[float] = None
    y1: Optional[float] = None
    x2: Optional[float] = None
    y2: Optional[float] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None


class DamageDetection(BaseModel):
    id: Optional[str] = None
    type: str
    confidence: float = Field(
        ge=0.0,
        le=1.0,
    )
    severity: Optional[str] = None
    description: Optional[str] = None
    area_ratio: Optional[float] = None
    bbox: Optional[Any] = None


class DamageAIResponse(BaseModel):
    site_id: str
    damage_score: float = Field(
        ge=0,
        le=100,
    )
    confidence: Optional[float] = None
    priority: str
    damage_status: Optional[str] = None
    image_url: Optional[str] = None
    detections: List[Any] = []
    report: Optional[Dict[str, Any]] = None


class DamageAnalysisResponse(BaseModel):
    success: bool = True
    data: DamageAIResponse