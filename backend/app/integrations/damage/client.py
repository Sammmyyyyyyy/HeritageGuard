from typing import Any, Dict

import httpx

from app.core.config import settings
from app.exceptions.ai import (
    AIServiceTimeout,
    AIServiceUnavailable,
    InvalidAIResponse,
)


class DamageAIClient:

    async def analyze(
        self,
        image_bytes: bytes,
        filename: str,
        site_id: str,
        content_type: str = "image/jpeg",
    ) -> Dict[str, Any]:

        raw_base = getattr(settings, "DAMAGE_AI_URL", None) or "https://heritageguard-2.onrender.com"
        base_url = str(raw_base).strip().rstrip("/")
        if not base_url.startswith("http://") and not base_url.startswith("https://"):
            base_url = f"https://{base_url}"

        endpoint = getattr(settings, "DAMAGE_AI_ENDPOINT", "/analyze") or "/analyze"
        endpoint = str(endpoint).strip()
        if not endpoint.startswith("/"):
            endpoint = f"/{endpoint}"

        primary_url = f"{base_url}{endpoint}"

        urls_to_try = [primary_url]
        for fallback in [
            "https://heritageguard-2.onrender.com/analyze",
            "http://127.0.0.1:8002/analyze",
            "http://localhost:8002/analyze",
        ]:
            if fallback not in urls_to_try:
                urls_to_try.append(fallback)

        last_error = None
        result = None

        for target_url in urls_to_try:
            files = {
                "file": (
                    filename,
                    image_bytes,
                    content_type,
                )
            }
            data = {
                "site_id": site_id,
            }
            try:
                async with httpx.AsyncClient(
                    timeout=settings.AI_TIMEOUT
                ) as client:
                    response = await client.post(
                        target_url,
                        files=files,
                        data=data,
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
                raise AIServiceTimeout("Damage AI request timed out") from last_error
            raise AIServiceUnavailable(
                f"Damage AI request failed across candidates: {last_error}"
            )

        if not isinstance(result, dict):
            raise InvalidAIResponse()

        required = {
            "site_id",
            "damage_score",
            "priority",
            "detections",
        }

        if not required.issubset(result.keys()):
            raise InvalidAIResponse(
                "Damage AI response is missing required fields"
            )

        return result