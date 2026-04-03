import { NextResponse } from "next/server";
import { getSystemStatus } from "@/lib/memento/store";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json(getSystemStatus());
}
