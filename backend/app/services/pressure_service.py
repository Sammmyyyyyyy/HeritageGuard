from typing import Optional
from app.integrations.crowd_pressure.pressure_client import PressureClient


class PressureService:

    def __init__(
        self,
        client: PressureClient,
    ):
        self.client = client

    async def calculate(
        self,
        site_id: str,
        predicted_visitors: Optional[float] = None,
        observed_deterioration_override: Optional[float] = None,
        custom_damage_score: Optional[float] = None
    ):
        return await self.client.calculate(
            site_id=site_id,
            predicted_visitors=predicted_visitors,
            observed_deterioration_override=observed_deterioration_override,
            custom_damage_score=custom_damage_score
        )