import { NextResponse } from "next/server";
import { answerMementoQuery } from "@/lib/memento/query";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  return NextResponse.json(answerMementoQuery(query));
}
