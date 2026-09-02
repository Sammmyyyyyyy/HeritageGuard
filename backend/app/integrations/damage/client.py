import logging
from typing import Any, Dict

import httpx

from app.core.config import settings
from app.exceptions.ai import (
    AIServiceTimeout,
    AIServiceUnavailable,
    InvalidAIResponse,
)

logger = logging.getLogger("heritageguard.damage_client")


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

        # Only add localhost fallback if running locally
        if "localhost" in base_url or "127.0.0.1" in base_url:
            for fallback in [
                "http://127.0.0.1:8002/analyze",
                "http://localhost:8002/analyze",
            ]:
                if fallback not in urls_to_try:
                    urls_to_try.append(fallback)
        elif "heritageguard-2.onrender.com" not in primary_url:
            urls_to_try.append("https://heritageguard-2.onrender.com/analyze")

        last_error = None
        result = None

        timeout_seconds = getattr(settings, "AI_TIMEOUT", 35.0) or 35.0

        for target_url in urls_to_try:
            logger.info(f"[DamageAIClient] Sending analyze request to: {target_url} (site: {site_id})")
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
                    timeout=timeout_seconds
                ) as client:
                    response = await client.post(
                        target_url,
                        files=files,
                        data=data,
                    )
                    response.raise_for_status()
                    result = response.json()
                    last_error = None
                    logger.info(f"[DamageAIClient] Success from {target_url}")
                    break
            except httpx.TimeoutException as exc:
                logger.warning(f"[DamageAIClient] Timeout connecting to {target_url}: {exc}")
                last_error = exc
                continue
            except httpx.HTTPStatusError as exc:
                logger.warning(f"[DamageAIClient] HTTP status error {exc.response.status_code} from {target_url}: {exc}")
                last_error = exc
                continue
            except (httpx.HTTPError, ValueError) as exc:
                logger.warning(f"[DamageAIClient] Connection or JSON error from {target_url}: {exc}")
                last_error = exc
                continue

        if result is None:
            if isinstance(last_error, httpx.TimeoutException):
                raise AIServiceTimeout("Damage AI service request timed out.") from last_error
            raise AIServiceUnavailable(
                f"Damage AI service is currently unavailable. Please try again in a moment. ({last_error})"
            )

        if not isinstance(result, dict):
            raise InvalidAIResponse("Invalid response format received from Damage AI.")

        required = {
            "site_id",
            "damage_score",
            "priority",
            "detections",
        }

        if not required.issubset(result.keys()):
            raise InvalidAIResponse(
                f"Damage AI response missing required keys: {required - result.keys()}"
            )

        return result