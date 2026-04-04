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

`python main.py` now defaults to the trained custom weights at `../runs/detect/train3/weights/best.pt`.
Override that with `--model` if you want to test a different checkpoint.

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
- Run YOLO on calibrated zone crops by default, every 6 frames at `--imgsz 640`
- Use the trained weights at `../runs/detect/train3/weights/best.pt` unless `--model` is provided
- Map detections into named room drop zones
- Persist sightings and last-known state to `../data/memento.db`
- Update a heartbeat so the Next.js dashboard can show worker health
- Publish dashboard preview frames on a separate timer so the website can stay smoother even while YOLO is running

## Notes

- The tracked custom classes are `glasses`, `keys`, `phone`, and `wallet`.
- The dashboard preview now defaults to `--preview-fps 4` and `--preview-jpeg-quality 65` to reduce lag on weaker machines.
- If you need more accuracy, first try `--imgsz 960` or `--full-frame-detect`. Both use more CPU.
- If you want even lighter tracking, try raising `--frame-skip` above the default `6`.
- If you want faster responsiveness later, lower `--frame-skip` or raise `--preview-fps` once the worker is stable.
- If you need to compare against another checkpoint, pass it explicitly, for example `python main.py --model ..\runs\detect\train3\weights\last.pt`.
- Stable camera placement matters. Re-run calibration whenever the camera angle changes.
- Frames are processed locally and discarded after metadata extraction.
- The dashboard live view reads only the latest saved frame, not a second direct camera connection.
- On macOS, camera access also depends on Camera permission for the app launching Python, such as Terminal, iTerm, or your IDE.
