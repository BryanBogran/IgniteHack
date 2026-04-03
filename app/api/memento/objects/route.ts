import { NextResponse } from "next/server";
import { getLatestObjectState, getRecentSightings, getTrackedObjects } from "@/lib/memento/store";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const object = searchParams.get("object");
  const limit = Number(searchParams.get("limit") ?? "12");

  if (object) {
    return NextResponse.json({
      object: getLatestObjectState(object),
    });
  }

  return NextResponse.json({
    objects: getTrackedObjects(),
    sightings: getRecentSightings(Number.isNaN(limit) ? 12 : limit),
  });
}
