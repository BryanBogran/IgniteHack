from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable

from ultralytics import YOLO

from config import TRACKED_OBJECTS, YOLO_CLASS_ALIASES


@dataclass(frozen=True)
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
    def __init__(self, model_name: str, confidence_threshold: float = 0.35, image_size: int = 640) -> None:
        self.model = YOLO(self._resolve_model_path(model_name))
        self.confidence_threshold = confidence_threshold
        self.image_size = image_size

    def detect(self, frame, zones: Iterable[object] | None = None, include_full_frame: bool = True) -> list[Detection]:
        del zones
        del include_full_frame

        results = self.model.predict(
            source=frame,
            conf=self.confidence_threshold,
            imgsz=self.image_size,
            verbose=False,
        )

        detections: list[Detection] = []
        for result in results:
            names = result.names
            if result.boxes is None:
                continue

            for box in result.boxes:
                class_id = int(box.cls[0].item())
                raw_label = str(names[class_id]).lower()
                label = YOLO_CLASS_ALIASES.get(raw_label, raw_label)
                if label not in TRACKED_OBJECTS:
                  continue

                confidence = float(box.conf[0].item())
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

    def _resolve_model_path(self, model_name: str) -> str:
        candidate = Path(model_name)
        if candidate.exists():
            return str(candidate)

        fallback = Path(__file__).resolve().parent / model_name
        if fallback.exists():
            return str(fallback)

        return model_name
