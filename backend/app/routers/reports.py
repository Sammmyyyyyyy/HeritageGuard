from fastapi import APIRouter
from app.repositories.report_repository import ReportRepository
from app.services.report_service import ReportService

router = APIRouter(
    prefix="/api/reports",
    tags=["Reports"],
)

service = ReportService(ReportRepository())


@router.get("")
def get_reports(site_id: str | None = None):
    return service.get_reports(site_id)


@router.get("/{site_id}")
def get_site_reports(site_id: str):
    return service.get_site_reports(site_id)


# NAYA ADD HUA: Manual report creation endpoint
@router.post("")
def create_report(data: dict):
    return service.create_report(data)