export const mementoObjects = [
  "keys",
  "wallet",
  "glasses",
  "mug",
  "phone",
  "bag",
] as const;

export type MementoObjectName = (typeof mementoObjects)[number];

export type MementoObjectState = {
  objectLabel: string;
  zoneName: string | null;
  lastSeenAt: string | null;
  isVisible: boolean;
  lastConfidence: number | null;
  lastCenterX: number | null;
  lastCenterY: number | null;
  lastTrackId: number | null;
  visibilityState: "visible" | "last_seen" | "never_seen";
};

export type MementoSighting = {
  id: number;
  objectLabel: string;
  zoneName: string | null;
  seenAt: string;
  confidence: number | null;
  state: "visible" | "last_seen";
  trackId: number | null;
};

export type MementoSystemStatus = {
  cameraOnline: boolean;
  trackedObjects: number;
  visibleObjects: number;
  lastHeartbeatAt: string | null;
  lastUpdateAt: string | null;
  databasePath: string;
};

export type MementoQueryResult = {
  query: string;
  matched: boolean;
  intent: "where" | "when" | "visible" | "unsupported";
  objectLabel: string | null;
  answer: string;
  objectState: MementoObjectState | null;
};

export type MementoDashboardData = {
  objects: MementoObjectState[];
  sightings: MementoSighting[];
  status: MementoSystemStatus;
};
