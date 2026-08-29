"""Heritage Pressure Score calculation engine."""

import os
import json
import logging
from typing import Dict, Any, Optional
import numpy as np

from ai.crowd.preprocessing.cleaner import DataCleaner
from ai.crowd.pressure.factors import PressureFactors, RiskLevel

logger = logging.getLogger(__name__)


class HeritagePressureCalculator:
    """Calculates transparent, explainable Heritage Pressure risk scores."""

    # Calibrated scientific weights
    WEIGHT_VISITOR = 0.35
    WEIGHT_VULNERABILITY = 0.25
    WEIGHT_DETERIORATION = 0.20
    WEIGHT_MAINTENANCE = 0.10
    WEIGHT_IMPORTANCE = 0.10

    def __init__(self, metadata_path: Optional[str] = None):
        self.cleaner = DataCleaner(metadata_path=metadata_path)

    def calculate_score(
        self,
        site_id: str,
        predicted_visitors: Optional[float] = None,
        observed_deterioration_override: Optional[float] = None,
        custom_damage_score: Optional[float] = None
    ) -> Dict[str, Any]:
        """Calculates multi-factor Heritage Pressure Score for a given heritage site.
        
        Args:
            site_id: Supported site ID (e.g. 'DEL001').
            predicted_visitors: Current or forecasted peak hourly visitor load.
            observed_deterioration_override: Optional manual sensor override (0-100).
            custom_damage_score: Optional damage score from AI damage detection (0-100).
            
        Returns:
            Structured heritage pressure analysis response.
        """
        # Validate site
        site_meta = self.cleaner.validate_site_id(site_id)
        
        safe_capacity = float(site_meta.get("safe_capacity", 15000))
        vuln_score = float(site_meta.get("physical_vulnerability", 70.0))
        base_deterioration = float(site_meta.get("recent_deterioration", 50.0))
        maintenance_days = float(site_meta.get("maintenance_delay_days", 30.0))
        importance_score = float(site_meta.get("historical_importance", 85.0))

        # 1. Visitor Pressure Factor (0-100)
        if predicted_visitors is not None:
            visitor_load = float(predicted_visitors)
            # Pressure is 100% when visitor load reaches or exceeds safe capacity
            visitor_pressure = min(100.0, (visitor_load / safe_capacity) * 100.0)
        else:
            # Baseline visitor pressure if no immediate load passed (derived from site historical capacity)
            visitor_pressure = min(100.0, (float(site_meta.get("safe_capacity", 15000)) * 0.45 / safe_capacity) * 100.0)

        # 2. Physical Vulnerability Factor (0-100)
        physical_vulnerability = max(0.0, min(100.0, vuln_score))

        # 3. Recent Deterioration Factor (0-100)
        if custom_damage_score is not None:
            recent_deterioration = max(0.0, min(100.0, float(custom_damage_score)))
        elif observed_deterioration_override is not None:
            recent_deterioration = max(0.0, min(100.0, float(observed_deterioration_override)))
        else:
            recent_deterioration = max(0.0, min(100.0, base_deterioration))

        # 4. Maintenance Delay Pressure (0-100) (normalized: 60+ days overdue = 100% strain)
        maintenance_delay = min(100.0, (maintenance_days / 60.0) * 100.0)

        # 5. Historical Importance / Sensitivity Weight (0-100)
        historical_importance = max(0.0, min(100.0, importance_score))

        # Composite Pressure Score: Weighted linear combination
        raw_composite = (
            self.WEIGHT_VISITOR * visitor_pressure +
            self.WEIGHT_VULNERABILITY * physical_vulnerability +
            self.WEIGHT_DETERIORATION * recent_deterioration +
            self.WEIGHT_MAINTENANCE * maintenance_delay +
            self.WEIGHT_IMPORTANCE * historical_importance
        )

        pressure_score = int(round(max(0.0, min(100.0, raw_composite))))

        # Risk Classification
        if pressure_score >= 85:
            risk = RiskLevel.CRITICAL.value
        elif pressure_score >= 70:
            risk = RiskLevel.HIGH.value
        elif pressure_score >= 50:
            risk = RiskLevel.MODERATE.value
        else:
            risk = RiskLevel.LOW.value

        factors = PressureFactors(
            visitor_pressure=visitor_pressure,
            physical_vulnerability=physical_vulnerability,
            recent_deterioration=recent_deterioration,
            maintenance_delay=maintenance_delay,
            historical_importance=historical_importance
        )

        return {
            "site_id": site_meta["site_id"],
            "site_name": site_meta["name"],
            "pressure_score": pressure_score,
            "risk": risk,
            "factors": {
                "visitor_pressure": int(round(visitor_pressure)),
                "physical_vulnerability": int(round(physical_vulnerability)),
                "recent_deterioration": int(round(recent_deterioration)),
                "maintenance_delay": int(round(maintenance_delay)),
                "historical_importance": int(round(historical_importance))
            },
            "metadata": {
                "safe_capacity": int(safe_capacity),
                "maintenance_delay_days": int(maintenance_days),
                "city": site_meta["city"],
                "state": site_meta["state"]
            }
        }
