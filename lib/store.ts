// JSON-file storage for the demo: data/reports.json, seeded from lib/mock.ts on first use.
// Server-only (uses fs). Reset with `npm run demo:reset`.
import "server-only";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { MOCK_REPORTS } from "./mock";
import type { Report, ReportDraft } from "./types";

const FILE = path.join(process.cwd(), "data", "reports.json");

function load(): Report[] {
  if (!existsSync(FILE)) save(MOCK_REPORTS);
  return JSON.parse(readFileSync(FILE, "utf8")) as Report[];
}

function save(reports: Report[]) {
  mkdirSync(path.dirname(FILE), { recursive: true });
  writeFileSync(FILE, JSON.stringify(reports, null, 2));
}

const byNewest = (a: Report, b: Report) => b.datetime.localeCompare(a.datetime);

export function listReports(user?: string | null): Report[] {
  const all = load();
  return (user ? all.filter((r) => r.user_alias === user) : all).sort(byNewest);
}

export function getReport(id: string): Report | undefined {
  return load().find((r) => r.id === id);
}

export function reportsInGroup(groupId: string): Report[] {
  return load()
    .filter((r) => r.match_group_id === groupId)
    .sort((a, b) => a.datetime.localeCompare(b.datetime));
}

// Fields must already be validated by the caller.
export function addReport(d: Required<Pick<Report, "user_alias" | "category" | "severity" | "location">> & ReportDraft): Report {
  const created_at = new Date().toISOString();
  const fields = {
    user_alias: d.user_alias,
    datetime: d.datetime ?? created_at,
    location: { lat: d.location.lat, lng: d.location.lng, label: d.location.label ?? "" },
    category: d.category,
    offender_desc: d.offender_desc ?? "",
    ...(d.offender_handle ? { offender_handle: d.offender_handle } : {}),
    severity: d.severity,
    summary: d.summary ?? "",
    created_at,
  };
  // Tamper-evidence: SHA-256 over the report content at filing time.
  const hash = createHash("sha256").update(JSON.stringify(fields)).digest("hex");
  const report: Report = { id: `r_${Date.now().toString(36)}`, ...fields, hash };
  save([...load(), report]);
  return report;
}

export function setGroup(ids: string[], groupId: string) {
  save(load().map((r) => (ids.includes(r.id) ? { ...r, match_group_id: groupId } : r)));
}
