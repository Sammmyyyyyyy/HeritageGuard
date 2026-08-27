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

        url = (
            f"{settings.DAMAGE_AI_URL}"
            f"{settings.DAMAGE_AI_ENDPOINT}"
        )

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
                    url,
                    files=files,
                    data=data,
                )

                response.raise_for_status()

                result = response.json()

        except httpx.TimeoutException as exc:
            raise AIServiceTimeout() from exc

        except httpx.HTTPError as exc:
            raise AIServiceUnavailable(
                f"Damage AI request failed: {exc}"
            ) from exc

        except ValueError as exc:
            raise InvalidAIResponse() from exc

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