from dataclasses import dataclass
from typing import Any, Dict, List, Optional


@dataclass
class DamageAnalysis:
    site_id: str
    damage_score: float
    priority: str
    detections: List[Dict[str, Any]]
    image_url: Optional[str] = None