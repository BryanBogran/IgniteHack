from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


DEFAULT_DB_PATH = Path(__file__).resolve().parents[1] / "data" / "project-anchor.db"


def get_database_path() -> Path:
    configured = os.environ.get("ANCHOR_DB_PATH")
    if configured:
        return Path(configured).expanduser().resolve()
    return DEFAULT_DB_PATH


def open_connection() -> sqlite3.Connection:
    db_path = get_database_path()
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
    return connection


app = FastAPI(title="Project Anchor Local API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, Any]:
    db_path = get_database_path()
    return {
        "ok": True,
        "database_path": str(db_path),
        "database_exists": db_path.exists(),
    }


@app.get("/api/objects")
def get_objects(object_label: str | None = Query(default=None, alias="object")) -> dict[str, Any]:
    db_path = get_database_path()
    if not db_path.exists():
        raise HTTPException(status_code=500, detail=f"Database not found at {db_path}")

    query = """
        select
          object_label,
          zone_name,
          last_seen_at,
          is_visible,
          last_confidence,
          last_center_x,
          last_center_y,
          last_track_id,
          visibility_state
        from object_latest_state
    """
    params: tuple[Any, ...] = ()

    if object_label:
        query += " where lower(object_label) = lower(?)"
        params = (object_label,)

    query += " order by object_label asc"

    try:
        with open_connection() as connection:
            rows = connection.execute(query, params).fetchall()
            heartbeat_row = connection.execute(
                "select value from system_state where key = 'last_heartbeat_at'"
            ).fetchone()
            camera_error_row = connection.execute(
                "select value from system_state where key = 'camera_error'"
            ).fetchone()
    except sqlite3.Error as error:
        raise HTTPException(status_code=500, detail=f"SQLite error: {error}") from error

    objects = [
        {
            "label": row["object_label"],
            "zoneName": row["zone_name"],
            "lastSeenAt": row["last_seen_at"],
            "isVisible": bool(row["is_visible"]),
            "confidence": row["last_confidence"],
            "centerX": row["last_center_x"],
            "centerY": row["last_center_y"],
            "trackId": row["last_track_id"],
            "visibilityState": row["visibility_state"],
        }
        for row in rows
    ]

    if object_label and not objects:
        raise HTTPException(status_code=404, detail=f"No object found for '{object_label}'")

    return {
        "objects": objects,
        "count": len(objects),
        "worker": {
            "lastHeartbeatAt": heartbeat_row["value"] if heartbeat_row else None,
            "cameraError": camera_error_row["value"] if camera_error_row else "",
        },
    }


if __name__ == "__main__":
    host = os.environ.get("ANCHOR_API_HOST", "0.0.0.0")
    port = int(os.environ.get("ANCHOR_API_PORT", "8765"))
    uvicorn.run("anchor_api:app", host=host, port=port, reload=False)
