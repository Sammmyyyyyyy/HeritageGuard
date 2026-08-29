from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.integrations.crowd_pressure.pressure_client import PressureClient
from app.services.pressure_service import PressureService
from app.schemas.pressure import PressureResponse
from app.exceptions.ai import AIModelNotReady


router = APIRouter(
    prefix="/api/pressure",
    tags=["Heritage Pressure"],
)

service = PressureService(
    PressureClient()
)


@router.get("/{site_id}", response_model=PressureResponse)
async def get_pressure(
    site_id: str,
    predicted_visitors: Optional[float] = Query(default=None, description="Current or peak visitor count"),
    deterioration_score: Optional[float] = Query(default=None, description="Observed deterioration score (0-100)"),
    damage_score: Optional[float] = Query(default=None, description="AI damage score (0-100)"),
):
    try:
        return await service.calculate(
            site_id=site_id,
            predicted_visitors=predicted_visitors,
            observed_deterioration_override=deterioration_score,
            custom_damage_score=damage_score
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIModelNotReady as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")