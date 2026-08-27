from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class Recommendation:
    data: Dict[str, Any]