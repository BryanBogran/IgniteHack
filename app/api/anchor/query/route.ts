import { NextResponse } from "next/server";
import { answerAnchorQuery } from "@/lib/anchor/query";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  return NextResponse.json(answerAnchorQuery(query));
}
