from typing import Any, Dict, Optional
import httpx

from app.core.config import settings
from ai.crowd.pressure_service import get_pressure_service
from app.exceptions.ai import AIModelNotReady


class PressureClient:

    def __init__(self):
        self.base_url = settings.PRESSURE_AI_URL
        self.timeout = settings.AI_TIMEOUT

    async def calculate(
        self,
        site_id: str,
        predicted_visitors: Optional[float] = None,
        observed_deterioration_override: Optional[float] = None,
        custom_damage_score: Optional[float] = None
    ) -> Dict[str, Any]:
        # Try HTTP request to standalone microservice first
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/pressure/calculate",
                    json={
                        "site_id": site_id,
                        "predicted_visitors": predicted_visitors,
                        "deterioration_score": observed_deterioration_override,
                        "damage_score": custom_damage_score
                    }
                )
                if response.status_code == 200:
                    return response.json()
                elif response.status_code == 400:
                    detail = response.json().get("detail", "Validation error")
                    raise ValueError(detail)
        except (httpx.ConnectError, httpx.ConnectTimeout, httpx.RequestError):
            pass

        # Fallback to direct Python service
        try:
            service = get_pressure_service()
            return service.calculate_pressure(
                site_id=site_id,
                predicted_visitors=predicted_visitors,
                observed_deterioration_override=observed_deterioration_override,
                custom_damage_score=custom_damage_score
            )
        except ValueError as e:
            raise e
        except Exception as e:
            raise AIModelNotReady(f"Heritage pressure calculation failed: {e}")
