from typing import List

from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.integrations.recommendation.client import (
    RecommendationAIClient,
)
from app.services.recommendations_service import (
    RecommendationService,
)


router = APIRouter(
    prefix="/api/recommendation",
    tags=["Recommendation"],
)


recommendation_service = RecommendationService(
    ai_client=RecommendationAIClient()
)


class Coordinates(BaseModel):

    lat: float = Field(
        ...,
        example=28.6139,
    )

    lng: float = Field(
        ...,
        example=77.2090,
    )


class RecommendationRequest(BaseModel):

    starting_coords: Coordinates

    start_time: str = Field(
        default="10:00",
        example="10:00",
    )

    available_time_minutes: int = Field(
        default=240,
        example=240,
    )

    budget: int = Field(
        default=500,
        example=500,
    )

    interests: List[str] = Field(
        default=["history", "architecture"],
        example=["history", "architecture"],
    )

    crowd_tolerance: float = Field(
        default=0.3,
        example=0.3,
    )


@router.post("")
async def get_recommendation(
    request: RecommendationRequest,
):

    payload = request.model_dump()

    return await recommendation_service.recommend(
        payload
    )