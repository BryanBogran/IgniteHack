# Project Anchor Vision Worker

This folder contains the local privacy-first computer vision loop for Project Anchor.

## Install

```bash
cd vision
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python main.py --preview
```

Calibrate your real room zones first:

```bash
python main.py --calibrate
```

This opens a frozen camera frame so you can draw boxes around trusted surfaces like `desk`, `entry_table`, or
`nightstand`. After each box, type the zone name in the terminal. The saved calibration is written to
`../data/zones.json` and reused automatically by future runs.

The worker will:

- Open the configured webcam with OpenCV
- Run YOLO detections every few frames
- Map detections into named room drop zones
- Persist sightings and last-known state to `../data/project-anchor.db`
- Update a heartbeat so the Next.js dashboard can show worker health

## Notes

- Default YOLO weights work best for `mug`, `glasses`, `phone`, and bag-like substitutes.
- `keys` and `wallet` may need custom weights later, but the pipeline is already structured for that upgrade.
- Stable camera placement matters. Re-run calibration whenever the camera angle changes.
- Frames are processed locally and discarded after metadata extraction.
