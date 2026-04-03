# Memento Vision Worker

This folder contains the local privacy-first computer vision loop for Memento.

## Install

```bash
cd vision
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python main.py
```

Calibrate your real room zones first:

```bash
python main.py --calibrate
```

This opens a live camera preview. Press `Space` to freeze the current frame, then draw boxes around trusted
surfaces like `desk`, `entry_table`, or `nightstand`. After each box, type the zone name in the terminal. The
saved calibration is written to `../data/zones.json`, and the calibration command exits after saving so it does
not immediately start tracking.

The worker now defaults to camera `0`. If the wrong device is chosen, inspect candidates first:

```bash
python main.py --list-cameras
python main.py --camera 1 --preview
python main.py --camera 1 --calibrate
```

You can also pass a device path or stream URL to `--camera`.

The worker will:

- Open the configured webcam with OpenCV
- Run YOLO on calibrated zone crops by default, every 3 frames at `--imgsz 640`
- Map detections into named room drop zones
- Persist sightings and last-known state to `../data/memento.db`
- Update a heartbeat so the Next.js dashboard can show worker health
- Publish the latest annotated webcam frame to `../data/live-frame.jpg` for the Next.js dashboard

## Notes

- Default YOLO weights work best for `mug`, `glasses`, `phone`, and bag-like substitutes.
- If you need more accuracy, first try `--imgsz 960` or `--full-frame-detect`. Both use more CPU.
- If that is still not enough, try a larger model such as `--model yolov8s.pt`.
- `keys` and `wallet` may need custom weights later, but the pipeline is already structured for that upgrade.
- Stable camera placement matters. Re-run calibration whenever the camera angle changes.
- Frames are processed locally and discarded after metadata extraction.
- The dashboard live view reads only the latest saved frame, not a second direct camera connection.
- On macOS, camera access also depends on Camera permission for the app launching Python, such as Terminal, iTerm, or your IDE.
