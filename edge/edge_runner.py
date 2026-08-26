import logging
import threading
import time
from typing import Dict, List, Optional
import cv2
import numpy as np

from ai.pipeline import VideoAnalyticsPipeline
from ai.schemas import EventRecord, ZoneDefinition
from edge.sync_client import EdgeSyncClient

logger = logging.getLogger("edge.runner")


class EdgeRunner:
    """
    Edge BOP Node Process Manager.
    Manages local video ingestion threads per camera, runs inference pipelines,
    persists events to local buffer, and continuously triggers the sync daemon.
    """
    def __init__(
        self,
        bop_id: str = "BOP-DHARCHULA-01",
        central_api_url: str = "http://localhost:8000/api/v1",
        local_db: str = "edge_local_buffer.db"
    ):
        self.bop_id = bop_id
        self.sync_client = EdgeSyncClient(db_path=local_db, central_api_url=central_api_url, bop_id=bop_id)
        self.pipelines: Dict[str, VideoAnalyticsPipeline] = {}
        self.is_running = False
        self.sync_thread: Optional[threading.Thread] = None

    def register_camera(self, camera_id: str, zones: Optional[List[ZoneDefinition]] = None):
        """Registers a camera pipeline on this edge box."""
        def handle_event(event: EventRecord):
            logger.info(f"[{camera_id}] Generated local event: {event.event_type} (Severity: {event.severity})")
            self.sync_client.enqueue_event(event)

        pipeline = VideoAnalyticsPipeline(
            camera_id=camera_id,
            zones=zones or [],
            on_event_callback=handle_event
        )
        self.pipelines[camera_id] = pipeline

    def start_sync_daemon(self, interval_seconds: float = 3.0):
        self.is_running = True
        def loop():
            while self.is_running:
                try:
                    synced = self.sync_client.sync_batch()
                    if synced > 0:
                        logger.info(f"Edge synced {synced} events to Central Command API.")
                except Exception as e:
                    logger.error(f"Error in edge sync loop: {e}")
                time.sleep(interval_seconds)

        self.sync_thread = threading.Thread(target=loop, daemon=True)
        self.sync_thread.start()
        logger.info(f"Edge Sync Daemon started for {self.bop_id}")

    def stop(self):
        self.is_running = False
        if self.sync_thread and self.sync_thread.is_alive():
            self.sync_thread.join(timeout=2.0)
        logger.info("Edge runner stopped.")
