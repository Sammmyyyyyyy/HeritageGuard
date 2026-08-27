from typing import List

from pydantic import BaseModel, Field


class Coordinates(BaseModel):

    lat: float
    lng: float


class RecommendationRequest(BaseModel):

    starting_coords: Coordinates

    start_time: str = "10:00"

    available_time_minutes: int = Field(
        default=240,
        gt=0,
    )

    budget: int = Field(
        default=500,
        ge=0,
    )

    interests: List[str] = Field(
        default_factory=lambda: [
            "history",
            "architecture",
        ]
    )

    crowd_tolerance: float = Field(
        default=0.3,
        ge=0,
        le=1,
    )