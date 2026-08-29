"""Test predictions across all 20 heritage sites."""

import pytest
from ai.crowd.crowd_service import CrowdService
from ai.crowd.preprocessing.cleaner import DataCleaner


@pytest.fixture(scope="module")
def crowd_service():
    return CrowdService()


@pytest.fixture(scope="module")
def all_sites():
    cleaner = DataCleaner()
    return list(cleaner.site_id_to_meta.keys())


def test_all_20_sites_exist(all_sites):
    """Verifies that exactly 20 unique site IDs are supported."""
    assert len(all_sites) == 20
    expected_prefixes = {"DEL", "JAI", "BOM", "PRA"}
    found_prefixes = {s[:3] for s in all_sites}
    assert found_prefixes == expected_prefixes


def test_prediction_for_every_site(crowd_service, all_sites):
    """Verifies that prediction runs successfully for each of the 20 sites."""
    test_date = "2026-09-15"
    
    for site_id in all_sites:
        result = crowd_service.predict_crowd(site_id=site_id, date=test_date)
        
        assert result["site_id"] == site_id
        assert "site_name" in result
        assert "city" in result
        assert "state" in result
        assert result["date"] == test_date
        assert len(result["predictions"]) > 0
        
        # Check prediction elements
        for pred in result["predictions"]:
            assert "time" in pred
            assert "crowd_percent" in pred
            assert "expected_visitors" in pred
            assert 0 <= pred["crowd_percent"] <= 100
            assert pred["expected_visitors"] >= 0
            
        # Peak hours & best time
        assert isinstance(result["peak_hours"], list)
        assert len(result["peak_hours"]) > 0
        assert isinstance(result["best_time"], str)
        assert "-" in result["best_time"]
