from __future__ import annotations

import platform
import time

import cv2


class WebcamStream:
    def __init__(
        self,
        source: int | str = "auto",
        width: int = 1280,
        height: int = 720,
        warmup_frames: int = 12,
        open_timeout_seconds: float = 2.0,
    ) -> None:
        self.source = source
        self.width = width
        self.height = height
        self.warmup_frames = max(warmup_frames, 1)
        self.open_timeout_seconds = max(open_timeout_seconds, 0.5)
        self.selected_source: int | str | None = None
        self.selected_backend_name = "unknown"
        self.capture = self._open_capture()

        if not self.capture.isOpened():
            raise RuntimeError(self._build_open_error())

    def read(self):
        deadline = time.monotonic() + self.open_timeout_seconds
        last_error = "camera returned no frames"

        while time.monotonic() < deadline:
            ok, frame = self.capture.read()
            if ok and frame is not None and frame.size > 0:
                return frame
            time.sleep(0.05)

        raise RuntimeError(
            "Failed to read a frame from the webcam. "
            f"Opened source={self.selected_source!r} backend={self.selected_backend_name}. "
            f"Last error: {last_error}."
        )

    def release(self) -> None:
        if self.capture.isOpened():
            self.capture.release()

    def describe(self) -> str:
        return f"source={self.selected_source!r} backend={self.selected_backend_name}"

    def _open_capture(self):
        candidates = self._candidate_sources(self.source)
        failures: list[str] = []

        for source, backend_name, backend_id in candidates:
            capture = cv2.VideoCapture(source, backend_id)
            if not capture.isOpened():
                capture.release()
                failures.append(f"{source!r} via {backend_name}: open failed")
                continue

            capture.set(cv2.CAP_PROP_FRAME_WIDTH, self.width)
            capture.set(cv2.CAP_PROP_FRAME_HEIGHT, self.height)

            if self._warmup_capture(capture):
                self.selected_source = source
                self.selected_backend_name = backend_name
                return capture

            capture.release()
            failures.append(f"{source!r} via {backend_name}: no frames after warmup")

        self._failures = failures
        return cv2.VideoCapture()

    def _warmup_capture(self, capture) -> bool:
        deadline = time.monotonic() + self.open_timeout_seconds
        attempts = 0

        while time.monotonic() < deadline or attempts < self.warmup_frames:
            ok, frame = capture.read()
            attempts += 1
            if ok and frame is not None and frame.size > 0:
                return True
            time.sleep(0.05)

        return False

    def _candidate_sources(self, source: int | str) -> list[tuple[int | str, str, int]]:
        backends = self._preferred_backends()
        if isinstance(source, str) and source.lower() == "auto":
            camera_indexes = range(4)
        else:
            camera_indexes = [source]

        candidates: list[tuple[int | str, str, int]] = []
        seen: set[tuple[int | str, int]] = set()

        for candidate_source in camera_indexes:
            normalized_source = parse_camera_source(candidate_source)
            for backend_name, backend_id in backends:
                key = (normalized_source, backend_id)
                if key in seen:
                    continue
                seen.add(key)
                candidates.append((normalized_source, backend_name, backend_id))

        return candidates

    def _preferred_backends(self) -> list[tuple[str, int]]:
        return preferred_backends()

    def _build_open_error(self) -> str:
        failure_text = "; ".join(getattr(self, "_failures", [])) or "no camera candidates succeeded"
        return (
            f"Unable to open webcam source {self.source!r}. Tried: {failure_text}. "
            "If you are on macOS, verify camera permission for Terminal or your IDE in "
            "System Settings -> Privacy & Security -> Camera. "
            "Run `python main.py --list-cameras` to inspect available indexes."
        )


def parse_camera_source(source: int | str) -> int | str:
    if isinstance(source, int):
        return source

    stripped = source.strip()
    if stripped.lower() == "auto":
        return "auto"
    if stripped.isdigit():
        return int(stripped)
    return stripped


def list_camera_candidates(max_indexes: int = 6) -> list[str]:
    backends = preferred_backends()
    descriptions: list[str] = []

    for index in range(max_indexes):
        available_backends: list[str] = []
        for backend_name, backend_id in backends:
            capture = cv2.VideoCapture(index, backend_id)
            try:
                if not capture.isOpened():
                    continue
                ok, frame = capture.read()
                if ok and frame is not None and frame.size > 0:
                    available_backends.append(backend_name)
            finally:
                capture.release()

        if available_backends:
            descriptions.append(f"camera {index}: {', '.join(available_backends)}")

    return descriptions


def preferred_backends() -> list[tuple[str, int]]:
    os_name = platform.system().lower()
    backend_names = ["CAP_ANY"]

    if os_name == "darwin":
        backend_names = ["CAP_AVFOUNDATION", "CAP_ANY"]
    elif os_name == "windows":
        backend_names = ["CAP_MSMF", "CAP_DSHOW", "CAP_ANY"]
    else:
        backend_names = ["CAP_V4L2", "CAP_GSTREAMER", "CAP_ANY"]

    backends: list[tuple[str, int]] = []
    for backend_name in backend_names:
        backend_id = getattr(cv2, backend_name, None)
        if backend_id is not None:
            backends.append((backend_name.replace("CAP_", ""), backend_id))

    return backends
