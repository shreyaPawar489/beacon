import { NextResponse } from "next/server";
import type { MatchRequest, MatchResponse } from "@/lib/types";
import { DEMO_ALIAS_PREFIX, DEMO_GROUP_PREFIX } from "@/lib/demo";
import { addReport, getReport, setConsent, setGroup } from "@/lib/store";

// POST /api/demo/match { reportId } -> MatchResponse
// Creates a sample report from a pretend second person that matches the given
// report (same account, or same description nearby, ~9 days earlier), groups
// the two, and marks the sample reporter as already ready for Title IX.
export async function POST(req: Request) {
  const { reportId } = (await req.json()) as MatchRequest;
  const report = getReport(reportId);
  if (!report) return NextResponse.json({ error: `Report ${reportId} not found` }, { status: 404 });

  const suffix = Math.random().toString(36).slice(2, 8);
  const online = report.location.label === "Online";
  const sample = addReport({
    user_alias: `${DEMO_ALIAS_PREFIX}${suffix}`,
    category: report.category,
    severity: report.severity,
    datetime: new Date(new Date(report.datetime).getTime() - 9 * 86_400_000).toISOString(),
    location: online
      ? report.location
      : { lat: report.location.lat + 0.0011, lng: report.location.lng - 0.0006, label: `Near ${report.location.label}` },
    offender_handle: report.offender_handle,
    offender_desc: report.offender_desc || "Couldn't see face",
    summary: "Sample report created by demo mode.",
  });

  const groupId = `${DEMO_GROUP_PREFIX}${suffix}`;
  setGroup([report.id, sample.id], groupId);
  setConsent(groupId, sample.user_alias, true);

  const res: MatchResponse = { matched: true, match_group_id: groupId, confidence: 1 };
  return NextResponse.json(res);
}
