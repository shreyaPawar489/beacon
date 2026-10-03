import { NextResponse } from "next/server";
import type { Category, ReportDraft } from "@/lib/types";
import { addReport, listReports } from "@/lib/store";

export const dynamic = "force-dynamic";

const CATEGORIES: Category[] = ["harassment", "stalking", "assault", "unsafe_area", "online"];

// Only ever returns one person's own reports; there is no "list everyone" view.
export async function GET(req: Request) {
  const user = new URL(req.url).searchParams.get("user");
  if (!user) return NextResponse.json({ error: "user is required" }, { status: 400 });
  return NextResponse.json(listReports(user));
}

export async function POST(req: Request) {
  const d = (await req.json()) as ReportDraft;

  const problems: string[] = [];
  if (!d.user_alias) problems.push("user_alias is required");
  if (!d.category || !CATEGORIES.includes(d.category)) problems.push("category is invalid");
  if (!d.severity || d.severity < 1 || d.severity > 5) problems.push("severity must be 1–5");
  if (!d.location || typeof d.location.lat !== "number" || typeof d.location.lng !== "number")
    problems.push("location needs lat and lng");
  if (problems.length) return NextResponse.json({ error: problems.join("; ") }, { status: 400 });

  const report = addReport({
    ...d,
    user_alias: d.user_alias!,
    category: d.category!,
    severity: d.severity!,
    location: d.location!,
  });
  return NextResponse.json(report, { status: 201 });
}
