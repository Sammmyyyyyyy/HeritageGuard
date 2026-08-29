from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class AlertCreate(BaseModel):
    site_id: str = Field(..., min_length=1)

    title: str = Field(..., min_length=1)

    alert_type: str = Field(..., min_length=1)

    severity: str = Field(
        ...,
        pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$"
    )

    message: str = Field(..., min_length=1)


class AlertUpdate(BaseModel):
    is_resolved: Optional[bool] = None


class AlertResponse(BaseModel):
    id: Optional[str] = None

    site_id: str

    title: str

    alert_type: str

    severity: str

    message: str

    is_resolved: bool = False

    created_at: Optional[datetime] = None

    resolved_at: Optional[datetime] = None