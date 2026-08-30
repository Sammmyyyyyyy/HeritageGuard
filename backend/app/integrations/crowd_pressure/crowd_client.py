from typing import Any, Dict, Optional
import httpx

from app.core.config import settings
from ai.crowd.crowd_service import get_crowd_service
from app.exceptions.ai import AIModelNotReady


class CrowdClient:

    def __init__(self):
        self.base_url = settings.CROWD_AI_URL
        self.timeout = settings.AI_TIMEOUT

    async def predict(
        self,
        site_id: str,
        date: Optional[str] = None,
        weather: Optional[str] = None,
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        # Fast local in-process inference first for maximum performance
        try:
            service = get_crowd_service()
            return service.predict_crowd(
                site_id=site_id,
                date=date,
                weather=weather,
                temperature=temperature
            )
        except Exception:
            pass

        # Fallback to HTTP microservice request
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                response = await client.post(
                    f"{self.base_url}/crowd/predict",
                    json={
                        "site_id": site_id,
                        "date": date,
                        "weather": weather,
                        "temperature": temperature
                    }
                )
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 400:
                    detail = response.json().get("detail", "Validation error")
                    raise ValueError(detail)
        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.RequestError):
            pass

        raise AIModelNotReady("Crowd prediction inference failed")