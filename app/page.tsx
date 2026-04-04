"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Clock3,
  Grid3X3,
  ImageOff,
  Lock,
  RefreshCw,
  ScanSearch,
  Wifi,
} from "lucide-react";

type ApiObject = {
  location?: string | null;
  label?: string;
  object_label?: string;
  zone_name?: string | null;
  x?: number | null;
  y?: number | null;
  center_x?: number | null;
  center_y?: number | null;
  last_seen_at?: string | null;
  seen_at?: string | null;
  confidence?: number | null;
  is_visible?: boolean | null;
  objectLabel?: string;
  zoneName?: string | null;
  lastSeenAt?: string | null;
  isVisible?: boolean | null;
  lastConfidence?: number | null;
  lastCenterX?: number | null;
  lastCenterY?: number | null;
};

type ApiResponse = {
  objects?: ApiObject[];
  [key: string]: unknown;
};

type StatusResponse = {
  cameraOnline?: boolean;
  trackedObjects?: number;
  visibleObjects?: number;
  lastHeartbeatAt?: string | null;
  lastUpdateAt?: string | null;
};

type HeatmapItem = {
  id: string;
  label: string;
  zoneName: string | null;
  x: number | null;
  y: number | null;
  confidence: number | null;
  lastSeenAt: string | null;
  isVisible: boolean;
};

const OBJECTS_API_URL = "/api/memento/objects?limit=12";
const STATUS_API_URL = "/api/memento/status";
const LIVE_FRAME_API_URL = "/api/memento/live-frame";

function clampCoordinate(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  if (value > 1) {
    return Math.min(1, Math.max(0, value / 100));
  }

  return Math.min(1, Math.max(0, value));
}

function normaliseItems(payload: ApiResponse): HeatmapItem[] {
  const rawItems = Array.isArray(payload.objects)
    ? payload.objects
    : Object.entries(payload)
        .filter(([key, value]) => value && typeof value === "object")
        .map(([key, value]) => ({
          ...(value as ApiObject),
          label: key,
          object_label: key,
        }));

  return rawItems.map((item, index) => ({
    id: `${item.label ?? item.object_label ?? item.objectLabel ?? "item"}-${index}`,
    label: item.label ?? item.object_label ?? item.objectLabel ?? "Unknown item",
    zoneName: item.zone_name ?? item.zoneName ?? item.location ?? null,
    x: clampCoordinate(item.x ?? item.center_x ?? item.lastCenterX ?? null),
    y: clampCoordinate(item.y ?? item.center_y ?? item.lastCenterY ?? null),
    confidence:
      typeof item.confidence === "number"
        ? item.confidence
        : typeof item.lastConfidence === "number"
          ? item.lastConfidence
          : null,
    lastSeenAt: item.last_seen_at ?? item.lastSeenAt ?? item.seen_at ?? null,
    isVisible: Boolean(item.is_visible ?? item.isVisible),
  }));
}

function formatTimestamp(value: string | null) {
  if (!value) {
    return "No timestamp available";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatRelative(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const deltaMinutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (deltaMinutes < 1) {
    return "just now";
  }
  if (deltaMinutes < 60) {
    return `${deltaMinutes} minute${deltaMinutes === 1 ? "" : "s"} ago`;
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours} hour${deltaHours === 1 ? "" : "s"} ago`;
  }

  const deltaDays = Math.round(deltaHours / 24);
  return `${deltaDays} day${deltaDays === 1 ? "" : "s"} ago`;
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "Unknown";
  }

  return `${Math.round(value * 100)}%`;
}

function toPercent(value: number | null) {
  if (value === null) {
    return "Unknown";
  }

  return `${Math.round(value * 100)}%`;
}

function toPlotPercent(value: number | null, padding = 0.1) {
  const normalized = clampCoordinate(value);
  if (normalized === null) {
    return 50;
  }

  return (padding + normalized * (1 - padding * 2)) * 100;
}

export default function HomePage() {
  const [items, setItems] = useState<HeatmapItem[]>([]);
  const [status, setStatus] = useState("Ready to load the latest lost-items data.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraOnline, setCameraOnline] = useState(false);
  const [frameVersion, setFrameVersion] = useState(0);
  const [frameAvailable, setFrameAvailable] = useState(true);
  const isRefreshingRef = useRef(false);

  const itemsWithCoordinates = useMemo(
    () => items.filter((item) => item.x !== null && item.y !== null),
    [items],
  );

  const visibleItems = items.filter((item) => item.isVisible);
  const liveFrameUrl = `${LIVE_FRAME_API_URL}?t=${frameVersion}`;

  async function loadData(options?: { silent?: boolean }) {
    if (isRefreshingRef.current) {
      return;
    }

    const silent = options?.silent ?? false;
    isRefreshingRef.current = true;

    if (!silent) {
      setIsLoading(true);
      setStatus("Loading the latest lost-items coordinates.");
    }

    setErrorMessage(null);

    try {
      const [objectsResponse, systemStatus] = await Promise.all([
        fetch(OBJECTS_API_URL, { cache: "no-store" }),
        fetch(STATUS_API_URL, { cache: "no-store" }),
      ]);

      if (!objectsResponse.ok) {
        throw new Error(`Request failed with status ${objectsResponse.status}.`);
      }

      if (!systemStatus.ok) {
        throw new Error(`Status request failed with status ${systemStatus.status}.`);
      }

      const payload = (await objectsResponse.json()) as ApiResponse;
      const statusPayload = (await systemStatus.json()) as StatusResponse;
      const nextItems = normaliseItems(payload);

      setItems(nextItems);
      setCameraOnline(Boolean(statusPayload.cameraOnline));
      setStatus(
        `Loaded ${nextItems.length} tracked item${nextItems.length === 1 ? "" : "s"} from local storage.`,
      );
      setFrameVersion(Date.now());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setItems([]);
      setCameraOnline(false);
      setErrorMessage(`Unable to reach the local Memento API. ${message}`);
      setStatus("The heatmap could not load data from the local API.");
    } finally {
      isRefreshingRef.current = false;
      if (!silent) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    void loadData();

    const intervalId = window.setInterval(() => {
      void loadData({ silent: true });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col p-4 md:p-6 lg:p-8">
      <header className="mb-8 flex flex-col items-start justify-between gap-6 border-b border-[#2A3441] pb-6 md:flex-row md:items-center">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <h1 className="text-4xl font-bold tracking-tight text-[#F1F5F9]">Memento</h1>
            <div className="flex items-center gap-2 rounded-full border border-[#2A3441] bg-[#151B26] px-4 py-1.5">
              <span
                className={
                  cameraOnline
                    ? "h-3 w-3 rounded-full bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.7)]"
                    : "h-3 w-3 rounded-full bg-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.55)]"
                }
                aria-hidden="true"
              />
              <span className="text-sm font-medium text-[#F1F5F9]">
                {cameraOnline ? "Local System Online" : "Waiting for camera worker"}
              </span>
            </div>
          </div>
          <p className="max-w-2xl text-lg text-[#94A3B8]">
            Secure, local memory assist. Use this dashboard to locate your frequently misplaced essential items.
          </p>
          <div className="mt-1 flex w-fit items-center gap-2 rounded-md border border-[#2A3441]/60 bg-[#151B26]/60 px-3 py-1 text-[#94A3B8]">
            <Lock className="size-4" aria-hidden="true" />
            <span className="text-sm font-mono">local.memento.device</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={isLoading}
          className="flex min-h-[56px] min-w-[220px] items-center justify-center gap-3 rounded-xl bg-[#0DE2C8] px-8 py-4 text-lg font-bold text-[#0A0E17] shadow-lg shadow-[#0DE2C8]/10 transition-colors hover:bg-[#34F0D9] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0DE2C8]/50 disabled:cursor-not-allowed disabled:opacity-70"
          aria-describedby="dashboard-status"
        >
          <RefreshCw className="size-6" aria-hidden="true" />
          {isLoading ? "Refreshing" : "Refresh Data"}
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-6">
        <section
          aria-live="polite"
          id="dashboard-status"
          className="rounded-2xl border border-[#2A3441] bg-[#151B26] p-4 text-sm text-[#F1F5F9]"
        >
          {status}
          {errorMessage ? <p className="mt-2 text-[#FCA5A5]">{errorMessage}</p> : null}
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <section
            className="flex flex-col overflow-hidden rounded-2xl border border-[#2A3441] bg-[#151B26] lg:col-span-8"
            aria-labelledby="scanner-title"
          >
            <div className="z-10 flex items-center justify-between border-b border-[#2A3441] bg-[#151B26] p-6">
              <h2 id="scanner-title" className="flex items-center gap-3 text-2xl font-semibold text-[#F1F5F9]">
                <ScanSearch className="size-6 text-[#0DE2C8]" aria-hidden="true" />
                Spatial Scanner Context
              </h2>
              <span className="hidden rounded-lg border border-[#2A3441] bg-[#0A0E17] px-3 py-1 text-sm text-[#94A3B8] md:inline-flex">
                Living Room • Camera 1
              </span>
            </div>

            <div className="relative min-h-[320px] flex-1 overflow-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(13,226,200,0.18),transparent_30%),radial-gradient(circle_at_78%_64%,rgba(52,240,217,0.14),transparent_28%),linear-gradient(180deg,#0A0E17_0%,#101723_100%)] p-6">
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,rgba(42,52,65,0.5)_1px,transparent_1px),linear-gradient(to_bottom,rgba(42,52,65,0.5)_1px,transparent_1px)] bg-[size:16.66%_25%]"
                aria-hidden="true"
              />

              <div className="relative z-10 flex h-full flex-col gap-5">
                <div className="flex-1 rounded-2xl border border-[#2A3441] bg-[#0A0E17]/90 p-3 backdrop-blur-sm">
                  {frameAvailable ? (
                    <img
                      src={liveFrameUrl}
                      alt="Live preview from the local Memento camera worker"
                      className="h-full min-h-[360px] w-full rounded-xl border border-[#2A3441] object-cover"
                      onLoad={() => setFrameAvailable(true)}
                      onError={() => setFrameAvailable(false)}
                    />
                  ) : (
                    <div className="flex h-full min-h-[360px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#2A3441] bg-[#111722] px-6 text-center">
                      <ImageOff className="size-8 text-[#94A3B8]" aria-hidden="true" />
                      <p className="max-w-sm text-sm leading-7 text-[#94A3B8]">
                        Camera preview is not available yet. Start the Python worker to publish the latest live frame.
                      </p>
                    </div>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-[#2A3441] bg-[#151B26]/85 p-4 backdrop-blur-sm">
                    <p className="text-sm text-[#94A3B8]">Tracked items</p>
                    <p className="mt-2 text-3xl font-bold text-[#F1F5F9]">{items.length}</p>
                  </div>
                  <div className="rounded-2xl border border-[#2A3441] bg-[#151B26]/85 p-4 backdrop-blur-sm">
                    <p className="text-sm text-[#94A3B8]">Visible now</p>
                    <p className="mt-2 text-3xl font-bold text-[#F1F5F9]">{visibleItems.length}</p>
                  </div>
                  <div className="rounded-2xl border border-[#2A3441] bg-[#151B26]/85 p-4 backdrop-blur-sm">
                    <p className="text-sm text-[#94A3B8]">API status</p>
                    <div className="mt-2 flex items-center gap-2 text-[#F1F5F9]">
                      <Wifi
                        className={cameraOnline ? "size-5 text-[#22C55E]" : "size-5 text-[#F59E0B]"}
                        aria-hidden="true"
                      />
                      <span className="text-lg font-semibold">{cameraOnline ? "Local only" : "Worker offline"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <aside
            className="rounded-2xl border border-[#2A3441] bg-[#151B26] p-6 lg:col-span-4"
            aria-labelledby="items-title"
          >
            <div className="flex items-center gap-3">
              <Grid3X3 className="size-6 text-[#0DE2C8]" aria-hidden="true" />
              <h2 id="items-title" className="text-2xl font-semibold text-[#F1F5F9]">
                Tracked Items
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
              A quick list of the latest known locations and time markers for your essential objects.
            </p>

            <ul className="mt-6 space-y-4">
              {items.length ? (
                items.map((item) => (
                  <li key={item.id} className="rounded-2xl border border-[#2A3441] bg-[#0F141D] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-2xl font-bold text-[#F1F5F9]">{item.label}</h3>
                      <span
                        className={
                          item.isVisible
                            ? "rounded bg-[#0DE2C8] px-2 py-1 text-sm font-bold text-[#0A0E17]"
                            : "rounded bg-[#94A3B8] px-2 py-1 text-sm font-bold text-[#0A0E17]"
                        }
                      >
                        {item.isVisible ? "Visible" : "Last Known"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-base text-[#94A3B8]">
                      <Clock3 className="size-5" aria-hidden="true" />
                      <span>
                        Seen <strong className="text-[#F1F5F9]">{formatRelative(item.lastSeenAt)}</strong>
                      </span>
                    </div>
                    <dl className="mt-4 grid gap-2 text-sm text-[#CBD5E1]">
                      <div className="grid grid-cols-[7rem_1fr] gap-2">
                        <dt className="font-semibold text-[#94A3B8]">Location</dt>
                        <dd>{item.zoneName ? item.zoneName.replace(/_/g, " ") : "Unknown"}</dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] gap-2">
                        <dt className="font-semibold text-[#94A3B8]">Recorded</dt>
                        <dd>{formatTimestamp(item.lastSeenAt)}</dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] gap-2">
                        <dt className="font-semibold text-[#94A3B8]">Heatmap</dt>
                        <dd>
                          x {toPercent(item.x)} • y {toPercent(item.y)}
                        </dd>
                      </div>
                      <div className="grid grid-cols-[7rem_1fr] gap-2">
                        <dt className="font-semibold text-[#94A3B8]">Confidence</dt>
                        <dd>{formatPercent(item.confidence)}</dd>
                      </div>
                    </dl>
                  </li>
                ))
              ) : (
                <li className="rounded-2xl border border-dashed border-[#2A3441] bg-[#0F141D] p-5 text-sm leading-7 text-[#94A3B8]">
                  No tracked items are available yet. Start the local API and refresh the dashboard.
                </li>
              )}
            </ul>
          </aside>
        </div>

        <section
          className="flex flex-col rounded-2xl border border-[#2A3441] bg-[#151B26]"
          aria-labelledby="heatmap-title"
        >
          <div className="flex items-center justify-between border-b border-[#2A3441] p-6">
            <h2 id="heatmap-title" className="flex items-center gap-3 text-2xl font-semibold text-[#F1F5F9]">
              <Grid3X3 className="size-6 text-[#0DE2C8]" aria-hidden="true" />
              Frequently Lost Items Heatmap
            </h2>
            <p className="hidden text-lg text-[#94A3B8] md:block">Grid represents the physical room layout.</p>
          </div>

          <div className="p-6">
            <div
              className="relative h-[400px] w-full overflow-hidden rounded-xl border-2 border-[#2A3441] bg-[#0A0E17] md:h-[500px]"
              aria-hidden="true"
            >
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, #2A3441 2px, transparent 2px), linear-gradient(to bottom, #2A3441 2px, transparent 2px)",
                  backgroundSize: "12.5% 20%",
                }}
              />

              {itemsWithCoordinates.length ? (
                itemsWithCoordinates.map((item) => (
                  <div
                    key={item.id}
                    className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${toPlotPercent(item.x)}%`,
                      top: `${toPlotPercent(item.y)}%`,
                    }}
                  >
                    <div
                      className={
                        item.isVisible
                          ? "h-6 w-6 rounded-full border-4 border-[#0A0E17] bg-[#0DE2C8] shadow-[0_0_20px_rgba(13,226,200,0.8)]"
                          : "h-6 w-6 rounded-full border-4 border-[#94A3B8] bg-transparent"
                      }
                    />
                    <div className="absolute left-8 top-1/2 flex -translate-y-1/2 flex-col items-start gap-2">
                      <div
                        className={
                          item.isVisible
                            ? "rounded-lg border border-[#2A3441] bg-[#151B26]/90 px-3 py-1 text-2xl font-bold text-[#F1F5F9] backdrop-blur-sm md:text-3xl"
                            : "rounded-lg border border-[#2A3441] bg-[#151B26]/90 px-3 py-1 text-2xl font-bold text-[#94A3B8] backdrop-blur-sm md:text-3xl"
                        }
                      >
                        {item.label}
                      </div>
                      {!item.isVisible ? (
                        <div className="rounded bg-[#0A0E17]/80 px-2 py-0.5 text-base text-[#94A3B8]">
                          Last seen here
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="max-w-md rounded-2xl border border-dashed border-[#2A3441] bg-[#111722] p-6 text-center">
                    <h3 className="text-lg font-semibold text-[#F1F5F9]">No coordinates loaded</h3>
                    <p className="mt-3 text-sm leading-7 text-[#94A3B8]">
                      When the local API returns item locations, the heatmap will plot them here.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="sr-only">
              <h3>Locations list</h3>
              <ul>
                {itemsWithCoordinates.map((item) => (
                  <li key={`${item.id}-sr`}>
                    {item.label} is at x {item.x?.toFixed(2)} and y {item.y?.toFixed(2)}
                    {item.zoneName ? ` in ${item.zoneName.replace(/_/g, " ")}` : ""}.
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
