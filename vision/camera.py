from __future__ import annotations

import cv2


class WebcamStream:
    def __init__(self, source: int = 0, width: int = 1280, height: int = 720) -> None:
        self.source = source
        self.width = width
        self.height = height
        self.capture = cv2.VideoCapture(source)
        self.capture.set(cv2.CAP_PROP_FRAME_WIDTH, width)
        self.capture.set(cv2.CAP_PROP_FRAME_HEIGHT, height)

        if not self.capture.isOpened():
            raise RuntimeError(f"Unable to open webcam source {source}.")

    def read(self):
        ok, frame = self.capture.read()
        if not ok:
            raise RuntimeError("Failed to read frame from webcam.")
        return frame

    def release(self) -> None:
        if self.capture.isOpened():
            self.capture.release()
