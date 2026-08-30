from typing import Any, Dict

from app.db.storage import upload_image
from app.integrations.damage.client import (
    DamageAIClient,
)
from app.repositories.damage_repository import (
    DamageRepository,
)
from app.repositories.alert_repository import (
    AlertRepository,
)
from app.utils.files import validate_image


class DamageService:

    def __init__(
        self,
        ai_client: DamageAIClient,
        damage_repository: DamageRepository,
        alert_repository: AlertRepository,
    ):
        self.ai_client = ai_client
        self.damage_repository = damage_repository
        self.alert_repository = alert_repository

    async def analyze(
        self,
        file,
        site_id: str,
    ) -> Dict[str, Any]:

        # -----------------------------------------
        # 1. Validate image
        # -----------------------------------------

        image_bytes = await validate_image(file)

        # -----------------------------------------
        # 2. Send image to Damage AI
        # -----------------------------------------

        result = await self.ai_client.analyze(
            image_bytes=image_bytes,
            filename=file.filename or "image.jpg",
            site_id=site_id,
            content_type=file.content_type or "image/jpeg",
        )

        # -----------------------------------------
        # 3. Upload image to Supabase Storage
        # -----------------------------------------

        import time
        import uuid

        raw_filename = file.filename or 'image.jpg'
        unique_id = f"{int(time.time())}_{uuid.uuid4().hex[:6]}"

        if "." in raw_filename:
            base_name, ext = raw_filename.rsplit(".", 1)
            unique_filename = f"{base_name}_{unique_id}.{ext}"
        else:
            unique_filename = f"{raw_filename}_{unique_id}.jpg"

        image_path = f"{site_id}/{unique_filename}"

        image_url = upload_image(
            image_bytes,
            image_path,
            file.content_type or "image/jpeg",
        )

        # -----------------------------------------
        # 4. Prepare database record
        # -----------------------------------------

        report_data = {
            "site_id": site_id,
            "damage_score": result["damage_score"],
            "priority": result["priority"],
            "image_url": image_url,
            "detections": result["detections"],
        }

        # -----------------------------------------
        # 5. Save damage report
        # -----------------------------------------

        report = self.damage_repository.create(
            report_data
        )

        # -----------------------------------------
        # 6. Create alert for serious damage
        # -----------------------------------------

        if result["priority"] in {
            "HIGH",
            "CRITICAL",
        }:

            self.alert_repository.create(
                {
                    "site_id": site_id,
                    "alert_type": "DAMAGE",
                    "severity": result["priority"],
                    "title": "Heritage Damage Detected",
                    "message": (
                        f"AI detected "
                        f"{result['priority'].lower()} "
                        f"damage risk at site {site_id}"
                    ),
                }
            )

        # -----------------------------------------
        # 7. Return response
        # -----------------------------------------

        return {
            **result,
            "image_url": image_url,
            "report": report,
        }