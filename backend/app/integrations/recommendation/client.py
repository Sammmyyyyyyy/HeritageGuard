from typing import Any, Dict
import httpx

from app.core.config import settings
from app.exceptions.ai import (
    AIServiceTimeout,
    AIServiceUnavailable,
    InvalidAIResponse,
)


class RecommendationAIClient:

    def __init__(self):
        # Base URL and Endpoint sanitization
        base_url = getattr(settings, "RECOMMENDATION_AI_URL", "http://localhost:8001").rstrip("/")
        endpoint = getattr(settings, "RECOMMENDATION_AI_ENDPOINT", "/api/recommend").lstrip("/")
        self.url = f"{base_url}/{endpoint}"
        
        # Timeout fallback (5-10 sec optimal for AI responses)
        self.timeout = getattr(settings, "AI_TIMEOUT", 10.0)

    async def recommend(
        self,
        payload: Dict[str, Any],
    ) -> Dict[str, Any]:

        try:
            # Explicit timeout limit set for fast failure recovery
            async with httpx.AsyncClient(timeout=httpx.Timeout(self.timeout)) as client:

                response = await client.post(
                    self.url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                )

                response.raise_for_status()
                result = response.json()

        except httpx.TimeoutException as exc:
            raise AIServiceTimeout(
                f"Recommendation AI timed out after {self.timeout}s"
            ) from exc

        except httpx.HTTPStatusError as exc:
            raise AIServiceUnavailable(
                f"Recommendation AI HTTP {exc.response.status_code}: {exc.response.text}"
            ) from exc

        except httpx.HTTPError as exc:
            raise AIServiceUnavailable(
                f"Recommendation AI request failed: {exc}"
            ) from exc

        except ValueError as exc:
            raise InvalidAIResponse("Invalid JSON returned by AI service") from exc

        if not isinstance(result, dict):
            raise InvalidAIResponse("AI response is not a valid JSON object")

        return result