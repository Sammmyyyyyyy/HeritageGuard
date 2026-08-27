from typing import Any, Dict

from app.repositories.itinerary_repository import (
    ItineraryRepository,
)


class ItineraryService:

    def __init__(
        self,
        repository: ItineraryRepository,
    ):
        self.repository = repository

    def create_itinerary(
        self,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:

        if not data:
            raise ValueError(
                "Itinerary data cannot be empty"
            )

        return self.repository.create(data)

    def get_itinerary(
        self,
        itinerary_id: str,
    ) -> Dict[str, Any]:

        itinerary = self.repository.get_by_id(
            itinerary_id
        )

        if not itinerary:
            raise ValueError(
                f"Itinerary not found: {itinerary_id}"
            )

        return itinerary