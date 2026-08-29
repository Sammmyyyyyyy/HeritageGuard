"""High-level Crowd Service for application and API integration."""

from typing import Dict, Any, Optional, Union
from datetime import datetime

from ai.crowd.prediction.inference import CrowdPredictor


class CrowdService:
    """Service facade for crowd predictions across all 20 heritage sites."""

    def __init__(self, predictor: Optional[CrowdPredictor] = None):
        self.predictor = predictor or CrowdPredictor()

    def predict_crowd(
        self,
        site_id: str,
        date: Optional[Union[str, datetime]] = None,
        weather: Optional[str] = None,
        temperature: Optional[float] = None
    ) -> Dict[str, Any]:
        """Generates site-specific crowd prediction.
        
        Args:
            site_id: Heritage site ID (e.g. 'DEL001').
            date: Target date 'YYYY-MM-DD' (defaults to today if not provided).
            weather: Optional weather condition.
            temperature: Optional temperature in Celsius.
            
        Returns:
            Formatted prediction payload.
        """
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")

        return self.predictor.predict_site_date(
            site_id=site_id,
            date=date,
            weather=weather,
            temperature=temperature
        )


# Singleton instance for simple module import
_default_service: Optional[CrowdService] = None


def get_crowd_service() -> CrowdService:
    global _default_service
    if _default_service is None:
        _default_service = CrowdService()
    return _default_service
