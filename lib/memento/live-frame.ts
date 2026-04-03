import path from "node:path";

const DEFAULT_LIVE_FRAME_PATH = path.join(process.cwd(), "data", "live-frame.jpg");

export function getLiveFramePath() {
  return process.env.MEMENTO_LIVE_FRAME_PATH ?? DEFAULT_LIVE_FRAME_PATH;
}
