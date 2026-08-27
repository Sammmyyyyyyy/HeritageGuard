from app.db.supabase import supabase
from app.schemas.site import SiteCreate


class SiteRepository:

    def create(self, site: SiteCreate):
        data = {
            "site_id": site.site_id,
            "name": site.name,
            "city": site.city,
            "state": site.state,
            "latitude": site.latitude,
            "longitude": site.longitude,
            "description": site.description,
            "historical_significance": site.historical_significance,
        }

        response = (
            supabase
            .table("sites")
            .insert(data)
            .execute()
        )

        if not response.data:
            raise ValueError("Failed to create site")

        return response.data[0]

    def get_all(self):
        response = (
            supabase
            .table("sites")
            .select("*")
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    def get_by_site_id(self, site_id: str):
        response = (
            supabase
            .table("sites")
            .select("*")
            .eq("site_id", site_id)
            .maybe_single()
            .execute()
        )

        return response.data