from typing import Dict, List, Set, Tuple
from ai.behavior.zone import point_in_polygon
from ai.schemas import EventRecord, EventType, SeverityLevel, TrackedObject, ZoneDefinition


class LoiteringDetector:
    """
    Monitors how long a tracked object remains inside a designated zone.
    Emits an alert when dwell time exceeds zone.loitering_threshold_seconds.
    """
    def __init__(self):
        # Entry timestamps: {(track_id, zone_id): first_entry_timestamp}
        self.entry_times: Dict[Tuple[int, str], float] = {}
        # Already alerted: {(track_id, zone_id)}
        self.alerted: Set[Tuple[int, str]] = set()

    def process(self, tracks: List[TrackedObject], zones: List[ZoneDefinition], camera_id: str, current_time: float) -> List[EventRecord]:
        events: List[EventRecord] = []
        currently_inside: Set[Tuple[int, str]] = set()

        for track in tracks:
            pos = track.current_pos
            for zone in zones:
                if not zone.enabled or zone.zone_type != "polygon":
                    continue

                if point_in_polygon(pos, zone.coordinates):
                    pair = (track.track_id, zone.zone_id)
                    currently_inside.add(pair)

                    if pair not in self.entry_times:
                        self.entry_times[pair] = current_time

                    dwell_duration = current_time - self.entry_times[pair]
                    track.zone_dwell_times[zone.zone_id] = dwell_duration

                    # Trigger alert if exceeded threshold and not yet alerted
                    if dwell_duration >= zone.loitering_threshold_seconds and pair not in self.alerted:
                        self.alerted.add(pair)
                        events.append(
                            EventRecord(
                                camera_id=camera_id,
                                event_type=EventType.LOITERING,
                                severity=SeverityLevel.HIGH,
                                track_id=track.track_id,
                                object_class=track.class_name,
                                confidence=track.confidence,
                                zone_id=zone.zone_id,
                                metadata={
                                    "zone_name": zone.name,
                                    "dwell_duration_seconds": round(dwell_duration, 1),
                                    "threshold_seconds": zone.loitering_threshold_seconds,
                                    "bbox": track.bbox,
                                }
                            )
                        )

        # Cleanup objects that have left the zone
        for pair in list(self.entry_times.keys()):
            if pair not in currently_inside:
                del self.entry_times[pair]
                if pair in self.alerted:
                    self.alerted.remove(pair)

        return events
