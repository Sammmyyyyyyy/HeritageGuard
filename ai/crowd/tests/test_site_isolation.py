"""Test site isolation to ensure no cross-site data bleeding or mixing."""

import pytest
from ai.crowd.crowd_service import CrowdService
from ai.crowd.pressure_service import PressureService


@pytest.fixture(scope="module")
def crowd_service():
    return CrowdService()


@pytest.fixture(scope="module")
def pressure_service():
    return PressureService()


def test_site_specific_isolation_delhi_vs_mumbai(crowd_service):
    """Guarantees DEL001 (Red Fort) never returns BOM001 (Gateway of India) data."""
    test_date = "2026-09-15"
    
    del_res = crowd_service.predict_crowd(site_id="DEL001", date=test_date)
    bom_res = crowd_service.predict_crowd(site_id="BOM001", date=test_date)
    
    assert del_res["site_id"] == "DEL001"
    assert del_res["site_name"] == "Red Fort"
    assert del_res["city"] == "Delhi"
    
    assert bom_res["site_id"] == "BOM001"
    assert bom_res["site_name"] == "Gateway of India"
    assert bom_res["city"] == "Mumbai"
    
    # Capacities and predictions must differ according to site specifications
    assert del_res["safe_capacity"] != bom_res["safe_capacity"]
    assert del_res["daily_expected_total"] != bom_res["daily_expected_total"]


def test_site_specific_isolation_jaipur_vs_prayagraj(crowd_service):
    """Guarantees JAI001 (Amer Fort) never returns PRA001 (Triveni Sangam) data."""
    test_date = "2026-10-20"
    
    jai_res = crowd_service.predict_crowd(site_id="JAI001", date=test_date)
    pra_res = crowd_service.predict_crowd(site_id="PRA001", date=test_date)
    
    assert jai_res["site_id"] == "JAI001"
    assert jai_res["site_name"] == "Amer Fort"
    assert jai_res["city"] == "Jaipur"
    
    assert pra_res["site_id"] == "PRA001"
    assert pra_res["site_name"] == "Triveni Sangam"
    assert pra_res["city"] == "Prayagraj"
    
    assert jai_res["operating_hours"] != pra_res["operating_hours"]


def test_pressure_site_isolation(pressure_service):
    """Guarantees Heritage Pressure calculations are site-specific."""
    del_press = pressure_service.calculate_pressure(site_id="DEL001")
    jai_press = pressure_service.calculate_pressure(site_id="JAI005")
    
    assert del_press["site_id"] == "DEL001"
    assert del_press["site_name"] == "Red Fort"
    
    assert jai_press["site_id"] == "JAI005"
    assert jai_press["site_name"] == "Albert Hall Museum"
    
    assert del_press["factors"]["physical_vulnerability"] != jai_press["factors"]["physical_vulnerability"]
