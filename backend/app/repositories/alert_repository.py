from typing import Any, Dict, List
from app.db.supabase import supabase
from app.exceptions.database import DatabaseError


class AlertRepository:

    TABLE = "alerts"

    def create(
        self,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        try:
            response = (
                supabase
                .table(self.TABLE)
                .insert(data)
                .execute()
            )

            if not response.data:
                raise DatabaseError("Alert was not created")

            return response.data[0]

        except DatabaseError:
            raise

        except Exception as exc:
            raise DatabaseError(f"Failed to create alert: {exc}")

    def get_all(
        self,
        site_id: str | None = None,
        only_unresolved: bool = True,  # Default True rakhein
    ) -> List[Dict[str, Any]]:

        try:
            query = (
                supabase
                .table(self.TABLE)
                .select("*")
            )

            # SIRF ACTIVE ALERTS FILTER KAREIN
            if only_unresolved:
                query = query.eq("is_resolved", False)

            if site_id:
                query = query.eq("site_id", site_id)

            response = query.order(
                "created_at",
                desc=True,
            ).execute()

            return response.data or []

        except Exception as exc:
            raise DatabaseError(f"Failed to fetch alerts: {exc}")

    def update(
        self,
        alert_id: str,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:

        try:
            response = (
                supabase
                .table(self.TABLE)
                .update(data)
                .eq("id", alert_id)
                .execute()
            )

            if not response.data:
                raise DatabaseError("Alert not found")

            return response.data[0]

        except DatabaseError:
            raise

        except Exception as exc:
            raise DatabaseError(f"Failed to update alert: {exc}")