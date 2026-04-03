# Project Anchor

Project Anchor is an ambient memory prosthetic for TBI survivors experiencing anterograde amnesia. A local Python vision worker watches trusted drop zones, stores only object metadata in SQLite, and the Next.js dashboard answers questions like "Where are my keys?" without requiring the user to remember to tag or log anything.

## Stack

- Next.js App Router with TypeScript
- Supabase SSR auth for the local web dashboard
- Tailwind CSS and Motion for React for the UI
- Python, OpenCV, and YOLOv8 for edge vision
- Local SQLite for object memory events and latest-known state

## What Ships In This MVP

- Rebranded landing page and authenticated Project Anchor dashboard
- Local SQLite read layer inside Next.js for status, sightings, and query answers
- API routes for object state, system status, and lightweight text queries
- Python vision worker scaffold with camera capture, YOLO detection, drop-zone mapping, tracking, heartbeat, and SQLite writes
- Privacy-first messaging throughout the product: frames are processed locally and discarded immediately

## Architecture

1. The Python worker in [vision/main.py](/Users/chase/code/ignite-2026/IgniteHack/vision/main.py) opens a webcam with OpenCV and probes common camera backends automatically.
2. YOLOv8 detects a small set of high-value objects and maps practical aliases such as `cup -> mug`.
3. The tracker keeps the latest visible position and marks objects as out of view after a disappearance threshold.
4. Metadata is written to `data/project-anchor.db` in two SQLite tables:
   - `object_sightings`
   - `object_latest_state`
5. The Next.js dashboard reads the local SQLite file through server-side helpers in [lib/anchor/store.ts](/Users/chase/code/ignite-2026/IgniteHack/lib/anchor/store.ts).
6. Query parsing in [lib/anchor/query.ts](/Users/chase/code/ignite-2026/IgniteHack/lib/anchor/query.ts) answers deterministic prompts such as:
   - `Where are my keys?`
   - `When did you last see my glasses?`
   - `Is my wallet visible right now?`

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

1. Install the Next.js dependencies:

```bash
npm install
```

2. Add your Supabase project URL and anon key to `.env.local`.

3. Install the Python worker dependencies:

```bash
cd vision
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ..
```

4. Start the web app:

```bash
npm run dev
```

5. In a second terminal, start the local vision worker:

```bash
cd vision
source .venv/bin/activate
python main.py --preview
```

If the default camera is not the one you want, inspect the available indexes and launch a specific source:

```bash
python main.py --list-cameras
python main.py --camera 1 --calibrate
python main.py --camera 1 --preview
```

The worker defaults to camera `0` and runs YOLO on every frame unless you raise `--frame-skip`. It also runs
inference over calibrated zone crops to make small tabletop objects easier to detect.

6. Open `http://localhost:3000`, sign in, and use the dashboard query box to ask Anchor where an object was last seen.

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

- `GET /api/anchor/status`
- `GET /api/anchor/objects`
- `GET /api/anchor/objects?object=keys`
- `GET /api/anchor/query?q=Where%20are%20my%20keys%3F`

## Demo Notes

- Default YOLO weights are strongest for `mug`, `glasses`, `phone`, and bag-like substitutes.
- `keys` and `wallet` may need custom weights later, but the system already supports those labels in storage and query flows.
- For the hackathon MVP, do not add voice or custom model training until the text-query path is stable.

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
