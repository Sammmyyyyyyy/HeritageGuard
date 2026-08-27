from app.exceptions.base import AppException


class DatabaseError(AppException):

    def __init__(
        self,
        message: str = "Database operation failed",
    ):
        super().__init__(
            code="DATABASE_ERROR",
            message=message,
            status_code=500,
        )