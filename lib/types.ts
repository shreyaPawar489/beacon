// Shared contract between frontend (Person A) and backend (Person B).
// DO NOT change without agreement from both people.

export type UserAlias = "maya" | "priya" | (string & {});

export type Category =
  | "harassment"
  | "stalking"
  | "assault"
  | "unsafe_area"
  | "online";

export type Severity = 1 | 2 | 3 | 4 | 5;

export interface Location {
  lat: number;
  lng: number;
  label: string;
}

export interface Report {
  id: string;
  user_alias: UserAlias;
  datetime: string; // ISO 8601 — when the incident happened
  location: Location;
  category: Category;
  offender_desc: string;
  offender_handle?: string;
  severity: Severity;
  summary: string;
  hash: string;
  created_at: string; // ISO 8601 — when the report was filed
  match_group_id?: string;
}

// POST /api/intake
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface IntakeRequest {
  messages: ChatMessage[];
}

export interface IntakeResponse {
  reply: string;
  draft: Partial<Report>;
  done: boolean;
}

// POST /api/reports  body: ReportDraft -> Report
// GET  /api/reports            -> Report[]
// GET  /api/reports?user=maya  -> Report[]
export type ReportDraft = Partial<Report>;
export type CreateReportResponse = Report;
export type ListReportsResponse = Report[];

// POST /api/match
export interface MatchRequest {
  reportId: string;
}

export interface MatchResponse {
  matched: boolean;
  match_group_id?: string;
  confidence: number; // 0..1
}

// GET /api/case/[groupId]
export interface CaseResponse {
  reports: Report[];
}
