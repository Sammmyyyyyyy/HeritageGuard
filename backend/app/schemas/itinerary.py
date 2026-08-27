from typing import Any, Dict, Optional

from pydantic import BaseModel, Field


class ItineraryCreate(BaseModel):
    starting_latitude: Optional[float] = None
    starting_longitude: Optional[float] = None

    start_time: Optional[str] = None

    available_time_minutes: Optional[int] = None

    budget: Optional[int] = None

    interests: Optional[Dict[str, Any]] = Field(
        default=None
    )

    crowd_tolerance: Optional[float] = None

    itinerary: Optional[Dict[str, Any]] = Field(
        default=None
    )


class ItineraryResponse(BaseModel):
    id: str

    starting_latitude: Optional[float] = None
    starting_longitude: Optional[float] = None

    start_time: Optional[str] = None

    available_time_minutes: Optional[int] = None

    budget: Optional[int] = None

    interests: Optional[Dict[str, Any]] = None

    crowd_tolerance: Optional[float] = None

    itinerary: Optional[Dict[str, Any]] = None

    created_at: Optional[str] = None