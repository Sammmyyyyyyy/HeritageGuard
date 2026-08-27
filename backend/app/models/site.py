from dataclasses import dataclass
from typing import Optional


@dataclass
class Site:
    site_id: str
    name: str
    city: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = None
    historical_significance: Optional[str] = None