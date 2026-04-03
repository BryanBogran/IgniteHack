# Project Anchor Test Commands

This file collects the commands you actually need to verify the MVP locally and understand what each one does.

## One-Time Setup

Install the web app dependencies:

```bash
npm install
```

Creates the Next.js dependency tree used by the dashboard, API routes, lint, and typecheck.

Create local env vars:

```bash
cp .env.example .env.local
```

Creates the local env file for Supabase keys and optional `ANCHOR_DB_PATH`.

Install the Python worker dependencies:

```bash
cd vision
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

Creates the Python virtual environment and installs OpenCV, YOLO, and the worker dependencies.

## Web App Checks

Start the Next.js app:

```bash
npm run dev
```

Runs the local dashboard and API server at `http://localhost:3000`.

Typecheck the app:

```bash
npm run typecheck
```

Checks TypeScript correctness without building.

Lint the repo:

```bash
npm run lint
```

Runs ESLint against the app and shared code to catch common mistakes.

Build production output:

```bash
npm run build
```

Confirms the app can compile for production.

## Vision Worker Checks

Activate the Python env:

```bash
source .venv/bin/activate
```

Run this after `cd vision` to use the installed worker dependencies.

Show worker CLI options:

```bash
python main.py --help
```

Prints all available worker flags for camera selection, calibration, inference tuning, and preview.

List working camera candidates:

```bash
python main.py --list-cameras
```

Probes common webcam indexes and prints the ones that can actually return frames.

Calibrate named drop zones:

```bash
python main.py --camera 0 --calibrate
```

Captures a frame, lets you draw zone rectangles, and writes normalized zones to `data/zones.json`.

Run the worker with live preview:

```bash
python main.py --camera 0 --preview
```

Starts the full camera -> detection -> tracking -> SQLite pipeline and opens the debug preview window.

Run the worker with debug logs:

```bash
python main.py --camera 0 --preview --debug
```

Prints heartbeat and detection progress so you can confirm the loop is still active even when nothing is found.

Test a slower, more accurate preset:

```bash
python main.py --camera 0 --preview --imgsz 960 --frame-skip 2 --full-frame-detect
```

Uses more compute to help with small or distant objects during tuning.

Write to a custom database path:

```bash
python main.py --camera 0 --preview --db-path ../data/project-anchor.db
```

Overrides the default SQLite output location for the worker.

Compile-check the Python worker files:

```bash
python3 -m compileall vision
```

Verifies the Python files parse successfully.

## API Checks

Get worker/system status:

```bash
curl http://localhost:3000/api/anchor/status
```

Returns heartbeat, camera status, tracked counts, DB path, and any stored camera error.

Get all tracked objects and recent sightings:

```bash
curl http://localhost:3000/api/anchor/objects
```

Returns the latest object state table plus recent timeline events.

Get one object:

```bash
curl "http://localhost:3000/api/anchor/objects?object=keys"
```

Fetches the latest known state for a single object label.

Run a deterministic Anchor query:

```bash
curl "http://localhost:3000/api/anchor/query?q=Where%20are%20my%20keys%3F"
```

Tests the same query path used by the dashboard search box.

## SQLite Inspection

Open the local DB:

```bash
sqlite3 data/project-anchor.db
```

Starts a SQLite shell for checking whether the worker is actually writing data.

Show latest object state:

```bash
sqlite3 data/project-anchor.db "select * from object_latest_state;"
```

Shows the last known state per tracked object.

Show recent sightings:

```bash
sqlite3 data/project-anchor.db "select object_label, zone_name, seen_at, state from object_sightings order by id desc limit 20;"
```

Shows the recent history stream used by the dashboard timeline.

Show system state:

```bash
sqlite3 data/project-anchor.db "select * from system_state;"
```

Shows heartbeat timestamps and the latest stored camera error.

## Recommended End-to-End Test Flow

Terminal 1, start the app:

```bash
npm run dev
```

Terminal 2, start the worker:

```bash
cd vision
source .venv/bin/activate
python main.py --camera 0 --preview --debug
```

Terminal 3, verify API output:

```bash
curl http://localhost:3000/api/anchor/status
curl http://localhost:3000/api/anchor/objects
curl "http://localhost:3000/api/anchor/query?q=Where%20are%20my%20keys%3F"
```

This is the fastest way to confirm the full path is working:
- camera opens
- worker loop stays alive
- SQLite receives writes
- Next.js reads the same DB correctly
- deterministic query answers match the stored state
