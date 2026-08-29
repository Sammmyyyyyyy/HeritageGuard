from app.repositories.report_repository import ReportRepository


class ReportService:

    def __init__(self, repository: ReportRepository):
        self.repository = repository

    def get_reports(self, site_id: str | None = None):
        return self.repository.get_all(site_id)

    def get_site_reports(self, site_id: str):
        return self.repository.get_by_site(site_id)

    # NAYA ADD HUA: Service method
    def create_report(self, data: dict):
        return self.repository.create(data)