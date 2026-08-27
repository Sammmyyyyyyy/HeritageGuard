from typing import Any, Dict

from app.exceptions.ai import AIModelNotReady


class PressureClient:

    async def calculate(
        self,
        site_id: str,
    ) -> Dict[str, Any]:

        raise AIModelNotReady(
            "heritage pressure model is not integrated yet"
        )