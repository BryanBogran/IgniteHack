from __future__ import annotations

from pathlib import Path

import cv2

from camera import WebcamStream, parse_camera_source
from config import DEFAULT_ZONES_PATH, Zone, save_zones


def calibrate_zones(camera_source: int | str = "0", zones_path: Path = DEFAULT_ZONES_PATH) -> list[Zone]:
    source = parse_camera_source(camera_source)
    camera = WebcamStream(source=source)
    frame = None

    try:
        print("Calibration mode")
        print(f"Using {camera.describe()}")
        print("Press Space to freeze the current frame for zone selection. Press Q or Esc to cancel.")

        while True:
<<<<<<< Updated upstream
            live_frame = camera.read()
            preview = live_frame.copy()
            cv2.putText(
                preview,
                "Space: capture frame  |  Q/Esc: cancel",
                (20, 36),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (42, 122, 96),
                2,
                cv2.LINE_AA,
            )
            cv2.imshow("Memento Calibration", preview)
=======
            overlay = preview.copy()
            for index, line in enumerate(instructions):
                cv2.putText(
                    overlay,
                    line,
                    (24, 40 + index * 28),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8,
                    (255, 255, 255),
                    2,
                    cv2.LINE_AA,
                )
>>>>>>> Stashed changes

            cv2.imshow("Project Anchor Calibration", overlay)
            key = cv2.waitKey(1) & 0xFF
            if key in (ord("q"), 27):
                cv2.destroyAllWindows()
                print("Calibration cancelled. Keeping the existing configuration.")
                return []
            if key == ord(" "):
                frame = live_frame
                break
    finally:
        camera.release()
<<<<<<< Updated upstream

    cv2.destroyAllWindows()

    if frame is None:
        print("No calibration frame captured. Keeping the existing configuration.")
        return []

    print("Draw one box per zone, then press Enter or Space. Press Esc when you are done selecting boxes.")

    rectangles = cv2.selectROIs("Memento Calibration", frame, showCrosshair=True, fromCenter=False)
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
=======
        cv2.destroyAllWindows()
>>>>>>> Stashed changes
