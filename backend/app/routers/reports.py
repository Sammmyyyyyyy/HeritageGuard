from fastapi import APIRouter

from app.repositories.report_repository import (
    ReportRepository,
)
from app.services.report_service import (
    ReportService,
)


router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)

service = ReportService(
    ReportRepository()
)


@router.get("/{site_id}")
def get_reports(site_id: str):
    return service.get_site_reports(
        site_id
    )