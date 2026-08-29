from typing import Optional
from app.integrations.crowd_pressure.crowd_client import CrowdClient


class CrowdService:

    def __init__(
        self,
        client: CrowdClient,
    ):
        self.client = client

    async def predict(
        self,
        site_id: str,
        date: Optional[str] = None,
        weather: Optional[str] = None,
        temperature: Optional[float] = None
    ):
        return await self.client.predict(
            site_id=site_id,
            date=date,
            weather=weather,
            temperature=temperature
        )