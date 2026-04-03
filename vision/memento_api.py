from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware


DEFAULT_FRAME_WIDTH = float(os.environ.get("MEMENTO_FRAME_WIDTH", "1280"))
DEFAULT_FRAME_HEIGHT = float(os.environ.get("MEMENTO_FRAME_HEIGHT", "720"))


def get_database_path() -> Path:
    return Path(os.environ.get("MEMENTO_DB_PATH", Path(__file__).resolve().parents[1] / "data" / "memento.db")).expanduser()


def get_connection() -> sqlite3.Connection:
    database_path = get_database_path()
    database_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(database_path)
    connection.row_factory = sqlite3.Row
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


app = FastAPI(title="Memento Local API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/objects")
def get_objects(object_label: str | None = Query(default=None, alias="object")) -> dict[str, Any]:
    connection = get_connection()

    try:
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

        query += """
            order by
              case visibility_state when 'visible' then 0 when 'last_seen' then 1 else 2 end,
              object_label asc
        """

        rows = connection.execute(query, params).fetchall()
        objects = [
            {
                "label": row["object_label"],
                "object_label": row["object_label"],
                "zone_name": row["zone_name"],
                "last_seen_at": row["last_seen_at"],
                "is_visible": bool(row["is_visible"]),
                "confidence": row["last_confidence"],
                "x": normalize_coordinate(row["last_center_x"], DEFAULT_FRAME_WIDTH),
                "y": normalize_coordinate(row["last_center_y"], DEFAULT_FRAME_HEIGHT),
                "center_x": row["last_center_x"],
                "center_y": row["last_center_y"],
                "track_id": row["last_track_id"],
                "visibility_state": row["visibility_state"],
            }
            for row in rows
        ]

        if object_label and not objects:
            raise HTTPException(status_code=404, detail=f"No object found for '{object_label}'")

        return {
            "objects": objects,
            "count": len(objects),
            "database_path": str(get_database_path()),
        }
    finally:
        connection.close()
