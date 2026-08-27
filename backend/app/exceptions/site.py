from app.exceptions.base import AppException


class SiteNotFound(AppException):

    def __init__(self, site_id: str):
        super().__init__(
            code="SITE_NOT_FOUND",
            message=f"Site '{site_id}' not found",
            status_code=404,
        )