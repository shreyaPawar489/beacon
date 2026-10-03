import { NextResponse } from "next/server";
import type { MatchRequest, MatchResponse } from "@/lib/types";
import { MOCK_REPORTS } from "@/lib/mock";

// STUB — replace with lib/match.ts.
export async function POST(req: Request) {
  const { reportId } = (await req.json()) as MatchRequest;
  const report = MOCK_REPORTS.find((r) => r.id === reportId);
  const res: MatchResponse = report?.match_group_id
    ? { matched: true, match_group_id: report.match_group_id, confidence: 0.87 }
    : { matched: false, confidence: 0.12 };
  return NextResponse.json(res);
}
