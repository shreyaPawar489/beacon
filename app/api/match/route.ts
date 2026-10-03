import { NextResponse } from "next/server";
import type { MatchRequest, MatchResponse } from "@/lib/types";
import { MOCK_REPORTS } from "@/lib/mock";
import { findMatch } from "@/lib/match";

// TODO: read reports from Supabase and save the match_group_id on both reports.
export async function POST(req: Request) {
  const { reportId } = (await req.json()) as MatchRequest;
  const report = MOCK_REPORTS.find((r) => r.id === reportId);
  if (!report) {
    return NextResponse.json({ error: `Report ${reportId} not found` }, { status: 404 });
  }
  const res: MatchResponse = findMatch(report, MOCK_REPORTS);
  return NextResponse.json(res);
}
