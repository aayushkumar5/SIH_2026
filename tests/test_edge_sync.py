import os
import pytest
from ai.schemas import EventRecord, EventType, SeverityLevel
from edge.sync_client import EdgeSyncClient

TEST_DB = "test_edge_buffer.db"


@pytest.fixture(autouse=True)
def cleanup():
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)
    yield
    if os.path.exists(TEST_DB):
        os.remove(TEST_DB)


def test_edge_sync_offline_enqueue():
    client = EdgeSyncClient(db_path=TEST_DB, central_api_url="http://localhost:8000/api/v1")

    event = EventRecord(
        event_id="EDGE-EVT-101",
        camera_id="CAM-01",
        event_type=EventType.INTRUSION,
        severity=SeverityLevel.HIGH,
        track_id=15,
        object_class="person",
        confidence=0.94
    )

    # Enqueue offline
    client.enqueue_event(event)

    stats = client.get_queue_stats()
    assert stats.get("PENDING") == 1
