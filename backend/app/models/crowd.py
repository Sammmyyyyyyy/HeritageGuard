from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class CrowdPrediction:
    data: Dict[str, Any]