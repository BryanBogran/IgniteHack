from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


@dataclass(frozen=True)
class Zone:
    name: str
    x1: float
    y1: float
    x2: float
    y2: float

    def contains(self, x: float, y: float) -> bool:
        return self.x1 <= x <= self.x2 and self.y1 <= y <= self.y2


YOLO_CLASS_ALIASES = {
    "cup": "mug",
    "sunglasses": "glasses",
    "eyeglasses": "glasses",
    "handbag": "wallet",
    "cell phone": "phone",
    "backpack": "bag",
}

TRACKED_OBJECTS = {"keys", "wallet", "glasses", "mug", "phone", "bag"}

DEFAULT_ZONES = [
    Zone("entry_table", 0.0, 0.0, 0.5, 0.5),
    Zone("desk", 0.5, 0.0, 1.0, 0.5),
    Zone("nightstand", 0.0, 0.5, 0.33, 1.0),
    Zone("dresser", 0.33, 0.5, 0.66, 1.0),
    Zone("catch_all_bin", 0.66, 0.5, 1.0, 1.0),
]

DEFAULT_DB_PATH = Path(__file__).resolve().parents[1] / "data" / "project-anchor.db"


def resolve_zone(center_x: float, center_y: float, zones: Iterable[Zone] = DEFAULT_ZONES) -> str:
    for zone in zones:
        if zone.contains(center_x, center_y):
            return zone.name

    return "unknown_zone"
