from fastapi import UploadFile

from app.core.constants import (
    ALLOWED_IMAGE_TYPES,
)
from app.core.config import settings
from app.exceptions.damage import (
    ImageTooLarge,
    InvalidImage,
)


async def validate_image(
    file: UploadFile,
) -> bytes:

    if (
        file.content_type
        not in ALLOWED_IMAGE_TYPES
    ):
        raise InvalidImage(
            "Only JPEG, PNG and WEBP images are supported"
        )

    content = await file.read()

    if len(content) > settings.MAX_UPLOAD_SIZE:
        raise ImageTooLarge()

    if not content:
        raise InvalidImage(
            "Uploaded image is empty"
        )

    return content