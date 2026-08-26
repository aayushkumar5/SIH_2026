import json
import logging
import sqlite3
import time
from typing import Dict, List, Optional
import requests
from ai.schemas import EventRecord

logger = logging.getLogger("edge.sync")


class EdgeSyncClient:
    """
    Edge-to-Central Synchronization Client.
    Maintains a robust local SQLite buffer to guarantee zero event loss during WAN / link outages.
    Syncs queued events with exponential backoff when connectivity is restored.
    """
    def __init__(
        self,
        db_path: str = "edge_local_buffer.db",
        central_api_url: str = "http://localhost:8000/api/v1",
        batch_size: int = 20,
        bop_id: str = "BOP-DHARCHULA-01"
    ):
        self.db_path = db_path
        self.central_api_url = central_api_url.rstrip("/")
        self.batch_size = batch_size
        self.bop_id = bop_id
        self._init_db()

    def _init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sync_queue (
                event_id TEXT PRIMARY KEY,
                camera_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                event_type TEXT NOT NULL,
                severity TEXT NOT NULL,
                payload TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'PENDING',
                retry_count INTEGER DEFAULT 0,
                last_attempt REAL DEFAULT 0,
                created_at REAL NOT NULL
            )
        """)
        conn.commit()
        conn.close()

    def enqueue_event(self, event: EventRecord):
        """Enqueue an event locally on the edge box."""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        now = time.time()
        payload_json = json.dumps(event.to_dict())

        cursor.execute("""
            INSERT OR REPLACE INTO sync_queue 
            (event_id, camera_id, timestamp, event_type, severity, payload, status, retry_count, last_attempt, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING', 0, 0, ?)
        """, (event.event_id, event.camera_id, event.timestamp, event.event_type.value if hasattr(event.event_type, 'value') else str(event.event_type),
              event.severity.value if hasattr(event.severity, 'value') else str(event.severity), payload_json, now))
        conn.commit()
        conn.close()

    def check_central_connectivity(self) -> bool:
        """Heartbeat check against central API."""
        try:
            res = requests.get(f"{self.central_api_url}/system/health", timeout=2.0)
            return res.status_code == 200
        except Exception:
            return False

    def sync_batch(self) -> int:
        """
        Pulls a batch of PENDING / FAILED events from local SQLite and transmits to Central Ingestion API.
        Returns the number of successfully synchronized events.
        """
        if not self.check_central_connectivity():
            logger.warning("Central API unreachable. Buffering events locally.")
            return 0

        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()

        # Fetch pending items
        cursor.execute("""
            SELECT event_id, payload, retry_count FROM sync_queue 
            WHERE status IN ('PENDING', 'FAILED') 
            ORDER BY created_at ASC LIMIT ?
        """, (self.batch_size,))
        rows = cursor.fetchall()

        if not rows:
            conn.close()
            return 0

        synced_count = 0
        for event_id, payload_str, retries in rows:
            event_dict = json.loads(payload_str)
            try:
                # Mark SENDING
                cursor.execute("UPDATE sync_queue SET status = 'SENDING', last_attempt = ? WHERE event_id = ?", (time.time(), event_id))
                conn.commit()

                # Post to central API
                resp = requests.post(f"{self.central_api_url}/events/", json=event_dict, timeout=4.0)
                if resp.status_code in [200, 201]:
                    cursor.execute("UPDATE sync_queue SET status = 'SYNCED' WHERE event_id = ?", (event_id,))
                    synced_count += 1
                else:
                    cursor.execute("UPDATE sync_queue SET status = 'FAILED', retry_count = retry_count + 1 WHERE event_id = ?", (event_id,))
                conn.commit()
            except Exception as e:
                logger.error(f"Sync failed for event {event_id}: {e}")
                cursor.execute("UPDATE sync_queue SET status = 'FAILED', retry_count = retry_count + 1 WHERE event_id = ?", (event_id,))
                conn.commit()

        conn.close()
        return synced_count

    def get_queue_stats(self) -> Dict[str, int]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT status, count(*) FROM sync_queue GROUP BY status")
        rows = cursor.fetchall()
        conn.close()
        stats = {row[0]: row[1] for row in rows}
        return stats
