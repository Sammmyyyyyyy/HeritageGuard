"""Test Heritage Pressure score calculations, factor formulas, and risk levels."""

import pytest
from ai.crowd.pressure.calculator import HeritagePressureCalculator
from ai.crowd.pressure.factors import RiskLevel


@pytest.fixture(scope="module")
def calculator():
    return HeritagePressureCalculator()


def test_pressure_score_bounds(calculator):
    """Verifies that pressure scores across all 20 sites stay strictly within [0, 100]."""
    for site_id in calculator.cleaner.site_id_to_meta.keys():
        res = calculator.calculate_score(site_id=site_id)
        assert 0 <= res["pressure_score"] <= 100
        assert res["risk"] in [r.value for r in RiskLevel]
        
        factors = res["factors"]
        assert 0 <= factors["visitor_pressure"] <= 100
        assert 0 <= factors["physical_vulnerability"] <= 100
        assert 0 <= factors["recent_deterioration"] <= 100
        assert 0 <= factors["maintenance_delay"] <= 100
        assert 0 <= factors["historical_importance"] <= 100


def test_visitor_surge_increases_pressure(calculator):
    """Verifies that higher visitor counts systematically increase the pressure score."""
    low_load = calculator.calculate_score(site_id="DEL001", predicted_visitors=2000)
    surge_load = calculator.calculate_score(site_id="DEL001", predicted_visitors=35000)
    
    assert surge_load["pressure_score"] > low_load["pressure_score"]
    assert surge_load["factors"]["visitor_pressure"] == 100  # Clamped at capacity


def test_damage_override_increases_deterioration(calculator):
    """Verifies that high AI damage score directly increases recent_deterioration factor."""
    base_res = calculator.calculate_score(site_id="JAI001")
    severe_res = calculator.calculate_score(site_id="JAI001", custom_damage_score=95.0)
    
    assert severe_res["factors"]["recent_deterioration"] == 95
    assert severe_res["pressure_score"] >= base_res["pressure_score"]
