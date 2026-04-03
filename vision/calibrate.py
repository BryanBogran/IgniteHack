from __future__ import annotations

from pathlib import Path

import cv2

from camera import WebcamStream
from config import DEFAULT_ZONES_PATH, Zone, save_zones


def calibrate_zones(camera_source: int = 0, zones_path: Path = DEFAULT_ZONES_PATH) -> list[Zone]:
    camera = WebcamStream(source=camera_source)

    try:
        frame = camera.read()
    finally:
        camera.release()

    print("Calibration mode")
    print("Draw one box per zone, then press Enter or Space. Press Esc when you are done selecting boxes.")

    rectangles = cv2.selectROIs("Project Anchor Calibration", frame, showCrosshair=True, fromCenter=False)
    cv2.destroyAllWindows()

    zones: list[Zone] = []
    frame_height, frame_width = frame.shape[:2]

    for index, rectangle in enumerate(rectangles, start=1):
        x, y, width, height = [int(value) for value in rectangle]
        if width <= 0 or height <= 0:
            continue

        default_name = f"zone_{index}"
        name = input(f"Name for zone {index} [{default_name}]: ").strip() or default_name
        zones.append(
            Zone(
                name=name.lower().replace(" ", "_"),
                x1=x / frame_width,
                y1=y / frame_height,
                x2=(x + width) / frame_width,
                y2=(y + height) / frame_height,
            )
        )

    if zones:
        save_zones(zones, zones_path)
        print(f"Saved {len(zones)} calibrated zones to {zones_path}")
    else:
        print("No zones were saved. Keeping the existing configuration.")

    return zones
