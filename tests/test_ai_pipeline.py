import pytest
import numpy as np
import time
from datetime import datetime

from ai.schemas import Detection, TrackedObject, ZoneDefinition, SeverityLevel, EventType
from ai.tracker import MultiObjectTracker, calculate_iou
from ai.behavior.zone import point_in_polygon, line_intersection
from ai.behavior.intrusion import IntrusionDetector
from ai.behavior.loitering import LoiteringDetector
from ai.behavior.night_movement import NightMovementDetector
from ai.preprocessing.low_light import LowLightEnhancer
from ai.pipeline import VideoAnalyticsPipeline


def test_iou_calculation():
    box1 = (0, 0, 100, 100)
    box2 = (50, 50, 150, 150)
    iou = calculate_iou(box1, box2)
    assert 0.14 < iou < 0.15

    # Non-overlapping
    box3 = (200, 200, 300, 300)
    assert calculate_iou(box1, box3) == 0.0

    # Identical
    assert calculate_iou(box1, box1) == 1.0


def test_point_in_polygon_raycasting():
    square_poly = [(0, 0), (100, 0), (100, 100), (0, 100)]
    assert point_in_polygon((50, 50), square_poly) is True
    assert point_in_polygon((150, 50), square_poly) is False
    assert point_in_polygon((-10, 50), square_poly) is False


def test_tripwire_line_intersection():
    tripwire_p1 = (100, 200)
    tripwire_p2 = (500, 200)
    # Movement trajectory crossing the tripwire
    traj_prev = (300, 150)
    traj_curr = (300, 250)
    assert line_intersection(traj_prev, traj_curr, tripwire_p1, tripwire_p2) is True

    # Trajectory parallel and not crossing
    traj_no_cross1 = (300, 100)
    traj_no_cross2 = (300, 180)
    assert line_intersection(traj_no_cross1, traj_no_cross2, tripwire_p1, tripwire_p2) is False


def test_tracker_and_intrusion():
    tracker = MultiObjectTracker()
    intrusion_engine = IntrusionDetector()

    zone = ZoneDefinition(
        zone_id="ZONE-01",
        name="Restricted Buffer",
        zone_type="polygon",
        coordinates=[(0, 0), (400, 0), (400, 400), (0, 400)],
        camera_id="CAM-01",
        severity=SeverityLevel.CRITICAL
    )

    # Frame 1: Detection inside zone
    det1 = Detection(class_name="person", confidence=0.95, bbox=(50, 50, 100, 200))
    tracks = tracker.update([det1], timestamp=100.0)
    assert len(tracks) == 1
    assert tracks[0].track_id == 1

    events = intrusion_engine.process(tracks, [zone], camera_id="CAM-01")
    assert len(events) == 1
    assert events[0].event_type == EventType.INTRUSION
    assert events[0].severity == SeverityLevel.CRITICAL
    assert events[0].track_id == 1

    # Frame 2: Deduplication prevents repeated alert in same session
    det2 = Detection(class_name="person", confidence=0.95, bbox=(55, 55, 105, 205))
    tracks2 = tracker.update([det2], timestamp=101.0)
    events2 = intrusion_engine.process(tracks2, [zone], camera_id="CAM-01")
    assert len(events2) == 0


def test_loitering_detector():
    loiter_engine = LoiteringDetector()
    zone = ZoneDefinition(
        zone_id="ZONE-LOITER",
        name="Checkpost Gate",
        zone_type="polygon",
        coordinates=[(0, 0), (500, 0), (500, 500), (0, 500)],
        camera_id="CAM-01",
        severity=SeverityLevel.HIGH,
        loitering_threshold_seconds=5.0
    )

    track = TrackedObject(
        track_id=42,
        class_name="person",
        confidence=0.9,
        bbox=(100, 100, 150, 250),
        first_seen=1000.0,
        last_seen=1000.0
    )

    # At t=1000s: Just entered (dwell 0s) -> No alert
    events = loiter_engine.process([track], [zone], camera_id="CAM-01", current_time=1000.0)
    assert len(events) == 0

    # At t=1003s: Dwell 3s (< 5s threshold) -> No alert
    events = loiter_engine.process([track], [zone], camera_id="CAM-01", current_time=1003.0)
    assert len(events) == 0

    # At t=1006s: Dwell 6s (>= 5s threshold) -> Emits LOITERING event
    events = loiter_engine.process([track], [zone], camera_id="CAM-01", current_time=1006.0)
    assert len(events) == 1
    assert events[0].event_type == EventType.LOITERING


def test_low_light_enhancer():
    enhancer = LowLightEnhancer(darkness_thresh=70.0)
    # Dark synthetic image (mean intensity ~ 20)
    dark_frame = np.full((100, 100, 3), 20, dtype=np.uint8)
    assert enhancer.is_low_light(dark_frame) is True

    enhanced = enhancer.enhance(dark_frame)
    # Mean intensity should be significantly higher after gamma & CLAHE boost
    assert np.mean(enhanced) > np.mean(dark_frame)
