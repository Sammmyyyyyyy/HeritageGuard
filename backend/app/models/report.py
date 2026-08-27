from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class Report:
    site_id: str
    damage_score: float
    priority: str
    image_url: Optional[str] = None
    detections: List[Dict[str, Any]] = None
    notes: Optional[str] = None