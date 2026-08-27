from fastapi import APIRouter

from app.integrations.crowd_pressure.crowd_client import CrowdClient
from app.services.crowd_service import (
    CrowdService,
)


router = APIRouter(
    prefix="/api/crowd",
    tags=["Crowd"],
)

service = CrowdService(
    CrowdClient()
)


@router.get("/{site_id}")
async def get_crowd(
    site_id: str,
):
    return await service.predict(
        site_id
    )