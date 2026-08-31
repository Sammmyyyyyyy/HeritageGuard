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
        # Fast local in-process calculation first for maximum performance
        try:
            service = get_pressure_service()
            return service.calculate_pressure(
                site_id=site_id,
                predicted_visitors=predicted_visitors,
                observed_deterioration_override=observed_deterioration_override,
                custom_damage_score=custom_damage_score
            )
        except Exception:
            pass

        # Fallback to HTTP microservice request
        candidate_urls = [
            f"{str(self.base_url).rstrip('/')}/pressure/calculate",
            "https://heritageguard-4.onrender.com/pressure/calculate",
            "http://127.0.0.1:8003/pressure/calculate",
            "http://localhost:8003/pressure/calculate",
        ]

        payload = {
            "site_id": site_id,
            "predicted_visitors": predicted_visitors,
            "deterioration_score": observed_deterioration_override,
            "damage_score": custom_damage_score
        }

        for target_url in candidate_urls:
            try:
                async with httpx.AsyncClient(timeout=4.0) as client:
                    response = await client.post(target_url, json=payload)
                    if response.status_code == 200:
                        return response.json()
                    elif response.status_code == 400:
                        detail = response.json().get("detail", "Validation error")
                        raise ValueError(detail)
            except ValueError:
                raise
            except Exception:
                continue

        raise AIModelNotReady("Heritage pressure calculation failed")