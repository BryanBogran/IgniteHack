"use client";

import { useEffect, useMemo, useState } from "react";

type ApiObject = {
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
};

type ApiResponse = {
  objects?: ApiObject[];
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

const API_URL = "http://localhost:5050/api/objects";

function clampCoordinate(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return null;
  }

  return Math.min(1, Math.max(0, value));
}

function normaliseItems(payload: ApiResponse): HeatmapItem[] {
  return (payload.objects ?? []).map((item, index) => ({
    id: `${item.label ?? item.object_label ?? "item"}-${index}`,
    label: item.label ?? item.object_label ?? "Unknown item",
    zoneName: item.zone_name ?? null,
    x: clampCoordinate(item.center_x ?? item.x ?? null),
    y: clampCoordinate(item.center_y ?? item.y ?? null),
    confidence: typeof item.confidence === "number" ? item.confidence : null,
    lastSeenAt: item.last_seen_at ?? item.seen_at ?? null,
    isVisible: Boolean(item.is_visible),
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
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "Unknown";
  }

  return `${Math.round(value * 100)}%`;
}

export default function HomePage() {
  const [items, setItems] = useState<HeatmapItem[]>([]);
  const [status, setStatus] = useState("Ready to load the latest lost-items data.");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const itemsWithCoordinates = useMemo(
    () => items.filter((item) => item.x !== null && item.y !== null),
    [items],
  );

  async function loadData() {
    setIsLoading(true);
    setErrorMessage(null);
    setStatus("Loading the latest lost-items coordinates.");

    try {
      const response = await fetch(API_URL, { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      const payload = (await response.json()) as ApiResponse;
      const nextItems = normaliseItems(payload);
      setItems(nextItems);
      setStatus(`Loaded ${nextItems.length} tracked item${nextItems.length === 1 ? "" : "s"} from the local API.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setItems([]);
      setErrorMessage(`Unable to reach ${API_URL}. ${message}`);
      setStatus("The heatmap could not load data from the local API.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="rounded-[2rem] border border-white/12 bg-[#08141c] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.35)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8adcca]">Memento</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">
          Frequently Lost Items Heatmap
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-[#d7ebe6]">
          This local dashboard helps users with TBI or memory impairment review where important items were last
          recorded. The heatmap shows the most recent x and y coordinates reported by the local object API.
        </p>
        <p id="heatmap-summary" className="mt-4 max-w-3xl text-sm leading-7 text-[#c5ddd7]">
          Use the refresh button to load the latest local data. The heatmap does not auto-refresh, animate, or move on
          its own.
        </p>
      </header>

      <section
        aria-labelledby="heatmap-controls-heading"
        className="rounded-[2rem] border border-white/12 bg-[#0b1720] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="heatmap-controls-heading" className="text-2xl font-semibold text-white">
              Data Controls
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#d7ebe6]">
              Refresh the local object snapshot when you want the latest tracked coordinates from
              <span className="font-semibold text-white"> {API_URL}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={isLoading}
            className="min-h-14 rounded-2xl border-2 border-[#9df3df] bg-[#9df3df] px-6 text-base font-semibold text-[#041014] transition hover:bg-[#b9faea] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#9df3df]/35 disabled:cursor-not-allowed disabled:opacity-70"
            aria-describedby="heatmap-summary heatmap-status"
          >
            {isLoading ? "Loading Data" : "Refresh Data"}
          </button>
        </div>
        <p id="heatmap-status" role="status" aria-live="polite" className="mt-4 text-sm font-medium text-[#f5fffd]">
          {status}
        </p>
        {errorMessage ? (
          <p className="mt-2 rounded-xl border border-[#ffb4b4] bg-[#2a1111] p-4 text-sm leading-7 text-[#fff1f1]">
            {errorMessage}
          </p>
        ) : null}
      </section>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <section
          aria-labelledby="heatmap-heading"
          aria-describedby="heatmap-description"
          className="rounded-[2rem] border border-white/12 bg-[#0b1720] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="heatmap-heading" className="text-2xl font-semibold text-white">
                Item Coordinate Heatmap
              </h2>
              <p id="heatmap-description" className="mt-2 max-w-2xl text-sm leading-7 text-[#d7ebe6]">
                The grid represents the camera frame from top left to bottom right. Each marker shows the last known
                position of one item using normalized x and y coordinates.
              </p>
            </div>
            <div className="rounded-2xl border border-white/12 bg-[#111f29] px-4 py-3 text-sm text-[#f5fffd]">
              {itemsWithCoordinates.length} plotted
            </div>
          </div>

          <div className="mt-6">
            <div className="sr-only">
              The heatmap is a square plotting surface. Items closer to the top left have lower x and y values. Items
              closer to the bottom right have higher x and y values.
            </div>

            <div className="relative aspect-square w-full overflow-hidden rounded-[1.5rem] border-2 border-[#dffaf3] bg-[#041014]">
              <div
                className="absolute inset-0 bg-[linear-gradient(to_right,#28505b_1px,transparent_1px),linear-gradient(to_bottom,#28505b_1px,transparent_1px)] bg-[size:10%_10%]"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(157,243,223,0.16),transparent_62%)]"
                aria-hidden="true"
              />

              <div className="absolute left-3 top-3 rounded-full bg-[#dffaf3] px-3 py-1 text-xs font-semibold text-[#041014]">
                Y: 0.0
              </div>
              <div className="absolute bottom-3 left-3 rounded-full bg-[#dffaf3] px-3 py-1 text-xs font-semibold text-[#041014]">
                Y: 1.0
              </div>
              <div className="absolute bottom-3 right-3 rounded-full bg-[#dffaf3] px-3 py-1 text-xs font-semibold text-[#041014]">
                X: 1.0
              </div>

              {itemsWithCoordinates.length ? (
                itemsWithCoordinates.map((item) => (
                  <div
                    key={item.id}
                    className="absolute"
                    style={{
                      left: `${(item.x ?? 0) * 100}%`,
                      top: `${(item.y ?? 0) * 100}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#041014] bg-[#9df3df] shadow-[0_0_0_4px_rgba(157,243,223,0.18)]"
                        aria-hidden="true"
                      >
                        <span className="h-2.5 w-2.5 rounded-full bg-[#041014]" />
                      </div>
                      <div className="rounded-xl border border-[#dffaf3] bg-[#f5fffd] px-3 py-1.5 text-xs font-semibold text-[#041014] shadow-sm">
                        {item.label}
                      </div>
                      <span className="sr-only">
                        {item.label} last recorded at x {item.x?.toFixed(2)} and y {item.y?.toFixed(2)}
                        {item.zoneName ? ` in ${item.zoneName.replace(/_/g, " ")}` : ""}.
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="max-w-md rounded-[1.5rem] border border-dashed border-[#dffaf3] bg-[#0f2029] p-6 text-center">
                    <h3 className="text-lg font-semibold text-white">No plottable item coordinates yet</h3>
                    <p className="mt-3 text-sm leading-7 text-[#d7ebe6]">
                      When the local API returns items with x and y coordinates, they will appear on this heatmap.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside
          aria-labelledby="item-list-heading"
          className="rounded-[2rem] border border-white/12 bg-[#0b1720] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]"
        >
          <h2 id="item-list-heading" className="text-2xl font-semibold text-white">
            Latest Item Data
          </h2>
          <p className="mt-2 text-sm leading-7 text-[#d7ebe6]">
            This list gives a screen-reader-friendly summary of each item, including last known coordinates and
            confidence when available.
          </p>

          <ul className="mt-6 space-y-4">
            {items.length ? (
              items.map((item) => (
                <li
                  key={item.id}
                  className="rounded-[1.5rem] border border-white/12 bg-[#111f29] p-4 text-[#f5fffd]"
                >
                  <h3 className="text-lg font-semibold text-white">{item.label}</h3>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div className="grid grid-cols-[8rem_1fr] gap-3">
                      <dt className="font-semibold text-[#c5ddd7]">Zone</dt>
                      <dd>{item.zoneName ? item.zoneName.replace(/_/g, " ") : "Unknown"}</dd>
                    </div>
                    <div className="grid grid-cols-[8rem_1fr] gap-3">
                      <dt className="font-semibold text-[#c5ddd7]">Coordinates</dt>
                      <dd>
                        {item.x !== null && item.y !== null
                          ? `x ${item.x.toFixed(2)}, y ${item.y.toFixed(2)}`
                          : "No coordinates available"}
                      </dd>
                    </div>
                    <div className="grid grid-cols-[8rem_1fr] gap-3">
                      <dt className="font-semibold text-[#c5ddd7]">Confidence</dt>
                      <dd>{formatPercent(item.confidence)}</dd>
                    </div>
                    <div className="grid grid-cols-[8rem_1fr] gap-3">
                      <dt className="font-semibold text-[#c5ddd7]">Visibility</dt>
                      <dd>{item.isVisible ? "Visible now" : "Last known position"}</dd>
                    </div>
                    <div className="grid grid-cols-[8rem_1fr] gap-3">
                      <dt className="font-semibold text-[#c5ddd7]">Last seen</dt>
                      <dd>{formatTimestamp(item.lastSeenAt)}</dd>
                    </div>
                  </dl>
                </li>
              ))
            ) : (
              <li className="rounded-[1.5rem] border border-dashed border-[#dffaf3] bg-[#111f29] p-4 text-sm leading-7 text-[#d7ebe6]">
                No item records are available yet. Start the local API and use the Refresh Data button to try again.
              </li>
            )}
          </ul>
        </aside>
      </div>
    </section>
  );
}
