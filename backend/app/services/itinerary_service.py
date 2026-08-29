from typing import Any, Dict

from app.repositories.itinerary_repository import ItineraryRepository


class ItineraryService:

    def __init__(
        self,
        repository: ItineraryRepository,
        client: Any = None,
    ):
        self.repository = repository
        self.client = client

    async def create_itinerary(
        self,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:

        if not data:
            raise ValueError("Itinerary data cannot be empty")

        # Coordinates must be present
        latitude = data.get("starting_latitude")
        longitude = data.get("starting_longitude")

        if latitude is None or longitude is None:
            raise ValueError(
                "Starting latitude and longitude are required."
            )

        try:
            latitude = float(latitude)
            longitude = float(longitude)
        except (TypeError, ValueError):
            raise ValueError(
                "Starting latitude and longitude must be valid numbers."
            )

        # IMPORTANT:
        # Frontend sends interests as:
        # {"History": true, "Architecture": true}
        #
        # Harsh AI expects:
        # ["History", "Architecture"]

        raw_interests = data.get("interests", {})

        if isinstance(raw_interests, dict):
            interests = [
                key
                for key, value in raw_interests.items()
                if value is True
            ]
        elif isinstance(raw_interests, list):
            interests = raw_interests
        else:
            interests = []

        # Payload expected by Harsh's Recommendation AI
        recommendation_payload = {
            "starting_coords": {
                "lat": latitude,
                "lng": longitude,
            },
            "start_time": data.get(
                "start_time",
                "09:00",
            ),
            "available_time_minutes": int(
                data.get(
                    "available_time_minutes",
                    480,
                )
            ),
            "budget": int(
                data.get(
                    "budget",
                    1000,
                )
            ),
            "interests": interests,
            "crowd_tolerance": float(
                data.get(
                    "crowd_tolerance",
                    0.5,
                )
            ),
        }

        # Call Harsh Recommendation AI
        if self.client:
            calculated_itinerary = await self.client.recommend(
                recommendation_payload
            )

            data["itinerary"] = calculated_itinerary

        return self.repository.create(data)

    async def get_itinerary(
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