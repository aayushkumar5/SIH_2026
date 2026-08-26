import time
import logging
from typing import Callable, List, Optional
import cv2
import numpy as np

from ai.config import ai_config
from ai.detector import ObjectDetector
from ai.tracker import MultiObjectTracker
from ai.behavior.intrusion import IntrusionDetector
from ai.behavior.loitering import LoiteringDetector
from ai.behavior.night_movement import NightMovementDetector
from ai.anpr.detector import PlateDetector
from ai.face.detector import FaceDetector
from ai.preprocessing.low_light import LowLightEnhancer
from ai.schemas import Detection, EventRecord, TrackedObject, ZoneDefinition

logger = logging.getLogger("ai.pipeline")


class VideoAnalyticsPipeline:
    """
    Unified Camera Stream Video Analytics Pipeline:
    Frame Ingest -> Low-light Enhancement -> Object Detection -> Multi-Object Tracking
    -> Virtual Zone Intrusion -> Dwell Loitering -> Night Curfew -> ANPR -> Face Recognition
    -> Canonical Event Aggregation & Dispatch
    """
    def __init__(
        self,
        camera_id: str = "CAM-01",
        zones: Optional[List[ZoneDefinition]] = None,
        on_event_callback: Optional[Callable[[EventRecord], None]] = None
    ):
        self.camera_id = camera_id
        self.zones = zones or []
        self.on_event_callback = on_event_callback

        # AI Subsystems
        self.enhancer = LowLightEnhancer()
        self.detector = ObjectDetector()
        self.tracker = MultiObjectTracker()
        self.intrusion_engine = IntrusionDetector()
        self.loitering_engine = LoiteringDetector()
        self.night_engine = NightMovementDetector()
        self.anpr_engine = PlateDetector()
        self.face_engine = FaceDetector()

        self.frame_count = 0
        self.is_running = False

    def update_zones(self, zones: List[ZoneDefinition]):
        self.zones = zones

    def process_frame(self, frame: np.ndarray, timestamp: Optional[float] = None) -> List[EventRecord]:
        if frame is None or frame.size == 0:
            return []

        self.frame_count += 1
        current_time = timestamp if timestamp is not None else time.time()
        emitted_events: List[EventRecord] = []

        # 1. Preprocessing / Low-Light Enhancement
        if ai_config.ENABLE_LOW_LIGHT:
            processed_frame = self.enhancer.enhance(frame)
        else:
            processed_frame = frame

        # 2. Object Detection
        detections: List[Detection] = self.detector.detect(processed_frame, frame_id=self.frame_count)

        # 3. Multi-Object Tracking
        tracks: List[TrackedObject] = self.tracker.update(detections, timestamp=current_time)

        # 4. Spatial Zone Intrusion & Tripwires
        intrusion_events = self.intrusion_engine.process(tracks, self.zones, self.camera_id)
        emitted_events.extend(intrusion_events)

        # 5. Dwell Loitering Detection
        loitering_events = self.loitering_engine.process(tracks, self.zones, self.camera_id, current_time)
        emitted_events.extend(loitering_events)

        # 6. Night Curfew Movement
        night_events = self.night_engine.process(tracks, self.camera_id)
        emitted_events.extend(night_events)

        # 7. ANPR (Automatic Number Plate Recognition)
        _, anpr_events = self.anpr_engine.process_vehicles(processed_frame, tracks, self.camera_id)
        emitted_events.extend(anpr_events)

        # 8. Face Detection & Recognition
        _, face_events = self.face_engine.process_persons(processed_frame, tracks, self.camera_id)
        emitted_events.extend(face_events)

        # 9. Trigger callbacks
        for event in emitted_events:
            if self.on_event_callback:
                try:
                    self.on_event_callback(event)
                except Exception as e:
                    logger.error(f"Error in event callback: {e}")

        return emitted_events
