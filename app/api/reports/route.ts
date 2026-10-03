import { NextResponse } from "next/server";
import type { Report, ReportDraft } from "@/lib/types";
import { MOCK_REPORTS, mockReportsForUser } from "@/lib/mock";

// STUB — replace with Supabase (lib/supabase.ts).
export async function GET(req: Request) {
  const user = new URL(req.url).searchParams.get("user");
  const reports: Report[] = user ? mockReportsForUser(user) : MOCK_REPORTS;
  return NextResponse.json(reports);
}

export async function POST(req: Request) {
  const draft = (await req.json()) as ReportDraft;
  const now = new Date().toISOString();
  const report: Report = {
    id: `r_${Date.now()}`,
    user_alias: draft.user_alias ?? "maya",
    datetime: draft.datetime ?? now,
    location: draft.location ?? { lat: 37.8719, lng: -122.2585, label: "UC Berkeley" },
    category: draft.category ?? "harassment",
    offender_desc: draft.offender_desc ?? "",
    offender_handle: draft.offender_handle,
    severity: draft.severity ?? 3,
    summary: draft.summary ?? "",
    hash: "stub-hash",
    created_at: now,
  };
  return NextResponse.json(report, { status: 201 });
}
