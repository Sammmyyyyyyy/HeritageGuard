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

        raw_base = getattr(settings, "RAG_AI_URL", None) or "http://127.0.0.1:8001"
        base_url = str(raw_base).strip().rstrip("/")
        if not base_url:
            base_url = "http://127.0.0.1:8001"
        if not base_url.startswith("http://") and not base_url.startswith("https://"):
            base_url = f"http://{base_url}"

        endpoint = getattr(settings, "RAG_AI_ENDPOINT", "/api/rag/query") or "/api/rag/query"
        endpoint = str(endpoint).strip()
        if not endpoint.startswith("/"):
            endpoint = f"/{endpoint}"

        url = f"{base_url}{endpoint}"

        payload = {
            "site_id": site_id,
            "question": question,
            "language": language,
        }

        urls_to_try = [url]
        for fallback in [
            "https://heritageguard-rag-reco.onrender.com/api/rag/query",
            "http://127.0.0.1:8001/api/rag/query",
            "http://localhost:8001/api/rag/query",
        ]:
            if fallback not in urls_to_try:
                urls_to_try.append(fallback)

        last_error = None
        result = None

        for target_url in urls_to_try:
            try:
                async with httpx.AsyncClient(
                    timeout=settings.AI_TIMEOUT
                ) as client:

                    response = await client.post(
                        target_url,
                        json=payload,
                    )

                    response.raise_for_status()
                    result = response.json()
                    last_error = None
                    break

            except httpx.TimeoutException as exc:
                raise AIServiceTimeout("RAG AI request timed out") from exc

            except httpx.HTTPError as exc:
                last_error = exc
                continue

            except ValueError as exc:
                raise InvalidAIResponse() from exc

        if last_error is not None:
            raise AIServiceUnavailable(
                f"RAG AI request failed: {last_error}"
            ) from last_error

        if not isinstance(result, dict):
            raise InvalidAIResponse()

        return result