from typing import Optional

from pydantic import BaseModel


class SiteCreate(BaseModel):

    site_id: str
    name: str

    city: Optional[str] = None
    state: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None

    description: Optional[str] = None

    historical_significance: Optional[
        str
    ] = None


class SiteResponse(SiteCreate):

    id: Optional[str] = None
    created_at: Optional[str] = None