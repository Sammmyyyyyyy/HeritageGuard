from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.integrations.crowd_pressure.crowd_client import CrowdClient
from app.services.crowd_service import CrowdService
from app.schemas.crowd import CrowdPredictionRequest, CrowdPredictionResponse
from app.exceptions.ai import AIModelNotReady


router = APIRouter(
    prefix="/api/crowd",
    tags=["Crowd"],
)

service = CrowdService(
    CrowdClient()
)


@router.get("/{site_id}", response_model=CrowdPredictionResponse)
async def get_crowd(
    site_id: str,
    date: Optional[str] = Query(default=None, description="Target date in YYYY-MM-DD"),
    weather: Optional[str] = Query(default=None, description="Weather override"),
    temperature: Optional[float] = Query(default=None, description="Temperature override in °C"),
):
    try:
        return await service.predict(
            site_id=site_id,
            date=date,
            weather=weather,
            temperature=temperature
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIModelNotReady as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")


@router.post("/predict", response_model=CrowdPredictionResponse)
async def predict_crowd_post(
    body: CrowdPredictionRequest,
):
    try:
        return await service.predict(
            site_id=body.site_id,
            date=body.date,
            weather=body.weather,
            temperature=body.temperature
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except AIModelNotReady as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {e}")