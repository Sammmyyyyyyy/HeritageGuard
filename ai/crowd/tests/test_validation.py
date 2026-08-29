"""Test input validation for site IDs, dates, and boundary cases."""

import pytest
from ai.crowd.crowd_service import CrowdService
from ai.crowd.pressure_service import PressureService


@pytest.fixture(scope="module")
def crowd_service():
    return CrowdService()


@pytest.fixture(scope="module")
def pressure_service():
    return PressureService()


def test_invalid_site_id_error(crowd_service):
    """Verifies that an unknown site ID raises a clean ValueError."""
    with pytest.raises(ValueError) as excinfo:
        crowd_service.predict_crowd(site_id="INVALID999", date="2026-09-15")
    assert "Unknown site_id" in str(excinfo.value)


def test_invalid_pressure_site_id_error(pressure_service):
    """Verifies that pressure calculation errors on unknown site ID."""
    with pytest.raises(ValueError) as excinfo:
        pressure_service.calculate_pressure(site_id="NON_EXISTENT")
    assert "Unknown site_id" in str(excinfo.value)


def test_invalid_date_format_error(crowd_service):
    """Verifies that malformed date strings raise a ValueError."""
    with pytest.raises(ValueError) as excinfo:
        crowd_service.predict_crowd(site_id="DEL001", date="invalid-date-format")
    assert "Invalid date" in str(excinfo.value)


def test_case_insensitive_site_id(crowd_service):
    """Verifies that lower-case site IDs (e.g. 'del001') are normalized and accepted."""
    res = crowd_service.predict_crowd(site_id="del001", date="2026-09-15")
    assert res["site_id"] == "DEL001"
    assert res["site_name"] == "Red Fort"


def test_weather_and_temperature_overrides(crowd_service):
    """Verifies that optional weather and temperature overrides are honored."""
    res = crowd_service.predict_crowd(
        site_id="BOM001",
        date="2026-06-15",
        weather="Rainy",
        temperature=27.5
    )
    assert res["weather"] == "Rainy"
    assert res["temperature_c"] == 27.5
