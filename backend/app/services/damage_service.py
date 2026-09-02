import logging
from typing import Any, Dict

from app.db.storage import upload_image
from app.exceptions.base import AppException
from app.exceptions.ai import AIServiceUnavailable, AIServiceTimeout
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

logger = logging.getLogger("heritageguard.damage_service")


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
        # 2. Send image to Damage AI (No fake fallbacks)
        # -----------------------------------------

        try:
            result = await self.ai_client.analyze(
                image_bytes=image_bytes,
                filename=file.filename or "image.jpg",
                site_id=site_id,
                content_type=file.content_type or "image/jpeg",
            )
        except AppException:
            # Propagate AIServiceUnavailable, AIServiceTimeout, etc. directly
            raise
        except Exception as exc:
            logger.error(f"[DamageService] Damage AI call failed: {exc}", exc_info=True)
            raise AIServiceUnavailable(
                f"Damage AI service is currently unavailable. Please try again in a moment. ({exc})"
            ) from exc

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

        damage_score = float(result.get("damage_score", 0.0))
        priority = str(result.get("priority", "LOW"))
        confidence = result.get("confidence")
        damage_status = result.get("damage_status") or ("no_damage" if not result.get("detections") else "low")
        detections = result.get("detections", [])

        report_data = {
            "site_id": site_id,
            "damage_score": damage_score,
            "priority": priority,
            "image_url": image_url,
            "detections": detections,
        }

        # -----------------------------------------
        # 5. Save damage report (Safe persistence)
        # -----------------------------------------

        report = None
        try:
            report = self.damage_repository.create(report_data)
        except Exception as exc:
            logger.warning(f"Notice: Failed to persist damage report to database ({exc}), generating in-memory record.")
            report = {
                "id": f"REP-{unique_id}",
                "site_id": site_id,
                "damage_score": damage_score,
                "priority": priority,
                "image_url": image_url,
                "detections": detections,
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
            }

        # -----------------------------------------
        # 6. Create alert for serious damage (Safe persistence)
        # -----------------------------------------

        if priority in {"HIGH", "CRITICAL"} and damage_score >= 40.0:
            try:
                self.alert_repository.create(
                    {
                        "site_id": site_id,
                        "alert_type": "DAMAGE",
                        "severity": priority,
                        "title": "Heritage Damage Detected",
                        "message": (
                            f"AI detected {priority.lower()} damage risk (Score: {damage_score}) at site {site_id}"
                        ),
                    }
                )
            except Exception as exc:
                logger.warning(f"Notice: Failed to log damage alert ({exc})")

        # -----------------------------------------
        # 7. Return response
        # -----------------------------------------

        return {
            "success": True,
            "site_id": site_id,
            "damage_score": damage_score,
            "confidence": confidence,
            "priority": priority,
            "damage_status": damage_status,
            "detections": detections,
            "image_url": image_url,
            "report": report,
        }