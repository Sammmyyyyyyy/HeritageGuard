from datetime import datetime, timezone
from app.repositories.alert_repository import AlertRepository


class AlertService:

    def __init__(
        self,
        repository: AlertRepository,
    ):
        self.repository = repository

    def get_alerts(
        self,
        site_id: str | None = None,
    ):
        # Sirf un-resolved alerts fetch honge
        return self.repository.get_all(site_id=site_id, only_unresolved=True)

    def create_alert(self, data):
        return self.repository.create(data)

    def resolve(
        self,
        alert_id: str,
    ):
        return self.repository.update(
            alert_id,
            {
                "is_resolved": True,
                "resolved_at": datetime.now(timezone.utc).isoformat(),
            },
        )