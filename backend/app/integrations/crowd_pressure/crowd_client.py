from typing import Any, Dict

from app.exceptions.ai import AIServiceUnavailable


class CrowdClient:

    async def predict(
        self,
        site_id: str,
    ) -> Dict[str, Any]:

        try:
            result = predict_crowd(site_id)

            return result.model_dump()

        except Exception as exc:
            raise AIServiceUnavailable(
                f"Crowd AI prediction failed: {exc}"
            ) from exc