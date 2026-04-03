from __future__ import annotations

import sqlite3
from pathlib import Path


class AnchorStorage:
    def __init__(self, database_path: Path) -> None:
        database_path.parent.mkdir(parents=True, exist_ok=True)
        self.connection = sqlite3.connect(database_path)
        self.connection.row_factory = sqlite3.Row
        self._ensure_schema()

    def _ensure_schema(self) -> None:
        self.connection.executescript(
            """
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
            """
        )
        self.connection.commit()

    def record_heartbeat(self, seen_at: str) -> None:
        self.connection.execute(
            """
            insert into system_state (key, value)
            values ('last_heartbeat_at', ?)
            on conflict(key) do update set value = excluded.value
            """,
            (seen_at,),
        )
        self.connection.commit()

    def record_worker_status(self, key: str, value: str) -> None:
        self.connection.execute(
            """
            insert into system_state (key, value)
            values (?, ?)
            on conflict(key) do update set value = excluded.value
            """,
            (key, value),
        )
        self.connection.commit()

    def record_detection(self, detection, zone_name: str, seen_at: str, track_id: int) -> None:
        latest_row = self.connection.execute(
            """
            select zone_name, last_seen_at, is_visible
            from object_latest_state
            where object_label = ?
            """,
            (detection.label,),
        ).fetchone()

        should_append_history = True
        if latest_row:
            last_seen_at = latest_row["last_seen_at"]
            same_zone = latest_row["zone_name"] == zone_name
            still_visible = latest_row["is_visible"] == 1
            if same_zone and still_visible and last_seen_at:
                last_seen_seconds = seen_at_to_seconds(last_seen_at)
                current_seconds = seen_at_to_seconds(seen_at)
                should_append_history = current_seconds - last_seen_seconds >= 2.0

        if should_append_history:
            self.connection.execute(
                """
                insert into object_sightings (
                  object_label, bbox_x1, bbox_y1, bbox_x2, bbox_y2,
                  center_x, center_y, zone_name, confidence, seen_at, track_id, state
                )
                values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'visible')
                """,
                (
                    detection.label,
                    detection.bbox_x1,
                    detection.bbox_y1,
                    detection.bbox_x2,
                    detection.bbox_y2,
                    detection.center_x,
                    detection.center_y,
                    zone_name,
                    detection.confidence,
                    seen_at,
                    track_id,
                ),
            )

        self.connection.execute(
            """
            insert into object_latest_state (
              object_label, zone_name, last_seen_at, is_visible, last_confidence,
              last_center_x, last_center_y, last_track_id, visibility_state
            )
            values (?, ?, ?, 1, ?, ?, ?, ?, 'visible')
            on conflict(object_label) do update set
              zone_name = excluded.zone_name,
              last_seen_at = excluded.last_seen_at,
              is_visible = 1,
              last_confidence = excluded.last_confidence,
              last_center_x = excluded.last_center_x,
              last_center_y = excluded.last_center_y,
              last_track_id = excluded.last_track_id,
              visibility_state = 'visible'
            """,
            (
                detection.label,
                zone_name,
                seen_at,
                detection.confidence,
                detection.center_x,
                detection.center_y,
                track_id,
            ),
        )
        self.connection.commit()

    def mark_missing(self, track) -> None:
        self.connection.execute(
            """
            insert into object_sightings (
              object_label, center_x, center_y, zone_name, confidence, seen_at, track_id, state
            )
            values (?, ?, ?, ?, ?, ?, ?, 'last_seen')
            """,
            (
                track.label,
                track.center_x,
                track.center_y,
                track.zone_name,
                track.confidence,
                track.seen_at,
                track.track_id,
            ),
        )
        self.connection.execute(
            """
            update object_latest_state
            set is_visible = 0,
                visibility_state = 'last_seen',
                zone_name = ?,
                last_seen_at = ?,
                last_confidence = ?,
                last_center_x = ?,
                last_center_y = ?,
                last_track_id = ?
            where object_label = ?
            """,
            (
                track.zone_name,
                track.seen_at,
                track.confidence,
                track.center_x,
                track.center_y,
                track.track_id,
                track.label,
            ),
        )
        self.connection.commit()

    def close(self) -> None:
        self.connection.close()


def seen_at_to_seconds(value: str) -> float:
    from datetime import datetime

    return datetime.fromisoformat(value).timestamp()
