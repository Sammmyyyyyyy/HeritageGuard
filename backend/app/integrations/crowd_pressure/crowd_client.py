from typing import Any, Dict

from app.exceptions.ai import AIModelNotReady


class CrowdClient:

    async def predict(
        self,
        site_id: str,
    ) -> Dict[str, Any]:

        raise AIModelNotReady(
            "crowd prediction model is not integrated yet"
        )