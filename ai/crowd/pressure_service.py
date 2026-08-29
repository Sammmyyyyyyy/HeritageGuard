"""High-level Heritage Pressure Service for application and API integration."""

from typing import Dict, Any, Optional
from ai.crowd.pressure.calculator import HeritagePressureCalculator


class PressureService:
    """Service facade for Heritage Pressure risk analysis."""

    def __init__(self, calculator: Optional[HeritagePressureCalculator] = None):
        self.calculator = calculator or HeritagePressureCalculator()

    def calculate_pressure(
        self,
        site_id: str,
        predicted_visitors: Optional[float] = None,
        observed_deterioration_override: Optional[float] = None,
        custom_damage_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """Calculates multi-factor heritage pressure score.
        
        Args:
            site_id: Supported site ID (e.g. 'DEL001').
            predicted_visitors: Peak visitor load.
            observed_deterioration_override: Sensor override.
            custom_damage_score: AI damage score override.
            
        Returns:
            Heritage pressure response dict.
        """
        return self.calculator.calculate_score(
            site_id=site_id,
            predicted_visitors=predicted_visitors,
            observed_deterioration_override=observed_deterioration_override,
            custom_damage_score=custom_damage_score
        )


# Singleton instance for simple module import
_default_pressure_service: Optional[PressureService] = None


def get_pressure_service() -> PressureService:
    global _default_pressure_service
    if _default_pressure_service is None:
        _default_pressure_service = PressureService()
    return _default_pressure_service
