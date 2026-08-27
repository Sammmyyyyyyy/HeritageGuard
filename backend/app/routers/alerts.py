from fastapi import APIRouter

from app.repositories.alert_repository import (
    AlertRepository,
)
from app.services.alert_service import (
    AlertService,
)


router = APIRouter(
    prefix="/api/alerts",
    tags=["Alerts"],
)

service = AlertService(
    AlertRepository()
)


@router.get("")
def get_alerts(
    site_id: str | None = None,
):
    return service.get_alerts(site_id)


@router.post("")
def create_alert(data: dict):
    return service.create_alert(data)


@router.patch("/{alert_id}/resolve")
def resolve_alert(
    alert_id: str,
):
    return service.resolve(alert_id)