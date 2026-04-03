import { NextResponse } from "next/server";
import { getLatestObjectState, getRecentSightings, getTrackedObjects } from "@/lib/anchor/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const object = searchParams.get("object");
  const limitParam = Number(searchParams.get("limit") ?? "12");
  const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 12;

  if (object) {
    return NextResponse.json({
      object: getLatestObjectState(object),
    });
  }

  return NextResponse.json({
    objects: getTrackedObjects(),
    sightings: getRecentSightings(limit),
  });
}
