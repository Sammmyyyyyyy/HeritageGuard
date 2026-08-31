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

        raw_base = getattr(settings, "RECOMMENDATION_AI_URL", None) or "https://heritageguard-rag-reco.onrender.com"
        base_url = str(raw_base).strip().rstrip("/")
        if not base_url.startswith("http://") and not base_url.startswith("https://"):
            base_url = f"https://{base_url}"

        endpoint = getattr(settings, "RECOMMENDATION_AI_ENDPOINT", "/api/recommend") or "/api/recommend"
        endpoint = str(endpoint).strip()
        if not endpoint.startswith("/"):
            endpoint = f"/{endpoint}"

        primary_url = f"{base_url}{endpoint}"

        urls_to_try = [primary_url]
        for fallback in [
            "https://heritageguard-rag-reco.onrender.com/api/recommend",
            "http://127.0.0.1:8001/api/recommend",
            "http://localhost:8001/api/recommend",
        ]:
            if fallback not in urls_to_try:
                urls_to_try.append(fallback)

        timeout = getattr(settings, "AI_TIMEOUT", 30.0)
        last_error = None
        result = None

        for target_url in urls_to_try:
            try:
                async with httpx.AsyncClient(timeout=httpx.Timeout(timeout)) as client:
                    response = await client.post(
                        target_url,
                        json=payload,
                        headers={"Content-Type": "application/json"},
                    )
                    response.raise_for_status()
                    result = response.json()
                    last_error = None
                    break
            except httpx.TimeoutException as exc:
                last_error = exc
                continue
            except httpx.HTTPError as exc:
                last_error = exc
                continue
            except ValueError as exc:
                last_error = exc
                continue

        if result is None:
            if isinstance(last_error, httpx.TimeoutException):
                raise AIServiceTimeout(f"Recommendation AI timed out after {timeout}s") from last_error
            raise AIServiceUnavailable(f"Recommendation AI request failed: {last_error}")

        if not isinstance(result, dict):
            raise InvalidAIResponse("AI response is not a valid JSON object")

        return result