from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def dependency_payload(**overrides):
    payload = {
        "application": "Customer Support AI",
        "provider": "Provider A",
        "model": "Model X",
        "business_process": "Customer Support",
        "annual_revenue_exposure": 250000,
        "criticality": "high",
        "fallback_provider": "Provider B",
        "fallback_validated": True,
    }
    payload.update(overrides)
    return payload


def test_invalid_criticality_is_rejected():
    response = client.post("/api/analyze", json={"dependencies": [dependency_payload(criticality="urgent")]})
    assert response.status_code == 422


def test_blank_required_fields_are_rejected():
    response = client.post("/api/analyze", json={"dependencies": [dependency_payload(application="   ")]})
    assert response.status_code == 422


def test_negative_exposure_is_rejected():
    response = client.post("/api/analyze", json={"dependencies": [dependency_payload(annual_revenue_exposure=-1)]})
    assert response.status_code == 422


def test_more_than_one_hundred_dependencies_is_rejected():
    response = client.post("/api/analyze", json={"dependencies": [dependency_payload() for _ in range(101)]})
    assert response.status_code == 422


def test_valid_input_is_normalized_before_analysis():
    response = client.post("/api/analyze", json={"dependencies": [dependency_payload(application="  Support AI  ")]})
    assert response.status_code == 200
    assert response.json()["total_dependencies"] == 1
