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
    ):
        return await self.client.calculate(
            site_id
        )