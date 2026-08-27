from typing import Any, Dict

from app.integrations.recommendation.client import (
    RecommendationAIClient,
)


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

        result = await self.ai_client.recommend(
            payload
        )

        return result