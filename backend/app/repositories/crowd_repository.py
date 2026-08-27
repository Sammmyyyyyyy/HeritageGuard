from typing import Any, Dict, List


class CrowdRepository:

    def save(
        self,
        data: Dict[str, Any],
    ) -> Dict[str, Any]:
        # Can be connected to a crowd_predictions
        # table when Shagun's model is integrated.
        return data