# Project Anchor

Project Anchor is an ambient memory prosthetic for TBI survivors experiencing anterograde amnesia. A local Python vision worker watches trusted drop zones, stores only object metadata in SQLite, and exposes the latest-known object locations over a simple local API for a native iPhone client with haptic feedback.

## Stack

- Next.js App Router with TypeScript
- Supabase SSR auth for the local web dashboard
- Tailwind CSS and Motion for React for the UI
- Python, OpenCV, and YOLOv8 for edge vision
- FastAPI for the local network bridge
- Local SQLite for object memory events and latest-known state

## What Ships In This MVP

<<<<<<< HEAD
=======
- Rebranded landing page and authenticated Project Anchor dashboard
- Local SQLite read layer inside Next.js for status, sightings, and query answers
- API routes for object state, system status, lightweight text queries, and the latest live camera frame
>>>>>>> db4faa7 (changed dashboard UI)
- Python vision worker scaffold with camera capture, YOLO detection, drop-zone mapping, tracking, heartbeat, and SQLite writes
- Single-file local API that serves the latest-known object locations as JSON over Wi-Fi
- Native iPhone client can use the API response to trigger haptics when an item is located
- Privacy-first messaging throughout the product: frames are processed locally and discarded immediately

## Architecture

1. The Python worker in [vision/main.py](/Users/chase/code/ignite-2026/IgniteHack/vision/main.py) is the only writer. It opens a webcam with OpenCV, probes common camera backends automatically, and attempts to reopen the capture if reads fail.
2. YOLOv8 detects a small set of high-value objects and maps practical aliases such as `cup -> mug`.
3. The tracker keeps the latest visible position and marks objects as out of view after a disappearance threshold.
4. Metadata is written to one local SQLite file, configurable with `ANCHOR_DB_PATH` or `--db-path`, using two main tables:
   - `object_sightings`
   - `object_latest_state`
5. Lightweight worker health such as heartbeat and the latest camera error is also stored in SQLite `system_state`.
6. [vision/anchor_api.py](/Users/chase/code/ignite-2026/IgniteHack/vision/anchor_api.py) reads the same SQLite file and exposes `GET /api/objects` on the local network.
7. A native iPhone client can request `GET /api/objects?object=keys` and translate the response into a heavy haptic cue plus a plain-language location string.

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Optional:

- `SUPABASE_SERVICE_ROLE_KEY`
- `ANCHOR_DB_PATH`
  Overrides the default local SQLite path. Defaults to `data/project-anchor.db`.

## Local Setup

1. Install the Python worker dependencies:

```bash
cd vision
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

2. Start the local vision worker with higher-resolution inference for small, distant objects:

```bash
cd vision
source .venv/bin/activate
<<<<<<< HEAD
python main.py --preview --imgsz 1280 --confidence 0.20 --frame-skip 2 --full-frame-detect
=======
python main.py
>>>>>>> db4faa7 (changed dashboard UI)
```

If the default camera is not the one you want, inspect the available indexes and launch a specific source:

```bash
python main.py --list-cameras
python main.py --camera 1 --calibrate
<<<<<<< HEAD
python main.py --camera 1 --preview --imgsz 1280 --confidence 0.20 --frame-skip 2 --full-frame-detect
=======
python main.py --camera 1
>>>>>>> db4faa7 (changed dashboard UI)
```

3. In another terminal, start the local API bridge:

<<<<<<< HEAD
```bash
cd vision
source .venv/bin/activate
python anchor_api.py
```

The API listens on `http://0.0.0.0:8765` by default, so your iPhone can call it over the same Wi-Fi network using your laptop's LAN IP, for example:

```text
http://192.168.1.23:8765/api/objects
http://192.168.1.23:8765/api/objects?object=keys
```

The worker now defaults to `--imgsz 1280` and `--confidence 0.20`. It also supports calibrated zone crops plus optional full-frame inference to make small tabletop objects easier to detect across the room.
Use `--db-path /path/to/project-anchor.db` or `ANCHOR_DB_PATH=/path/to/project-anchor.db` if you want the worker and API to use a different SQLite file.
=======
6. Open `http://localhost:3000`. The top of the dashboard now shows the latest webcam frame from the Python worker, and the query box can answer where an object was last seen.
>>>>>>> db4faa7 (changed dashboard UI)

## Supabase Setup

1. Create a new Supabase project.
2. In Supabase, enable Email auth under `Authentication -> Providers`.
3. Copy the project URL and anon key into `.env.local`.
4. Run the migration in [supabase/migrations/202603271300_initial_schema.sql](/Users/chase/code/ignite-2026/IgniteHack/supabase/migrations/202603271300_initial_schema.sql).
5. Optional: adjust the UUID in [supabase/seed.sql](/Users/chase/code/ignite-2026/IgniteHack/supabase/seed.sql) and run it for demo auth/profile data.

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

<<<<<<< HEAD
- `GET /health`
- `GET /api/objects`
- `GET /api/objects?object=keys`
=======
- `GET /api/anchor/status`
- `GET /api/anchor/objects`
- `GET /api/anchor/objects?object=keys`
- `GET /api/anchor/query?q=Where%20are%20my%20keys%3F`
- `GET /api/anchor/live-frame`
>>>>>>> db4faa7 (changed dashboard UI)

## Demo Notes

- Default YOLO weights are strongest for `mug`, `glasses`, `phone`, and bag-like substitutes.
- `keys` and `wallet` may need custom weights later, but the system already supports those labels in storage and query flows.
- For the hackathon MVP, do not add voice or custom model training until the text-query path is stable.

## Commands

For the full local testing command reference, see [COMMANDS.md](/Users/chase/code/ignite-2026/IgniteHack/COMMANDS.md).

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
