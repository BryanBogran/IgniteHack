# Project Anchor

Project Anchor is an ambient memory prosthetic for TBI survivors experiencing anterograde amnesia. A local Python vision worker watches trusted drop zones, stores only object metadata in SQLite, and powers a dark, accessibility-aware dashboard with live camera view, object search, and last-known-location answers. The same local SQLite data can also be exposed over Wi-Fi for a native iPhone client with haptic feedback.

## Stack

- Next.js App Router with TypeScript
- Tailwind CSS and Motion for React for the UI
- Python, OpenCV, and YOLOv8 for edge vision
- Local SQLite for object memory events and latest-known state
- FastAPI for the optional local network bridge
- Supabase support remains in the codebase, but the current dashboard flow is local-first

## What Ships In This MVP

- Simplified dark-theme Project Anchor dashboard
- Live webcam panel in the web UI powered by the Python worker
- Local SQLite read layer inside Next.js for status, sightings, and query answers
- API routes for object state, system status, lightweight text queries, and the latest live camera frame
- Python vision worker scaffold with camera capture, YOLO detection, drop-zone mapping, tracking, heartbeat, and SQLite writes
- Optional local API bridge for native/mobile clients on the same Wi-Fi network
- Privacy-first messaging throughout the product: frames are processed locally and discarded immediately

## Architecture

1. The Python worker in [vision/main.py](/Users/bryan/Desktop/Branch%202%20IgniteHack/IgniteHack/vision/main.py) opens a webcam with OpenCV, probes common camera backends automatically, and attempts to recover from camera read issues.
2. YOLOv8 detects a small set of high-value objects and maps practical aliases such as `cup -> mug`.
3. The tracker keeps the latest visible position and marks objects as out of view after a disappearance threshold.
4. Metadata is written to one local SQLite file, configurable with `ANCHOR_DB_PATH` or `--db-path`.
5. The Next.js dashboard reads the same SQLite file through server-side helpers in [lib/anchor/store.ts](/Users/bryan/Desktop/Branch%202%20IgniteHack/IgniteHack/lib/anchor/store.ts).
6. The Python worker also publishes the latest annotated frame to `data/live-frame.jpg`, which the dashboard reads via `GET /api/anchor/live-frame`.
7. [vision/anchor_api.py](/Users/bryan/Desktop/Branch%202%20IgniteHack/IgniteHack/vision/anchor_api.py) can expose the same SQLite-backed object state over the local network for a phone client.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Optional:

- `ANCHOR_DB_PATH`
  Overrides the default local SQLite path. Defaults to `data/project-anchor.db`.
- `ANCHOR_LIVE_FRAME_PATH`
  Overrides the latest saved dashboard frame path. Defaults to `data/live-frame.jpg`.

## Local Setup

1. Install the web dependencies:

```bash
npm install
```

2. Install the Python worker dependencies:

```bash
cd vision
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

3. Start the web app:

```bash
npm run dev
```

4. In a second terminal, start the local vision worker:

```bash
cd vision
source .venv/bin/activate
python main.py
```

If you want the separate OpenCV preview window too:

```bash
python main.py --preview
```

If the default camera is not the one you want, inspect the available indexes and launch a specific source:

```bash
python main.py --list-cameras
python main.py --camera 1 --calibrate
python main.py --camera 1
```

The worker defaults to higher-resolution inference for small, distant objects and also supports calibrated zone crops plus optional full-frame inference.

5. Open `http://localhost:3000`. The top of the dashboard shows the latest webcam frame from the Python worker, and the query box can answer where an object was last seen.

## Optional Local API Bridge

If you also want to serve the same object-state data to a phone on the same Wi-Fi network:

```bash
cd vision
source .venv/bin/activate
python anchor_api.py
```

Example URLs:

```text
http://192.168.1.23:8765/api/objects
http://192.168.1.23:8765/api/objects?object=keys
```

## Project Structure

```text
app/
components/
lib/
supabase/
types/
vision/
data/
```

## API Endpoints

Dashboard API:

- `GET /api/anchor/status`
- `GET /api/anchor/objects`
- `GET /api/anchor/objects?object=keys`
- `GET /api/anchor/query?q=Where%20are%20my%20keys%3F`
- `GET /api/anchor/live-frame`

Optional local network bridge:

- `GET /health`
- `GET /api/objects`
- `GET /api/objects?object=keys`

## Demo Notes

- Default YOLO weights are strongest for `mug`, `glasses`, `phone`, and bag-like substitutes.
- `keys` and `wallet` may need custom weights later, but the system already supports those labels in storage and query flows.
- For the hackathon MVP, the strongest story is one reliable end-to-end flow: live camera, tracked item, and accurate “last seen” answer.

## Commands

Develop:

```bash
npm run dev
```

Lint:

```bash
npm run lint
```

Typecheck:

```bash
npm run typecheck
```
