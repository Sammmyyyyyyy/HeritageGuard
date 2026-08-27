from typing import Any, Dict

import requests

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

        # Prepare payload for Harsh's Recommendation AI
        recommendation_payload = {
            "starting_coords": {
                "lat": data.get("starting_latitude"),
                "lng": data.get("starting_longitude"),
            },
            "start_time": data.get("start_time", "10:00"),
            "available_time_minutes": data.get(
                "available_time_minutes", 240
            ),
            "budget": data.get("budget", 500),
            "interests": list(
                (data.get("interests") or {}).keys()
            ),
            "crowd_tolerance": data.get(
                "crowd_tolerance", 0.3
            ),
        }

        # Call Recommendation AI
        try:
            response = requests.post(
                "http://localhost:8001/api/recommend",
                json=recommendation_payload,
                timeout=60,
            )

            response.raise_for_status()

            recommendation = response.json()

        except requests.RequestException as e:
            raise ValueError(
                f"Recommendation AI unavailable: {str(e)}"
            )

        # Save generated itinerary
        data["itinerary"] = recommendation

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