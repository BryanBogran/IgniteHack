export const anchorObjects = [
  "keys",
  "wallet",
  "glasses",
  "mug",
  "phone",
  "bag",
] as const;

export type AnchorObjectName = (typeof anchorObjects)[number];

export type AnchorObjectState = {
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

export type AnchorSighting = {
  id: number;
  objectLabel: string;
  zoneName: string | null;
  seenAt: string;
  confidence: number | null;
  state: "visible" | "last_seen";
  trackId: number | null;
};

export type AnchorSystemStatus = {
  cameraOnline: boolean;
  trackedObjects: number;
  visibleObjects: number;
  lastHeartbeatAt: string | null;
  lastUpdateAt: string | null;
  cameraError: string | null;
  databasePath: string;
};

export type AnchorQueryResult = {
  query: string;
  matched: boolean;
  intent: "where" | "when" | "visible" | "unsupported";
  objectLabel: string | null;
  answer: string;
  objectState: AnchorObjectState | null;
};

export type AnchorDashboardData = {
  objects: AnchorObjectState[];
  sightings: AnchorSighting[];
  status: AnchorSystemStatus;
};
