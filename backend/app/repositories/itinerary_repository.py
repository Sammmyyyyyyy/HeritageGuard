from typing import Any, Dict, Optional

from app.db.supabase import supabase


class ItineraryRepository:

    def create(
        self,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:

        response = (
            supabase
            .table("itineraries")
            .insert(data)
            .execute()
        )

        if not response.data:
            raise ValueError(
                "Failed to create itinerary"
            )

        return response.data[0]

    def get_by_id(
        self,
        itinerary_id: str,
    ) -> Optional[Dict[str, Any]]:

        response = (
            supabase
            .table("itineraries")
            .select("*")
            .eq("id", itinerary_id)
            .maybe_single()
            .execute()
        )

        return response.data