from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import DEFAULT_DB_PATH


DEFAULT_FRAME_WIDTH = float(os.environ.get("MEMENTO_FRAME_WIDTH", "1280"))
DEFAULT_FRAME_HEIGHT = float(os.environ.get("MEMENTO_FRAME_HEIGHT", "720"))


def get_database_path() -> Path:
    return Path(os.environ.get("MEMENTO_DB_PATH", DEFAULT_DB_PATH)).expanduser()


def get_connection() -> sqlite3.Connection:
    connection = sqlite3.connect(get_database_path(), timeout=5.0)
    connection.row_factory = sqlite3.Row
    connection.execute("pragma busy_timeout = 5000")
    return connection


def normalize_coordinate(value: Any, dimension: float) -> float | None:
    if value is None:
        return None

    numeric = float(value)
    if numeric <= 1.0:
        return max(0.0, min(1.0, numeric))

    if dimension <= 0:
        return None

    return max(0.0, min(1.0, numeric / dimension))


def to_percent_coordinate(value: Any, dimension: float) -> int:
    normalized = normalize_coordinate(value, dimension)
    if normalized is None:
        return 0

    return int(round(normalized * 100))


app = FastAPI(title="Memento API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/objects")
def get_objects() -> dict[str, dict[str, object]]:
    database_path = get_database_path()
    if not database_path.exists():
        return {}

    connection = get_connection()

    try:
        rows = connection.execute(
            """
            select
              object_label,
              zone_name,
              last_seen_at,
              last_center_x,
              last_center_y
            from object_latest_state
            where visibility_state != 'never_seen'
            order by object_label asc
            """
        ).fetchall()

        return {
            str(row["object_label"]): {
                "location": row["zone_name"] or "unknown_zone",
                "last_seen": row["last_seen_at"],
                "x": to_percent_coordinate(row["last_center_x"], DEFAULT_FRAME_WIDTH),
                "y": to_percent_coordinate(row["last_center_y"], DEFAULT_FRAME_HEIGHT),
            }
            for row in rows
        }
    finally:
        connection.close()


if __name__ == "__main__":
    uvicorn.run("memento_api:app", host="0.0.0.0", port=5050, reload=False)
