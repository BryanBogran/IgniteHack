import "server-only";

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import type {
  AnchorDashboardData,
  AnchorObjectState,
  AnchorSighting,
  AnchorSystemStatus,
} from "@/lib/anchor/types";

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "memento.db");

type SqliteConnection = InstanceType<typeof Database>;

let connection: SqliteConnection | null = null;

function getDatabasePath() {
  return process.env.ANCHOR_DB_PATH ?? DEFAULT_DB_PATH;
}

function getConnection() {
  if (connection) {
    return connection;
  }

  const databasePath = getDatabasePath();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  connection = new Database(databasePath);
  connection.pragma("journal_mode = WAL");
  connection.exec(`
    create table if not exists object_sightings (
      id integer primary key autoincrement,
      object_label text not null,
      bbox_x1 real,
      bbox_y1 real,
      bbox_x2 real,
      bbox_y2 real,
      center_x real,
      center_y real,
      zone_name text,
      confidence real,
      seen_at text not null,
      track_id integer,
      state text not null check(state in ('visible', 'last_seen'))
    );

    create table if not exists object_latest_state (
      object_label text primary key,
      zone_name text,
      last_seen_at text,
      is_visible integer not null default 0,
      last_confidence real,
      last_center_x real,
      last_center_y real,
      last_track_id integer,
      visibility_state text not null default 'never_seen' check(visibility_state in ('visible', 'last_seen', 'never_seen'))
    );

    create table if not exists system_state (
      key text primary key,
      value text not null
    );
  `);

  return connection;
}

function mapObjectState(row: Record<string, unknown>): AnchorObjectState {
  return {
    objectLabel: String(row.object_label),
    zoneName: row.zone_name ? String(row.zone_name) : null,
    lastSeenAt: row.last_seen_at ? String(row.last_seen_at) : null,
    isVisible: Boolean(row.is_visible),
    lastConfidence: typeof row.last_confidence === "number" ? row.last_confidence : null,
    lastCenterX: typeof row.last_center_x === "number" ? row.last_center_x : null,
    lastCenterY: typeof row.last_center_y === "number" ? row.last_center_y : null,
    lastTrackId: typeof row.last_track_id === "number" ? row.last_track_id : null,
    visibilityState:
      row.visibility_state === "visible" || row.visibility_state === "last_seen"
        ? row.visibility_state
        : "never_seen",
  };
}

function mapSighting(row: Record<string, unknown>): AnchorSighting {
  return {
    id: Number(row.id),
    objectLabel: String(row.object_label),
    zoneName: row.zone_name ? String(row.zone_name) : null,
    seenAt: String(row.seen_at),
    confidence: typeof row.confidence === "number" ? row.confidence : null,
    state: row.state === "last_seen" ? "last_seen" : "visible",
    trackId: typeof row.track_id === "number" ? row.track_id : null,
  };
}

export function getLatestObjectState(objectName: string) {
  const db = getConnection();
  const row = db
    .prepare(
      `
        select *
        from object_latest_state
        where lower(object_label) = lower(?)
        limit 1
      `,
    )
    .get(objectName) as Record<string, unknown> | undefined;

  return row ? mapObjectState(row) : null;
}

export function getTrackedObjects() {
  const db = getConnection();
  const rows = db
    .prepare(
      `
        select *
        from object_latest_state
        order by
          case visibility_state when 'visible' then 0 when 'last_seen' then 1 else 2 end,
          object_label asc
      `,
    )
    .all() as Record<string, unknown>[];

  return rows.map(mapObjectState);
}

export function getRecentSightings(limit = 10) {
  const db = getConnection();
  const rows = db
    .prepare(
      `
        select id, object_label, zone_name, seen_at, confidence, state, track_id
        from object_sightings
        order by datetime(seen_at) desc, id desc
        limit ?
      `,
    )
    .all(limit) as Record<string, unknown>[];

  return rows.map(mapSighting);
}

export function getSystemStatus(): AnchorSystemStatus {
  const db = getConnection();
  const heartbeatRow = db
    .prepare(`select value from system_state where key = 'last_heartbeat_at' limit 1`)
    .get() as { value?: string } | undefined;
  const objectCountRow = db
    .prepare(
      `
        select
          count(*) as tracked_objects,
          sum(case when is_visible = 1 then 1 else 0 end) as visible_objects,
          max(last_seen_at) as last_update_at
        from object_latest_state
      `,
    )
    .get() as {
    tracked_objects?: number;
    visible_objects?: number | null;
    last_update_at?: string | null;
  };

  const lastHeartbeatAt = heartbeatRow?.value ?? null;
  const lastHeartbeatMs = lastHeartbeatAt ? new Date(lastHeartbeatAt).getTime() : 0;
  const cameraOnline = Boolean(lastHeartbeatMs) && Date.now() - lastHeartbeatMs < 30_000;

  return {
    cameraOnline,
    trackedObjects: Number(objectCountRow?.tracked_objects ?? 0),
    visibleObjects: Number(objectCountRow?.visible_objects ?? 0),
    lastHeartbeatAt,
    lastUpdateAt: objectCountRow?.last_update_at ?? lastHeartbeatAt ?? null,
    databasePath: getDatabasePath(),
  };
}

export function getAnchorDashboardData(limit = 12): AnchorDashboardData {
  return {
    objects: getTrackedObjects(),
    sightings: getRecentSightings(limit),
    status: getSystemStatus(),
  };
}
