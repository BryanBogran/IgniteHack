from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from detect import Detection


@dataclass
class TrackState:
    track_id: int
    label: str
    center_x: float
    center_y: float
    zone_name: str
    confidence: float
    seen_at: str
    visible: bool = True


class ObjectTracker:
    def __init__(self, disappearance_seconds: float = 4.0) -> None:
        self.disappearance_seconds = disappearance_seconds
        self.next_track_id = 1
        self.tracks: dict[str, TrackState] = {}

    def update(self, detections: list[Detection], zones: dict[str, str], seen_at: str):
        active_labels = set()
        tracked_events: list[TrackState] = []

        for detection in detections:
            active_labels.add(detection.label)
            track = self.tracks.get(detection.label)
            if track is None:
                track = TrackState(
                    track_id=self.next_track_id,
                    label=detection.label,
                    center_x=detection.center_x,
                    center_y=detection.center_y,
                    zone_name=zones[detection.label],
                    confidence=detection.confidence,
                    seen_at=seen_at,
                    visible=True,
                )
                self.next_track_id += 1
                self.tracks[detection.label] = track
            else:
                track.center_x = detection.center_x
                track.center_y = detection.center_y
                track.zone_name = zones[detection.label]
                track.confidence = detection.confidence
                track.seen_at = seen_at
                track.visible = True

            tracked_events.append(track)

        disappeared: list[TrackState] = []
        seen_at_dt = datetime.fromisoformat(seen_at)
        for label, track in self.tracks.items():
            if label in active_labels or not track.visible:
                continue

            if seen_at_dt - datetime.fromisoformat(track.seen_at) >= timedelta(seconds=self.disappearance_seconds):
                track.visible = False
                disappeared.append(track)

        return tracked_events, disappeared


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()
