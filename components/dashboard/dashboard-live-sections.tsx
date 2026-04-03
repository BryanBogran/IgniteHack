"use client";

import { useEffect, useState } from "react";
import { Pause, Play } from "lucide-react";
import { AnchorObjectsGrid } from "@/components/dashboard/anchor-objects-grid";
import { AnchorQueryCard } from "@/components/dashboard/anchor-query-card";
import { AnchorStats } from "@/components/dashboard/anchor-stats";
import { AnchorSystemCard } from "@/components/dashboard/anchor-system-card";
import { AnchorTimeline } from "@/components/dashboard/anchor-timeline";
import { Button } from "@/components/ui/button";
import type { AnchorDashboardData, AnchorQueryResult } from "@/lib/anchor/types";

const REFRESH_MS = 2000;

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }

  return response.json() as Promise<T>;
}

export function DashboardLiveSections({
  initialData,
  initialQuery,
  initialQueryResult,
}: {
  initialData: AnchorDashboardData;
  initialQuery: string;
  initialQueryResult: AnchorQueryResult | null;
}) {
  const [data, setData] = useState(initialData);
  const [queryResult, setQueryResult] = useState(initialQueryResult);
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    setQueryResult(initialQueryResult);
  }, [initialQueryResult]);

  useEffect(() => {
    if (!isRefreshing) {
      return;
    }

    let cancelled = false;

    const refresh = async () => {
      try {
        const [status, objectsResponse, nextQueryResult] = await Promise.all([
          readJson<AnchorDashboardData["status"]>("/api/anchor/status"),
          readJson<{ objects: AnchorDashboardData["objects"]; sightings: AnchorDashboardData["sightings"] }>(
            "/api/anchor/objects?limit=12",
          ),
          initialQuery
            ? readJson<AnchorQueryResult>(`/api/anchor/query?q=${encodeURIComponent(initialQuery)}`)
            : Promise.resolve<AnchorQueryResult | null>(null),
        ]);

        if (cancelled) {
          return;
        }

        setData({
          status,
          objects: objectsResponse.objects,
          sightings: objectsResponse.sightings,
        });
        setQueryResult(nextQueryResult);
      } catch {
        return;
      }
    };

    const interval = window.setInterval(refresh, REFRESH_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [initialQuery, isRefreshing]);

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" aria-live="polite">
        <p className="text-sm text-[var(--muted)]">
          {isRefreshing ? "Dashboard data refreshes automatically every 2 seconds." : "Dashboard auto-refresh is paused."}
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsRefreshing((current) => !current)}
          aria-pressed={!isRefreshing}
        >
          {isRefreshing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4" aria-hidden="true" />}
          {isRefreshing ? "Pause dashboard updates" : "Resume dashboard updates"}
        </Button>
      </div>
      <AnchorStats status={data.status} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
        <div className="space-y-6">
          <section id="search" className="scroll-mt-28" aria-labelledby="search-heading">
            <AnchorQueryCard initialQuery={initialQuery} result={queryResult} />
          </section>
          <section id="items" className="scroll-mt-28" aria-labelledby="items-heading">
            <AnchorObjectsGrid objects={data.objects} />
          </section>
          <section id="activity" className="scroll-mt-28" aria-labelledby="activity-heading">
            <AnchorTimeline sightings={data.sightings} />
          </section>
        </div>
        <div className="space-y-6">
          <section id="system" className="scroll-mt-28" aria-labelledby="system-heading">
            <AnchorSystemCard status={data.status} />
          </section>
        </div>
      </div>
    </>
  );
}
