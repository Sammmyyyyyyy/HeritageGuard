from app.integrations.crowd_pressure.crowd_client import (
    CrowdClient,
)


class CrowdService:

    def __init__(
        self,
        client: CrowdClient,
    ):
        self.client = client

    async def predict(
        self,
        site_id: str,
    ):
        return await self.client.predict(
            site_id
        )