from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class PressureScore:
    data: Dict[str, Any]