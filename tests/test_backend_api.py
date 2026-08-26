import pytest
from fastapi.testclient import TestClient
from backend.app.core.database import Base, engine
from backend.app.main import app, seed_initial_data

# Ensure tables and seed data exist for TestClient tests
Base.metadata.create_all(bind=engine)
seed_initial_data()

client = TestClient(app)


def test_health_endpoint():
    res = client.get("/api/v1/system/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert "IBVAP" in data["project"]


def test_list_cameras():
    res = client.get("/api/v1/cameras/")
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["id"] == "CAM-01"


def test_event_ingestion_and_alert():
    event_payload = {
        "event_id": "TEST-EVT-001",
        "camera_id": "CAM-01",
        "event_type": "INTRUSION",
        "severity": "CRITICAL",
        "track_id": 99,
        "object_class": "person",
        "confidence": 0.98,
        "zone_id": "ZONE-NORTH-RESTRICTED",
        "metadata": {"test": True}
    }

    # Post event to API
    res = client.post("/api/v1/events/", json=event_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "TEST-EVT-001"

    # Check alert was generated
    alert_res = client.get("/api/v1/alerts/?severity=CRITICAL")
    assert alert_res.status_code == 200
    alerts = alert_res.json()
    assert any(a["event_id"] == "TEST-EVT-001" for a in alerts)


def test_audit_verify_api():
    res = client.get("/api/v1/audit/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["is_valid"] is True
