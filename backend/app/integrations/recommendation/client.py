from typing import Any, Dict

import httpx

from app.core.config import settings
from app.exceptions.ai import (
    AIServiceTimeout,
    AIServiceUnavailable,
    InvalidAIResponse,
)


class RecommendationAIClient:

    async def recommend(
        self,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:

        url = (
            f"{settings.RECOMMENDATION_AI_URL}"
            f"{settings.RECOMMENDATION_AI_ENDPOINT}"
        )

        try:
            async with httpx.AsyncClient(
                timeout=settings.AI_TIMEOUT
            ) as client:

                response = await client.post(
                    url,
                    json=payload,
                )

                response.raise_for_status()
                result = response.json()

        except httpx.TimeoutException as exc:
            raise AIServiceTimeout() from exc

        except httpx.HTTPError as exc:
            raise AIServiceUnavailable(
                f"Recommendation AI request failed: {exc}"
            ) from exc

        except ValueError as exc:
            raise InvalidAIResponse() from exc

        if not isinstance(result, dict):
            raise InvalidAIResponse()

        return result