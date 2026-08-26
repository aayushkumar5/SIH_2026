from typing import Dict, List, Set, Tuple
from ai.behavior.zone import point_in_polygon, line_intersection
from ai.schemas import EventRecord, EventType, SeverityLevel, TrackedObject, ZoneDefinition


class IntrusionDetector:
    """
    Evaluates virtual polygon intrusions and tripwire line crossings for tracked objects.
    Ensures stateful deduplication so an intrusion is alerted once per session unless re-entered.
    """
    def __init__(self):
        # Keeps track of tracks already alerted for a given zone: {(track_id, zone_id)}
        self.active_intrusions: Set[Tuple[int, str]] = set()

    def process(self, tracks: List[TrackedObject], zones: List[ZoneDefinition], camera_id: str) -> List[EventRecord]:
        events: List[EventRecord] = []
        current_active_intrusions: Set[Tuple[int, str]] = set()

        for track in tracks:
            pos = track.current_pos
            for zone in zones:
                if not zone.enabled:
                    continue

                is_inside = False
                if zone.zone_type == "polygon":
                    is_inside = point_in_polygon(pos, zone.coordinates)
                elif zone.zone_type == "line" and len(zone.coordinates) >= 2:
                    # Check if trajectory intersects tripwire
                    if len(track.trajectory) >= 2:
                        prev_pos = track.trajectory[-2]
                        is_inside = line_intersection(
                            prev_pos, pos, zone.coordinates[0], zone.coordinates[1]
                        )

                if is_inside:
                    current_active_intrusions.add((track.track_id, zone.zone_id))
                    
                    # Fire alert if not already alerted
                    if (track.track_id, zone.zone_id) not in self.active_intrusions:
                        evt_type = (
                            EventType.VEHICLE_INTRUSION
                            if track.class_name in ["car", "motorcycle", "bus", "truck"]
                            else EventType.INTRUSION
                        )
                        events.append(
                            EventRecord(
                                camera_id=camera_id,
                                event_type=evt_type,
                                severity=zone.severity,
                                track_id=track.track_id,
                                object_class=track.class_name,
                                confidence=track.confidence,
                                zone_id=zone.zone_id,
                                metadata={
                                    "zone_name": zone.name,
                                    "position": pos,
                                    "bbox": track.bbox,
                                }
                            )
                        )

        # Update active state (clears tracks that left the zone)
        self.active_intrusions = current_active_intrusions
        return events
