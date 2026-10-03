import { NextResponse } from "next/server";
import type { MatchRequest, MatchResponse } from "@/lib/types";
import { findMatch, scorePair } from "@/lib/match";
import { getReport, listReports, setGroup } from "@/lib/store";

export async function POST(req: Request) {
  const { reportId } = (await req.json()) as MatchRequest;
  const report = getReport(reportId);
  if (!report) {
    return NextResponse.json({ error: `Report ${reportId} not found` }, { status: 404 });
  }

  // Only other people's reports can corroborate yours.
  const candidates = listReports().filter((r) => r.user_alias !== report.user_alias);
  const res: MatchResponse = findMatch(report, candidates);

  if (res.matched && res.match_group_id) {
    const linked = candidates.filter((c) => scorePair(report, c).matched && !c.match_group_id);
    setGroup([report.id, ...linked.map((c) => c.id)], res.match_group_id);
  }
  return NextResponse.json(res);
}
