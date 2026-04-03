from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from ultralytics import YOLO

from config import TRACKED_OBJECTS, YOLO_CLASS_ALIASES


@dataclass
class Detection:
    label: str
    confidence: float
    bbox_x1: float
    bbox_y1: float
    bbox_x2: float
    bbox_y2: float

    @property
    def center_x(self) -> float:
        return (self.bbox_x1 + self.bbox_x2) / 2

    @property
    def center_y(self) -> float:
        return (self.bbox_y1 + self.bbox_y2) / 2


class YoloObjectDetector:
    def __init__(self, model_name: str = "yolov8n.pt", confidence_threshold: float = 0.35) -> None:
        self.model = YOLO(model_name)
        self.confidence_threshold = confidence_threshold

    def detect(self, frame) -> list[Detection]:
        results = self.model(frame, verbose=False)
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

        return self._dedupe_by_label(detections)

    def _dedupe_by_label(self, detections: Iterable[Detection]) -> list[Detection]:
        best_by_label: dict[str, Detection] = {}
        for detection in detections:
            current = best_by_label.get(detection.label)
            if current is None or detection.confidence > current.confidence:
                best_by_label[detection.label] = detection

        return list(best_by_label.values())
