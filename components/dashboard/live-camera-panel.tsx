"use client";

import { useEffect, useState } from "react";
import { Camera, Pause, Play, RefreshCw, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const REFRESH_MS = 500;
const INITIAL_FRAME_URL = "/api/memento/live-frame";

function buildFrameUrl() {
  return `/api/memento/live-frame?t=${Date.now()}`;
}

export function LiveCameraPanel() {
  const [frameUrl, setFrameUrl] = useState(INITIAL_FRAME_URL);
  const [isOnline, setIsOnline] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let interval: number | null = null;

    const loadLatestFrame = () =>
      new Promise<void>((resolve) => {
        const nextUrl = buildFrameUrl();
        const image = new window.Image();

        image.onload = () => {
          if (!cancelled) {
            setFrameUrl(nextUrl);
            setIsOnline(true);
            setLastUpdatedAt(Date.now());
          }
          resolve();
        };

        image.onerror = () => {
          if (!cancelled) {
            setIsOnline(false);
          }
          resolve();
        };

        image.src = nextUrl;
      });

    void loadLatestFrame();

    if (isRefreshing) {
      interval = window.setInterval(() => {
        void loadLatestFrame();
      }, REFRESH_MS);
    }

    return () => {
      cancelled = true;
      if (interval !== null) {
        window.clearInterval(interval);
      }
    };
  }, [isRefreshing]);

  return (
    <Card
      className="overflow-hidden border-[rgba(77,193,175,0.24)] bg-[linear-gradient(135deg,rgba(7,21,28,0.98),rgba(11,30,39,0.94))] p-0 text-white"
      aria-labelledby="live-camera-heading"
      aria-describedby="live-camera-description live-camera-status"
    >
      <div className="flex flex-col gap-6 p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3">
              <Badge className="bg-white/10 text-white" variant="outline">
                Live camera view
              </Badge>
              <Badge variant={isOnline ? "soft" : "outline"}>{isOnline ? "Worker frame available" : "Waiting for worker"}</Badge>
            </div>
            <h1
              id="live-camera-heading"
              className="mt-4 text-3xl font-semibold tracking-tight text-white [text-shadow:0_8px_30px_rgba(0,0,0,0.45)] [font-family:var(--font-display)] sm:text-5xl"
            >
              See the current webcam feed directly from the dashboard.
            </h1>
            <p id="live-camera-description" className="mt-4 max-w-2xl text-sm leading-7 text-white/82 sm:text-base">
              The Python worker owns the webcam and publishes the latest processed frame here so you can monitor zones,
              object visibility, and camera positioning without leaving the website.
            </p>
          </div>
          <div className="grid gap-4 rounded-[1.75rem] border border-white/12 bg-black/24 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10">
                <Camera className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Source</p>
                <p className="mt-1 text-sm font-medium text-white">Local Python webcam worker</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-white/10">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-white/60">Privacy</p>
                <p className="mt-1 text-sm font-medium text-white">Only the latest frame is exposed to the UI</p>
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsRefreshing((current) => !current)}
              aria-pressed={!isRefreshing}
            >
              {isRefreshing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
              {isRefreshing ? "Pause live updates" : "Resume live updates"}
            </Button>
            <p id="live-camera-status" className="text-xs text-white/65" aria-live="polite">
              {isRefreshing
                ? lastUpdatedAt
                  ? `Live camera updates every 0.5 seconds. Last good frame ${new Intl.DateTimeFormat("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      second: "2-digit",
                    }).format(lastUpdatedAt)}.`
                  : "Live camera updates every 0.5 seconds."
                : "Live camera updates paused."}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/70">
          <img
            src={frameUrl}
            alt="Live webcam feed from the Memento worker"
            className="aspect-video w-full object-cover"
            aria-describedby="live-camera-description"
          />
        </div>

        {!isOnline ? (
          <div className="flex items-start gap-3 rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/75" role="status" aria-live="polite">
            <RefreshCw className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              No live frame is available yet. Start the vision worker and keep it running so the dashboard can refresh
              the webcam view.
            </p>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
