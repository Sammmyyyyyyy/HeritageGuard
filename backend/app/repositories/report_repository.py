from typing import Any, Dict, List

from app.db.supabase import supabase
from app.exceptions.database import DatabaseError


class ReportRepository:

    TABLE = "damage_reports"

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
                raise DatabaseError(
                    "Report was not created"
                )

            return response.data[0]

        except DatabaseError:
            raise

        except Exception as exc:
            raise DatabaseError(
                f"Failed to create report: {exc}"
            )

    def get_by_site(
        self,
        site_id: str,
    ) -> List[Dict[str, Any]]:

        try:
            response = (
                supabase
                .table(self.TABLE)
                .select("*")
                .eq("site_id", site_id)
                .order(
                    "created_at",
                    desc=True,
                )
                .execute()
            )

            return response.data or []

        except Exception as exc:
            raise DatabaseError(
                f"Failed to fetch reports: {exc}"
            )