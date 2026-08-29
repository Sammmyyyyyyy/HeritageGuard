"""Test FastAPI API endpoint integrations."""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure backend and project root in path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
BACKEND_ROOT = os.path.join(PROJECT_ROOT, "backend")
for p in [PROJECT_ROOT, BACKEND_ROOT]:
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.app.main import app


@pytest.fixture(scope="module")
def client():
    return TestClient(app)


def test_api_crowd_get_endpoint(client):
    """Test GET /api/crowd/{site_id}"""
    response = client.get("/api/crowd/DEL001?date=2026-09-15")
    assert response.status_code == 200
    data = response.json()
    assert data["site_id"] == "DEL001"
    assert data["site_name"] == "Red Fort"
    assert len(data["predictions"]) > 0
    assert "peak_hours" in data
    assert "best_time" in data


def test_api_crowd_post_endpoint(client):
    """Test POST /api/crowd/predict"""
    payload = {
        "site_id": "BOM001",
        "date": "2026-10-10",
        "weather": "Clear",
        "temperature": 29.0
    }
    response = client.post("/api/crowd/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["site_id"] == "BOM001"
    assert data["site_name"] == "Gateway of India"
    assert data["weather"] == "Clear"


def test_api_crowd_invalid_site_returns_400(client):
    """Test invalid site ID returns 400 Bad Request."""
    response = client.get("/api/crowd/INVALID_SITE")
    assert response.status_code == 400
    assert "Unknown site_id" in response.json()["detail"]


def test_api_pressure_get_endpoint(client):
    """Test GET /api/pressure/{site_id}"""
    response = client.get("/api/pressure/JAI001")
    assert response.status_code == 200
    data = response.json()
    assert data["site_id"] == "JAI001"
    assert data["site_name"] == "Amer Fort"
    assert 0 <= data["pressure_score"] <= 100
    assert "risk" in data
    assert "visitor_pressure" in data["factors"]
    assert "physical_vulnerability" in data["factors"]
