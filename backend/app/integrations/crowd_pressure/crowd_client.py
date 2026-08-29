from typing import Any, Dict

from app.exceptions.ai import AIServiceUnavailable


class CrowdClient:

    async def predict(
        self,
        site_id: str,
    ) -> Dict[str, Any]:

        try:
            # Temporary response until Shagun's model is integrated
            return {
                "site_id": site_id,
                "predictions": [],
                "best_time": None,
                "pressure_score": 0,
                "risk": "LOW",
            }

        except Exception as exc:
            raise AIServiceUnavailable(
                f"Crowd AI prediction failed: {exc}"
            ) from exc