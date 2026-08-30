from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from app.repositories.itinerary_repository import ItineraryRepository
from app.schemas.itinerary import ItineraryCreate
from app.services.itinerary_service import ItineraryService
from app.integrations.recommendation.client import RecommendationAIClient

router = APIRouter(
    prefix="/api/itineraries",
    tags=["Itineraries"],
)

# Dependency Factory Functions (Reloading Safety)
def get_repository() -> ItineraryRepository:
    return ItineraryRepository()

def get_ai_client() -> RecommendationAIClient:
    return RecommendationAIClient()

def get_service(
    repo: ItineraryRepository = Depends(get_repository),
    client: RecommendationAIClient = Depends(get_ai_client),
) -> ItineraryService:
    return ItineraryService(repository=repo, client=client)


@router.post("")
async def create_itinerary(
    itinerary: ItineraryCreate,
    service: ItineraryService = Depends(get_service),
):
    try:
        data = itinerary.model_dump(exclude_none=True)
        return await service.create_itinerary(data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))