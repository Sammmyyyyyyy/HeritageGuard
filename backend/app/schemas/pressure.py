from pydantic import BaseModel, Field


class PressureFactors(BaseModel):
    visitor_pressure: float = Field(
        ge=0,
        le=100,
    )

    physical_vulnerability: float = Field(
        ge=0,
        le=100,
    )

    recent_deterioration: float = Field(
        ge=0,
        le=100,
    )

    maintenance_delay: float = Field(
        ge=0,
        le=100,
    )

    historical_importance: float = Field(
        ge=0,
        le=100,
    )


class PressureResponse(BaseModel):
    site_id: str
    site_name: str
    pressure_score: float = Field(
        ge=0,
        le=100,
    )
    risk: str
    factors: PressureFactors