from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_root_and_health_endpoints_report_service_status():
    root = client.get("/")
    health = client.get("/api/health")

    assert root.status_code == 200
    assert root.json() == {"service": "AI Continuity", "status": "online", "version": "0.2.0", "docs": "/docs"}
    assert health.status_code == 200
    assert health.json() == {"status": "ok", "service": "ai-continuity", "version": "0.2.0"}


def test_analyze_endpoint_returns_dependency_findings():
    response = client.post(
        "/api/analyze",
        json={
            "dependencies": [
                {
                    "application": "Customer Support AI",
                    "provider": "Provider A",
                    "model": "Model X",
                    "business_process": "Customer Support",
                    "annual_revenue_exposure": 2100000,
                    "criticality": "critical",
                }
            ]
        },
    )

    assert response.status_code == 200
    result = response.json()
    assert result["total_dependencies"] == 1
    assert result["risk_score"] is not None
    assert result["risk_band"] in {"LOW", "MODERATE", "HIGH", "CRITICAL"}
    assert result["scoring_version"] == "1.0"
    assert result["critical_dependencies"] == 1
    assert any(
        finding["rule_id"] == "CONT-001"
        for finding in result["findings"]
    )


def test_analyze_endpoint_rejects_negative_revenue_exposure():
    response = client.post(
        "/api/analyze",
        json={
            "dependencies": [
                {
                    "application": "Sales AI",
                    "provider": "Provider A",
                    "model": "Model X",
                    "business_process": "Sales",
                    "annual_revenue_exposure": -1,
                    "criticality": "high",
                }
            ]
        },
    )

    assert response.status_code == 422


def test_empty_inventory_returns_unknown_not_a_perfect_score():
    response = client.post("/api/analyze", json={"dependencies": []})
    assert response.status_code == 200
    assert response.json()["risk_score"] is None
    assert response.json()["risk_band"] == "UNKNOWN"
