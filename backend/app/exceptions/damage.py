from app.exceptions.base import AppException


class InvalidImage(AppException):

    def __init__(
        self,
        message: str = "Invalid image file",
    ):
        super().__init__(
            code="INVALID_IMAGE",
            message=message,
            status_code=400,
        )


class ImageTooLarge(AppException):

    def __init__(
        self,
        message: str = "Image size exceeds the allowed limit",
    ):
        super().__init__(
            code="IMAGE_TOO_LARGE",
            message=message,
            status_code=413,
        )