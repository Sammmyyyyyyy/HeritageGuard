"""FastAPI Microservice for Crowd Prediction & Heritage Pressure."""

import os
import sys
from typing import Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure project root in python path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ai.crowd.crowd_service import get_crowd_service
from ai.crowd.pressure_service import get_pressure_service


app = FastAPI(
    title="HeritageGuard Crowd & Pressure AI Service",
    description="ML-based site-specific crowd prediction and heritage pressure assessment",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

crowd_service = get_crowd_service()
pressure_service = get_pressure_service()


class CrowdPredictRequest(BaseModel):
    site_id: str = Field(..., example="DEL001", description="Monument ID (e.g. DEL001, BOM001, JAI001, PRA001)")
    date: Optional[str] = Field(default=None, example="2026-09-15", description="Date YYYY-MM-DD")
    weather: Optional[str] = Field(default=None, example="Sunny", description="Weather condition")
    temperature: Optional[float] = Field(default=None, example=30.0, description="Temperature in °C")


class PressureCalculateRequest(BaseModel):
    site_id: str = Field(..., example="DEL001", description="Monument ID")
    predicted_visitors: Optional[float] = Field(default=None, example=12000, description="Peak hourly visitor load")
    deterioration_score: Optional[float] = Field(default=None, description="Observed deterioration score (0-100)")
    damage_score: Optional[float] = Field(default=None, description="AI damage detection score (0-100)")


@app.get("/")
async def root():
    return {
        "status": "running",
        "service": "HeritageGuard Crowd & Heritage Pressure AI",
        "supported_sites": len(crowd_service.predictor.cleaner.site_metadata)
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "model_loaded": crowd_service.predictor.model is not None
    }


@app.post("/crowd/predict")
@app.post("/predict")
async def predict_crowd(req: CrowdPredictRequest):
    try:
        return crowd_service.predict_crowd(
            site_id=req.site_id,
            date=req.date,
            weather=req.weather,
            temperature=req.temperature
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")


@app.get("/crowd/{site_id}")
async def get_site_crowd(
    site_id: str,
    date: Optional[str] = Query(default=None, description="YYYY-MM-DD"),
    weather: Optional[str] = Query(default=None),
    temperature: Optional[float] = Query(default=None)
):
    try:
        return crowd_service.predict_crowd(
            site_id=site_id,
            date=date,
            weather=weather,
            temperature=temperature
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {e}")


@app.get("/pressure/{site_id}")
async def get_site_pressure(
    site_id: str,
    predicted_visitors: Optional[float] = Query(default=None),
    deterioration_score: Optional[float] = Query(default=None),
    damage_score: Optional[float] = Query(default=None)
):
    try:
        return pressure_service.calculate_pressure(
            site_id=site_id,
            predicted_visitors=predicted_visitors,
            observed_deterioration_override=deterioration_score,
            custom_damage_score=damage_score
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {e}")


@app.post("/pressure/calculate")
async def calculate_pressure_post(req: PressureCalculateRequest):
    try:
        return pressure_service.calculate_pressure(
            site_id=req.site_id,
            predicted_visitors=req.predicted_visitors,
            observed_deterioration_override=req.deterioration_score,
            custom_damage_score=req.damage_score
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Calculation error: {e}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8003)
