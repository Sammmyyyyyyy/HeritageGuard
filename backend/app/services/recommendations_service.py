from typing import Any, Dict

from app.integrations.recommendation.client import (
    RecommendationAIClient,
)
from app.services.itinerary_service import generate_fallback_itinerary


class RecommendationService:

    def __init__(
        self,
        ai_client: RecommendationAIClient,
    ):
        self.ai_client = ai_client

    async def recommend(
        self,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:

        try:
            return await self.ai_client.recommend(payload)
        except Exception as exc:
            print(f"[RecommendationService] Warning: Remote Recommendation AI failed ({exc}), engaging fallback.")
            starting_site_id = payload.get("starting_site_id") or "DEL001"
            destination_site_id = payload.get("destination_site_id") or starting_site_id
            return generate_fallback_itinerary(
                starting_site_id=starting_site_id,
                destination_site_id=destination_site_id,
                start_time_str=payload.get("start_time", "09:00"),
                available_time_mins=int(payload.get("available_time_minutes", 480)),
                budget=int(payload.get("budget", 2000)),
                interests=payload.get("interests", [])
            )