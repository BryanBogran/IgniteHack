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

The worker will:

- Open the configured webcam with OpenCV
- Run YOLO detections every few frames
- Map detections into named room drop zones
- Persist sightings and last-known state to `../data/project-anchor.db`
- Update a heartbeat so the Next.js dashboard can show worker health

## Notes

- Default YOLO weights work best for `mug`, `glasses`, `phone`, and bag-like substitutes.
- `keys` and `wallet` may need custom weights later, but the pipeline is already structured for that upgrade.
- Frames are processed locally and discarded after metadata extraction.
