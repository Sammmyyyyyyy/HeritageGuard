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

        starting_site_id = data.get("starting_site_id") or (data.get("itinerary", {}).get("starting_site_id"))
        destination_site_id = data.get("destination_site_id") or (data.get("itinerary", {}).get("destination_site_id"))
        
        dest_lat = data.get("destination_latitude")
        dest_lng = data.get("destination_longitude")
        destination_coords = None
        if dest_lat is not None and dest_lng is not None:
            try:
                destination_coords = {
                    "lat": float(dest_lat),
                    "lng": float(dest_lng)
                }
            except (TypeError, ValueError):
                destination_coords = None

        # Payload expected by Recommendation AI
        recommendation_payload = {
            "starting_coords": {
                "lat": latitude,
                "lng": longitude,
            },
            "starting_site_id": starting_site_id,
            "destination_site_id": destination_site_id,
            "destination_coords": destination_coords,
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

        # Call Recommendation AI
        if self.client:
            calculated_itinerary = await self.client.recommend(
                recommendation_payload
            )

            data["itinerary"] = calculated_itinerary

        valid_columns = {
            "starting_latitude",
            "starting_longitude",
            "start_time",
            "available_time_minutes",
            "budget",
            "interests",
            "crowd_tolerance",
            "itinerary",
        }
        db_insert_data = {k: v for k, v in data.items() if k in valid_columns}

        return self.repository.create(db_insert_data)

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