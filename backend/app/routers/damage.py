from fastapi import APIRouter, File, UploadFile

from app.integrations.damage.client import DamageAIClient
from app.repositories.damage_repository import DamageRepository
from app.repositories.alert_repository import AlertRepository
from app.services.damage_service import DamageService


router = APIRouter(
    prefix="/api/damage",
    tags=["Damage Analysis"],
)


damage_service = DamageService(
    ai_client=DamageAIClient(),
    damage_repository=DamageRepository(),
    alert_repository=AlertRepository(),
)


@router.post("/{site_id}/analyze")
async def analyze_damage(
    site_id: str,
    file: UploadFile = File(...),
):
    """
    Analyze a heritage monument image.

    Flow:

    Frontend
        ↓
    Upload image
        ↓
    Damage AI
        ↓
    Damage result
        ↓
    Save report
        ↓
    Create alert if HIGH/CRITICAL
    """

    return await damage_service.analyze(
        file=file,
        site_id=site_id,
    )