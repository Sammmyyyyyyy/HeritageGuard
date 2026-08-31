from typing import Any, Dict

import httpx

from app.core.config import settings
from app.exceptions.ai import (
    AIServiceTimeout,
    AIServiceUnavailable,
    InvalidAIResponse,
)


class RAGAIClient:

    async def ask(
        self,
        site_id: str,
        question: str,
        language: str = "English",
    ) -> Dict[str, Any]:

        base_url = settings.RAG_AI_URL.rstrip("/")
        endpoint = settings.RAG_AI_ENDPOINT
        if not endpoint.startswith("/"):
            endpoint = f"/{endpoint}"
        url = f"{base_url}{endpoint}"

        payload = {
            "site_id": site_id,
            "question": question,
            "language": language,
        }

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
            raise AIServiceTimeout("RAG AI request timed out") from exc

        except httpx.HTTPError as exc:
            raise AIServiceUnavailable(
                f"RAG AI request failed: {exc}"
            ) from exc

        except ValueError as exc:
            raise InvalidAIResponse() from exc

        if not isinstance(result, dict):
            raise InvalidAIResponse()

        return result