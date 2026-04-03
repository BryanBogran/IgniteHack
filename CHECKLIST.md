# Project Anchor Checklist

This file summarizes what is done, what is not done, and what should be refined next based on [PLAN.md](/Users/chase/code/ignite-2026/IgniteHack/PLAN.md).

## Simplified Architecture

- Python is the only process that writes Anchor memory data.
- Next.js is read-only and should only query SQLite through the shared server-side read layer.
- SQLite remains the single local source of truth for:
  - latest object state
  - sighting history
  - worker heartbeat / camera status
- Deterministic text queries stay rule-based. Do not add a chat layer for the MVP.

## Done

- [x] Two-process MVP architecture exists: local Python vision worker plus Next.js dashboard.
- [x] Local SQLite memory store exists for sightings, latest state, and system status.
- [x] Webcam capture, YOLO detection, tracking, and metadata persistence are wired together.
- [x] Named drop zones exist and can be calibrated manually.
- [x] Disappearance / last-seen logic exists.
- [x] Next.js can read local memory data through server-side helpers.
- [x] Dashboard UI exists for system status, tracked objects, timeline, and text queries.
- [x] Deterministic query interpreter exists for:
  - `where are my X`
  - `when did you last see X`
  - `is X visible now`
- [x] Rebrand/privacy-first messaging is mostly in place.
- [x] Dashboard rendering has one shared data path instead of duplicated authenticated/demo layouts.
- [x] Worker/database path handling is consistent across Python and Next.js.
- [x] Worker stores camera-read failures in SQLite and retries capture instead of crashing immediately.

## Not Done

- [ ] Detection quality is reliable enough on real hardware.
- [ ] Camera behavior is proven stable for the actual demo setup over time.
- [ ] Camera disconnect/recovery is explicitly handled and tested.
- [ ] Zone setup is product-grade UX instead of OpenCV/terminal calibration.
- [ ] Dashboard includes a polished zone-map or equivalent visual memory aid.
- [ ] Final object list is frozen for the MVP demo.
- [ ] iOS app exists.
- [ ] Siri / App Intents / Shortcuts integration exists.

## Main Risks

- [ ] Phone and mug confusion is still happening.
- [ ] Detection weakens too much at close range and at 6-7+ feet.
- [ ] Inference settings can make the whole machine lag.
- [ ] Current solution still depends on camera placement and lighting more than the product should.

## Next For Demo

- [ ] Standardize one stable camera setup for the demo:
  - camera position
  - field of view
  - lighting
  - distance to drop zones
- [ ] Freeze the MVP object list to the classes YOLO can actually detect reliably.
- [ ] Benchmark a few fixed inference presets on the real hardware:
  - low-lag default
  - high-accuracy testing mode
- [ ] Decide whether `yolov8n` is good enough or whether to move to `yolov8s`.
- [ ] Add a temporary raw-label debug mode so the model’s actual classifications are visible during testing.
- [ ] Run the full end-to-end flow for at least 10 uninterrupted minutes on hackathon hardware.
- [ ] Verify that:
  - detections reach SQLite
  - last-seen updates work
  - dashboard answers stay correct

## Next For Product Refinement

- [ ] Replace developer-style calibration with guided in-app setup.
- [ ] Keep zones as normalized rectangles and preserve the current data contract.
- [ ] Define the final product contract for object memory:
  - `object_label`
  - `zone_name`
  - `last_seen_at`
  - `is_visible`
  - confidence
  - coordinates
- [ ] Decide how zone editing/recalibration should work after initial setup.
- [ ] Improve detection reliability before expanding scope.

## Next For iOS + Siri

These remain explicitly out of scope for the hackathon MVP until the local desktop demo is stable.

- [ ] Define the iOS architecture equivalent of the Python worker.
- [ ] Keep the same local-first memory model on device.
- [ ] Decide on local iOS persistence layer:
  - SQLite
  - Core Data
  - SwiftData
- [ ] Implement deterministic query intents in iOS before attempting any chat UX.
- [ ] Add App Intents / Shortcuts support for:
  - `Where are my keys?`
  - `When did you last see my glasses?`
  - `Is my wallet visible?`
- [ ] Design final mobile zone setup UX around live camera preview.
- [ ] Make sure Siri answers come from local structured lookups, not a generative layer.

## Scope Guardrails

- [ ] Do not add a full conversational AI layer before the deterministic query path is stable.
- [ ] Do not start custom model training unless baseline YOLO still fails after camera/setup/model tuning.
- [ ] Do not move vision-memory storage into Supabase for the MVP.
- [ ] Do not persist frames; only store object metadata.

## Suggested Order

1. Stabilize detection on one real camera setup.
2. Freeze the MVP object list and inference preset.
3. Validate full demo reliability.
4. Turn zone setup into real product UX.
5. Port the local memory/query model to iOS.
6. Add Siri/App Intents on top of that stable local contract.
