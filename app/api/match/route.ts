import { NextResponse } from "next/server";
import type { MatchRequest, MatchResponse } from "@/lib/types";
import { findMatch, scorePair } from "@/lib/match";
import { isDemoGroup, isDemoReport } from "@/lib/demo";
import { getReport, listReports, setGroup } from "@/lib/store";

export async function POST(req: Request) {
  const { reportId } = (await req.json()) as MatchRequest;
  const report = getReport(reportId);
  if (!report) {
    return NextResponse.json({ error: `Report ${reportId} not found` }, { status: 404 });
  }

  // Only other real people's reports can corroborate yours. Demo samples never
  // match; a real report sitting in a demo case is treated as unmatched so a
  // real match moves it into a real case.
  const candidates = listReports()
    .filter((r) => r.user_alias !== report.user_alias && !isDemoReport(r))
    .map((r) => (isDemoGroup(r.match_group_id) ? { ...r, match_group_id: undefined } : r));
  const res: MatchResponse = findMatch(report, candidates);

  if (res.matched && res.match_group_id) {
    // Link the reports that matched as strongly as the winner (by handle if any did).
    const scores = candidates.map((c) => ({ c, s: scorePair(report, c) }));
    const byHandle = scores.some(({ s }) => s.byHandle);
    const linked = scores
      .filter(({ c, s }) => (byHandle ? s.byHandle : s.matched) && !c.match_group_id)
      .map(({ c }) => c);
    setGroup([report.id, ...linked.map((c) => c.id)], res.match_group_id);
  }
  return NextResponse.json(res);
}
