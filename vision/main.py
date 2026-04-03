from __future__ import annotations

import argparse

import cv2

from camera import WebcamStream
from config import DEFAULT_DB_PATH, resolve_zone
from detect import YoloObjectDetector
from storage import AnchorStorage
from tracker import ObjectTracker, utc_now_iso


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Project Anchor local vision worker")
    parser.add_argument("--camera", type=int, default=0, help="OpenCV camera source")
    parser.add_argument("--model", default="yolov8n.pt", help="YOLO model path or weights name")
    parser.add_argument("--frame-skip", type=int, default=4, help="Run YOLO every N frames")
    parser.add_argument("--confidence", type=float, default=0.35, help="Detection confidence threshold")
    parser.add_argument("--preview", action="store_true", help="Show the live camera preview")
    parser.add_argument("--debug", action="store_true", help="Print heartbeat and frame progress even without detections")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    camera = WebcamStream(source=args.camera)
    detector = YoloObjectDetector(model_name=args.model, confidence_threshold=args.confidence)
    tracker = ObjectTracker(disappearance_seconds=4.0)
    storage = AnchorStorage(DEFAULT_DB_PATH)

    print(f"Project Anchor worker started. Writing metadata to {DEFAULT_DB_PATH}")
    print("Press Ctrl+C to stop.")

    frame_index = 0

    try:
        while True:
            frame = camera.read()
            frame_index += 1

            seen_at = utc_now_iso()
            storage.record_heartbeat(seen_at)

            # Helpful while bringing up a new camera/model setup.
            if args.debug and frame_index % 10 == 0:
                print(
                    f"[{seen_at}] heartbeat frame={frame_index} size={frame.shape[1]}x{frame.shape[0]} "
                    f"skip={max(args.frame_skip, 1)}"
                )

            if frame_index % max(args.frame_skip, 1) != 0:
                if args.preview:
                    cv2.imshow("Project Anchor Preview", frame)
                    if cv2.waitKey(1) & 0xFF == ord("q"):
                        break
                continue

            detections = detector.detect(frame)
            zones = {detection.label: resolve_zone(detection.center_x / frame.shape[1], detection.center_y / frame.shape[0]) for detection in detections}
            tracked_events, disappeared = tracker.update(detections, zones, seen_at)

            if args.debug and not detections:
                print(f"[{seen_at}] detection pass complete. No tracked objects found.")

            for detection in detections:
                track = next(event for event in tracked_events if event.label == detection.label)
                storage.record_detection(detection, zones[detection.label], seen_at, track.track_id)
                print(
                    f"[{seen_at}] {detection.label:<8} conf={detection.confidence:.2f} "
                    f"bbox=({int(detection.bbox_x1)}, {int(detection.bbox_y1)}, {int(detection.bbox_x2)}, {int(detection.bbox_y2)}) "
                    f"zone={zones[detection.label]} track={track.track_id}"
                )

            for track in disappeared:
                storage.mark_missing(track)
                print(f"[{track.seen_at}] {track.label:<8} left view. Last known zone={track.zone_name} track={track.track_id}")

            if args.preview:
                cv2.imshow("Project Anchor Preview", frame)
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
