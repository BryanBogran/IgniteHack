from __future__ import annotations

import json
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
DEFAULT_ZONES_PATH = Path(__file__).resolve().parents[1] / "data" / "zones.json"


def resolve_zone(center_x: float, center_y: float, zones: Iterable[Zone] = DEFAULT_ZONES) -> str:
    for zone in zones:
        if zone.contains(center_x, center_y):
            return zone.name

    return "unknown_zone"


def load_zones(zones_path: Path = DEFAULT_ZONES_PATH) -> list[Zone]:
    if not zones_path.exists():
        return list(DEFAULT_ZONES)

    with zones_path.open("r", encoding="utf-8") as handle:
        payload = json.load(handle)

    zones = [
        Zone(
            name=str(item["name"]),
            x1=float(item["x1"]),
            y1=float(item["y1"]),
            x2=float(item["x2"]),
            y2=float(item["y2"]),
        )
        for item in payload.get("zones", [])
    ]

    return zones or list(DEFAULT_ZONES)


def save_zones(zones: Iterable[Zone], zones_path: Path = DEFAULT_ZONES_PATH) -> None:
    zones_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "zones": [
            {
                "name": zone.name,
                "x1": zone.x1,
                "y1": zone.y1,
                "x2": zone.x2,
                "y2": zone.y2,
            }
            for zone in zones
        ]
    }

    with zones_path.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, indent=2)
        handle.write("\n")
