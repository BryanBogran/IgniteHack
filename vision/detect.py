from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from ultralytics import YOLO

from config import TRACKED_OBJECTS, YOLO_CLASS_ALIASES, Zone


@dataclass
class Detection:
    label: str
    confidence: float
    bbox_x1: float
    bbox_y1: float
    bbox_x2: float
    bbox_y2: float
    zone_name: str | None = None

    @property
    def center_x(self) -> float:
        return (self.bbox_x1 + self.bbox_x2) / 2

    @property
    def center_y(self) -> float:
        return (self.bbox_y1 + self.bbox_y2) / 2


class YoloObjectDetector:
    def __init__(
        self,
        model_name: str = "yolov8n.pt",
        confidence_threshold: float = 0.35,
        image_size: int = 640,
    ) -> None:
        self.model = YOLO(model_name)
        self.confidence_threshold = confidence_threshold
        self.image_size = image_size

    def detect(
        self,
        frame,
        zones: Iterable[Zone] | None = None,
        *,
        include_full_frame: bool = False,
    ) -> list[Detection]:
        detections: list[Detection] = []

        if include_full_frame or not zones:
            detections.extend(self._detect_full_frame(frame))
        if zones:
            detections.extend(self._detect_zone_crops(frame, list(zones)))

        return self._dedupe_by_label(detections)

    def _detect_full_frame(self, frame) -> list[Detection]:
        return self._extract_detections(self.model(frame, imgsz=self.image_size, verbose=False))

    def _detect_zone_crops(self, frame, zones: list[Zone]) -> list[Detection]:
        frame_height, frame_width = frame.shape[:2]
        detections: list[Detection] = []

        for zone in zones:
            x1 = max(int(zone.x1 * frame_width), 0)
            y1 = max(int(zone.y1 * frame_height), 0)
            x2 = min(int(zone.x2 * frame_width), frame_width)
            y2 = min(int(zone.y2 * frame_height), frame_height)

            if x2 <= x1 or y2 <= y1:
                continue

            crop = frame[y1:y2, x1:x2]
            if crop.size == 0:
                continue

            for detection in self._extract_detections(self.model(crop, imgsz=self.image_size, verbose=False)):
                detections.append(
                    Detection(
                        label=detection.label,
                        confidence=detection.confidence,
                        bbox_x1=detection.bbox_x1 + x1,
                        bbox_y1=detection.bbox_y1 + y1,
                        bbox_x2=detection.bbox_x2 + x1,
                        bbox_y2=detection.bbox_y2 + y1,
                        zone_name=zone.name,
                    )
                )

        return detections

    def _extract_detections(self, results) -> list[Detection]:
        detections: list[Detection] = []

        for result in results:
            class_names = result.names
            for box in result.boxes:
                confidence = float(box.conf.item())
                if confidence < self.confidence_threshold:
                    continue

                class_id = int(box.cls.item())
                raw_label = class_names[class_id].lower()
                label = YOLO_CLASS_ALIASES.get(raw_label, raw_label)
                if label not in TRACKED_OBJECTS:
                    continue

                x1, y1, x2, y2 = [float(value) for value in box.xyxy[0].tolist()]
                detections.append(
                    Detection(
                        label=label,
                        confidence=confidence,
                        bbox_x1=x1,
                        bbox_y1=y1,
                        bbox_x2=x2,
                        bbox_y2=y2,
                    )
                )

        return detections

    def _dedupe_by_label(self, detections: Iterable[Detection]) -> list[Detection]:
        best_by_label: dict[str, Detection] = {}
        for detection in detections:
            current = best_by_label.get(detection.label)
            if current is None or detection.confidence > current.confidence:
                best_by_label[detection.label] = detection

        return list(best_by_label.values())
