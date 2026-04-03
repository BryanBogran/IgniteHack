import fs from "node:fs/promises";
import { NextResponse } from "next/server";
import { getLiveFramePath } from "@/lib/memento/live-frame";

export const runtime = "nodejs";

export async function GET() {
  try {
    const frame = await fs.readFile(getLiveFramePath());

    return new NextResponse(frame, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Live frame not available yet. Start the Python worker with preview enabled." },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }
}
