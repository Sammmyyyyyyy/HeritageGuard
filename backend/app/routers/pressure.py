from fastapi import APIRouter

from app.integrations.crowd_pressure.pressure_client import (
    PressureClient,
)
from app.services.pressure_service import (
    PressureService,
)


router = APIRouter(
    prefix="/api/pressure",
    tags=["Heritage Pressure"],
)

service = PressureService(
    PressureClient()
)


@router.get("/{site_id}")
async def get_pressure(
    site_id: str,
):
    return await service.calculate(
        site_id
    )