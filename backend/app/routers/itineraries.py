from fastapi import APIRouter, HTTPException

from app.repositories.itinerary_repository import (
    ItineraryRepository,
)

from app.schemas.itinerary import (
    ItineraryCreate,
)

from app.services.itinerary_service import (
    ItineraryService,
)


router = APIRouter(
    prefix="/api/itineraries",
    tags=["Itineraries"],
)


repository = ItineraryRepository()
service = ItineraryService(repository)


# =========================================================
# CREATE ITINERARY
# =========================================================

@router.post("")
def create_itinerary(
    itinerary: ItineraryCreate,
):

    try:

        data = itinerary.model_dump(
            exclude_none=True
        )

        return service.create_itinerary(
            data
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


# =========================================================
# GET ITINERARY
# =========================================================

@router.get("/{itinerary_id}")
def get_itinerary(
    itinerary_id: str,
):

    try:

        return service.get_itinerary(
            itinerary_id
        )

    except ValueError as e:

        raise HTTPException(
            status_code=404,
            detail=str(e),
        )