from __future__ import annotations

import argparse
from pathlib import Path

import cv2

from calibrate import calibrate_zones
from camera import WebcamStream, list_camera_candidates, parse_camera_source
from config import DEFAULT_ZONES_PATH, get_database_path, load_zones, resolve_zone
from config import DEFAULT_LIVE_FRAME_PATH
from detect import YoloObjectDetector
from storage import AnchorStorage
from tracker import ObjectTracker, utc_now_iso


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Project Anchor local vision worker")
    parser.add_argument(
        "--camera",
        default="0",
        help="Camera source index, device path, stream URL, or `auto` to probe common webcam indexes",
    )
    parser.add_argument("--model", default="yolov8n.pt", help="YOLO model path or weights name")
    parser.add_argument("--imgsz", type=int, default=1280, help="YOLO inference size. Larger values help small distant objects")
    parser.add_argument("--frame-skip", type=int, default=3, help="Run YOLO every N frames")
    parser.add_argument("--confidence", type=float, default=0.20, help="Detection confidence threshold")
    parser.add_argument("--preview", action="store_true", help="Show the live camera preview")
    parser.add_argument("--debug", action="store_true", help="Print heartbeat and frame progress even without detections")
    parser.add_argument("--calibrate", action="store_true", help="Capture a frame and save named room zones before tracking")
    parser.add_argument("--db-path", default=str(get_database_path()), help="Path to the local SQLite database")
    parser.add_argument("--zones-file", default=str(DEFAULT_ZONES_PATH), help="Path to the saved JSON zone configuration")
    parser.add_argument(
        "--live-frame-path",
        default=str(DEFAULT_LIVE_FRAME_PATH),
        help="Path where the latest webcam frame should be written for the web dashboard",
    )
    parser.add_argument("--list-cameras", action="store_true", help="Probe common webcam indexes and print the ones that return frames")
    parser.add_argument("--full-frame-detect", action="store_true", help="Also run YOLO on the entire frame in addition to calibrated zone crops")
    return parser.parse_args()


def draw_zones(frame, zones) -> None:
    frame_height, frame_width = frame.shape[:2]

    for zone in zones:
        x1 = int(zone.x1 * frame_width)
        y1 = int(zone.y1 * frame_height)
        x2 = int(zone.x2 * frame_width)
        y2 = int(zone.y2 * frame_height)

        cv2.rectangle(frame, (x1, y1), (x2, y2), (42, 122, 96), 2)
        cv2.putText(
            frame,
            zone.name,
            (x1 + 6, max(24, y1 + 22)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.6,
            (42, 122, 96),
            2,
            cv2.LINE_AA,
        )


def draw_detections(frame, detections, detection_zones) -> None:
    for detection in detections:
        x1 = int(detection.bbox_x1)
        y1 = int(detection.bbox_y1)
        x2 = int(detection.bbox_x2)
        y2 = int(detection.bbox_y2)
        zone_name = detection_zones.get(detection.label, "unknown_zone")

        cv2.rectangle(frame, (x1, y1), (x2, y2), (240, 189, 92), 2)
        cv2.putText(
            frame,
            f"{detection.label} {detection.confidence:.2f} {zone_name}",
            (x1, max(24, y1 - 10)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.55,
            (240, 189, 92),
            2,
            cv2.LINE_AA,
        )


def write_live_frame(frame, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    ok, encoded = cv2.imencode(".jpg", frame, [int(cv2.IMWRITE_JPEG_QUALITY), 85])
    if not ok:
        raise RuntimeError(f"Failed to encode live frame for {output_path}")

    temp_path = output_path.with_suffix(f"{output_path.suffix}.tmp")
    temp_path.write_bytes(encoded.tobytes())
    temp_path.replace(output_path)


def main() -> None:
    args = parse_args()
    database_path = Path(args.db_path).expanduser()
    zones_path = Path(args.zones_file)
    live_frame_path = Path(args.live_frame_path)
    camera_source = parse_camera_source(args.camera)

    if args.list_cameras:
        cameras = list_camera_candidates()
        if cameras:
            print("Available camera candidates:")
            for camera in cameras:
                print(f"- {camera}")
        else:
            print("No working camera indexes found. Check OS camera permissions or try a direct device path/URL.")
        return

    if args.calibrate:
        calibrate_zones(camera_source=camera_source, zones_path=zones_path)
        return

    camera = WebcamStream(source=camera_source)
    detector = YoloObjectDetector(
        model_name=args.model,
        confidence_threshold=args.confidence,
        image_size=args.imgsz,
    )
    tracker = ObjectTracker(disappearance_seconds=4.0)
    storage = AnchorStorage(database_path)
    zones = load_zones(zones_path)

    print(f"Project Anchor worker started. Writing metadata to {database_path}")
    print(f"Using zone configuration from {zones_path}")
    print(f"Publishing live frame to {live_frame_path}")
    print(f"Camera ready with {camera.describe()}")
    print("Press Ctrl+C to stop.")

    frame_index = 0

    try:
        while True:
            try:
                frame = camera.read()
            except RuntimeError as error:
                seen_at = utc_now_iso()
                storage.record_worker_status("camera_error", str(error))
                if args.debug:
                    print(f"[{seen_at}] camera read failed: {error}")
                continue

            frame_index += 1
            preview_frame = frame.copy()
            draw_zones(preview_frame, zones)

            seen_at = utc_now_iso()
            storage.record_heartbeat(seen_at)
            storage.record_worker_status("camera_error", "")

            if args.debug and frame_index % 10 == 0:
                print(
                    f"[{seen_at}] heartbeat frame={frame_index} size={frame.shape[1]}x{frame.shape[0]} "
                    f"skip={max(args.frame_skip, 1)}"
                )

            if frame_index % max(args.frame_skip, 1) != 0:
                write_live_frame(preview_frame, live_frame_path)
                if args.preview:
                    cv2.imshow("Project Anchor Preview", preview_frame)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        break
                continue

            detections = detector.detect(
                frame,
                zones=zones,
                include_full_frame=args.full_frame_detect,
            )
            detection_zones = {
                detection.label: detection.zone_name
                or resolve_zone(
                    detection.center_x / frame.shape[1],
                    detection.center_y / frame.shape[0],
                    zones,
                )
                for detection in detections
            }
            tracked_events, disappeared = tracker.update(detections, detection_zones, seen_at)

            if args.debug and not detections:
                print(f"[{seen_at}] detection pass complete. No tracked objects found.")

            for detection in detections:
                track = next(event for event in tracked_events if event.label == detection.label)
                storage.record_detection(detection, detection_zones[detection.label], seen_at, track.track_id)
                print(
                    f"[{seen_at}] {detection.label:<8} conf={detection.confidence:.2f} "
                    f"bbox=({int(detection.bbox_x1)}, {int(detection.bbox_y1)}, {int(detection.bbox_x2)}, {int(detection.bbox_y2)}) "
                    f"zone={detection_zones[detection.label]} track={track.track_id}"
                )

            for track in disappeared:
                storage.mark_missing(track)
                print(f"[{track.seen_at}] {track.label:<8} left view. Last known zone={track.zone_name} track={track.track_id}")

            draw_detections(preview_frame, detections, detection_zones)
            write_live_frame(preview_frame, live_frame_path)

            if args.preview:
                cv2.imshow("Project Anchor Preview", preview_frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
    except KeyboardInterrupt:
        print("\nStopping Project Anchor worker...")
    finally:
        camera.release()
        storage.close()
        if args.preview:
            cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
