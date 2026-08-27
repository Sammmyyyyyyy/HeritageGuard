from app.repositories.report_repository import (
    ReportRepository,
)


class ReportService:

    def __init__(
        self,
        repository: ReportRepository,
    ):
        self.repository = repository

    def get_site_reports(
        self,
        site_id: str,
    ):
        return self.repository.get_by_site(
            site_id
        )