# Project Anchor MVP Plan

## Summary

Build Project Anchor as a two-process local system:

- A **Python edge vision worker** watches one room-facing webcam, detects a short whitelist of high-value objects, tracks their last visible position, writes only metadata to a local store, and discards frames immediately.
- The existing **Next.js app** becomes the user-facing dashboard and query surface where a signed-in user can ask “Where are my keys?” and see the latest known location, timestamp, and confidence.
- Keep the current **Next.js App Router + Supabase SSR auth** intact for the web experience, but treat Supabase as app auth/project storage only. For the hackathon MVP, use **SQLite locally for object memory events** because it is faster to ship than bending the current schema around a realtime vision loop.

## Implementation Changes

### 1. MVP architecture and data flow

1. Webcam frames are captured locally by a Python script using OpenCV.
2. Each frame is passed to a lightweight YOLOv8 detector restricted to a small class list:
   `keys`, `wallet`, `glasses`, `mug`, plus a few practical substitutes if the model lacks exact classes.
3. The detector returns bounding boxes, class labels, and confidence scores.
4. A simple tracker assigns continuity across frames so the system knows whether an object is still visible, newly placed, or has disappeared.
5. The script converts each detection into room-relative metadata:
   `object_label`, `timestamp`, `bbox`, `center_x`, `center_y`, `zone_name`, `confidence`, `track_id`, `visibility_state`.
6. The script stores only metadata in a local SQLite database:
   one table for latest object state, one append-only table for sightings/history.
7. When an object disappears, the tracker marks its state as `last_seen` and preserves the final visible location and timestamp.
8. The Next.js app reads from SQLite through a server-side API route or server action and answers natural-language-lite queries such as:
   “Where are my keys?”
   “When were my glasses last seen?”
9. The dashboard renders:
   latest known location, time last seen, a plain-language explanation, and optionally a still image placeholder or zone map later if time remains.

### 2. Concrete build sequence for the next 48 hours

1. **Rebrand the app for Project Anchor**
   Replace landing-page copy and dashboard messaging so the product clearly targets TBI-related memory support, privacy-first local processing, and “ambient memory prosthetic” positioning.

2. **Create the local vision workspace**
   Add a small Python package outside the main Next runtime for:
   `camera.py`, `detect.py`, `tracker.py`, `storage.py`, `main.py`.
   Keep dependencies minimal: `opencv-python`, `ultralytics`, and standard-library `sqlite3`.

3. **Bootstrap the detection loop first**
   First working milestone:
   webcam feed opens, YOLO runs on every Nth frame, terminal prints:
   object label, confidence, bounding box, and timestamp.
   This is the code skeleton stage and should be the first demoable artifact.

4. **Add room “drop zone” mapping**
   Define 3-5 named regions in config such as:
   `desk`, `entry_table`, `nightstand`, `dresser`.
   Convert raw bounding-box centers into those human-readable zones so the product says “on the desk” instead of pixel coordinates.

5. **Persist object memory**
   Add SQLite tables:
   `object_sightings`
   `object_latest_state`
   Write one history row for meaningful sightings and upsert the latest known state per object label.

6. **Implement disappearance logic**
   If an item is no longer detected for a threshold window, mark it `not_visible` but keep:
   last zone, last coordinates, and last timestamp.
   This is the MVP answer for occlusion and drawers.

7. **Connect the web app to local memory data**
   Add a server-side read layer in the Next app that can fetch:
   latest state by object name,
   recent sightings,
   and system health.
   Keep writes out of Next; Python owns ingestion.

8. **Replace the dashboard with Anchor-specific UI**
   Turn the current dashboard into:
   system status,
   tracked objects,
   recent memory timeline,
   and a simple “Ask Anchor” query form.
   The answer card should say things like:
   “Your keys were last seen on the entry table at 8:14 PM.”

9. **Add a simple query interpreter**
   Do not build a full chatbot.
   Map a small set of phrases to object lookups:
   `where are my X`
   `when did you last see X`
   `is X visible now`
   This is enough for a hackathon demo and far more reliable.

10. **Polish for demo impact**
    Add one live status indicator:
    `Camera online`, `Objects tracked`, `Last update`.
    Add one strong privacy callout:
    `Frames processed locally and discarded immediately`.

11. **Prepare the pitch narrative**
    Demo flow:
    place keys on table,
    system logs them,
    move keys out of sight,
    ask Anchor,
    dashboard answers with last known location and time,
    emphasize zero-friction memory support for users who cannot rely on manual logging.

### 3. Public interfaces and data contracts

- Python detection output record:
  `label`, `confidence`, `bbox_x1`, `bbox_y1`, `bbox_x2`, `bbox_y2`, `center_x`, `center_y`, `zone_name`, `seen_at`, `track_id`, `state`
- SQLite `object_latest_state` should expose:
  `object_label`, `zone_name`, `last_seen_at`, `is_visible`, `last_confidence`, `last_center_x`, `last_center_y`
- Next.js read interface should support:
  `getLatestObjectState(objectName)`
  `getRecentSightings(limit)`
  `getSystemStatus()`

## Test Plan

- Camera test: webcam opens reliably and recovers cleanly from a temporary disconnect.
- Detection test: known objects print detections with coordinates and confidence.
- Zone test: an object placed in each configured region maps to the correct human-readable drop zone.
- Persistence test: detections create history rows and update latest-state rows correctly.
- Occlusion test: when an object disappears, the UI still returns the final visible location and timestamp.
- Query test: “Where are my keys?” and “When were my glasses last seen?” return the correct latest-state answers.
- Demo test: full end-to-end run on the actual hackathon hardware for at least 10 uninterrupted minutes.

## Assumptions and Defaults

- Default storage is **SQLite**, not JSON, because querying and updating “latest known state” is much easier and still fully local.
- The first demo supports a **small fixed object list** only. Do not attempt open-world object recognition in MVP.
- The first UX is **text query in the dashboard**. Voice is explicitly out of scope unless everything else is already stable.
- The existing Supabase setup remains for user auth and app structure, but **vision memory data stays local** and separate from Supabase for the hackathon build.
- Frames are **never persisted** in MVP. Only object metadata is stored.

## Hackathon Warnings

- **Avoid custom model training.** Do not spend the weekend collecting data or fine-tuning YOLO unless the base model completely fails. Narrow the object list and tune thresholds instead.
- **Avoid building a real conversational AI layer too early.** A deterministic parser for 5-10 query patterns will look polished in a demo and will be much more reliable than chasing speech/NLP edge cases.
