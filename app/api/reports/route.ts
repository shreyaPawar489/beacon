import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import type { Category, Report, ReportDraft } from "@/lib/types";
import { getSupabase } from "@/lib/supabase";

const CATEGORIES: Category[] = ["harassment", "stalking", "assault", "unsafe_area", "online"];

// Supabase returns null for empty optional columns; the Report type uses undefined.
function toReport(row: Record<string, unknown>): Report {
  const r = { ...row } as Record<string, unknown>;
  for (const k of ["offender_handle", "match_group_id"]) if (r[k] == null) delete r[k];
  return r as unknown as Report;
}

// Missing env vars make getSupabase() throw; report that as JSON instead of a bare 500.
function db() {
  try {
    return { supabase: getSupabase() };
  } catch (e) {
    return { failure: NextResponse.json({ error: (e as Error).message }, { status: 500 }) };
  }
}

export async function GET(req: Request) {
  const { supabase, failure } = db();
  if (!supabase) return failure;
  const user = new URL(req.url).searchParams.get("user");
  let query = supabase.from("reports").select("*").order("datetime", { ascending: false });
  if (user) query = query.eq("user_alias", user);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data.map(toReport));
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

  const { supabase, failure } = db();
  if (!supabase) return failure;

  const created_at = new Date().toISOString();
  const fields = {
    user_alias: d.user_alias!,
    datetime: d.datetime ?? created_at,
    location: { lat: d.location!.lat, lng: d.location!.lng, label: d.location!.label ?? "" },
    category: d.category!,
    offender_desc: d.offender_desc ?? "",
    offender_handle: d.offender_handle || null,
    severity: d.severity!,
    summary: d.summary ?? "",
    created_at,
  };
  // Tamper-evidence: SHA-256 over the report content at filing time.
  const hash = createHash("sha256").update(JSON.stringify(fields)).digest("hex");

  const { data, error } = await supabase
    .from("reports")
    .insert({ ...fields, hash })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(toReport(data), { status: 201 });
}
