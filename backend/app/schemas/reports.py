from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class ReportCreate(BaseModel):
    site_id: str

    damage_score: float = Field(
        ge=0,
        le=100,
    )

    priority: str

    image_url: Optional[str] = None

    detections: List[dict] = Field(
        default_factory=list
    )

    notes: Optional[str] = None


class ReportResponse(BaseModel):
    id: Optional[str] = None

    site_id: str

    damage_score: float = Field(
        ge=0,
        le=100,
    )

    priority: str

    image_url: Optional[str] = None

    detections: List[dict] = Field(
        default_factory=list
    )

    notes: Optional[str] = None

    created_at: Optional[datetime] = None