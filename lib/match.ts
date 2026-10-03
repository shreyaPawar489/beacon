// Owner: Person B. Rule-based report matching (no AI; see CLAUDE.md).
//
// Two reports match when either:
//   - they name the same offender_handle, or
//   - all four of: same category, within MAX_DISTANCE_M, within MAX_DAYS,
//     and MIN_SHARED_WORDS or more shared words in offender_desc.
// Confidence is the share of rules that matched for the best candidate.
import type { MatchResponse, Report } from "./types";

export const MAX_DISTANCE_M = 500;
export const MAX_DAYS = 30;
export const MIN_SHARED_WORDS = 2;

// Words too common in descriptions to say anything about who it was.
const STOPWORDS = new Set([
  "the", "and", "with", "was", "his", "her", "had", "has", "who", "for",
  "man", "men", "guy", "woman", "person", "someone", "user", "account",
  "unknown", "wearing", "carrying", "around", "about", "maybe", "like",
  // "couldn't see face", "N/A – environmental": no description given
  "couldn", "didn", "see", "saw", "face", "not", "none", "environmental",
]);

export function normalizeHandle(handle?: string): string | null {
  const h = handle?.trim().toLowerCase().replace(/^@+/, "");
  return h ? h : null;
}

export function descWords(desc: string): Set<string> {
  const words = desc.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return new Set(words.filter((w) => w.length >= 3 && !STOPWORDS.has(w)));
}

export function sharedWords(a: string, b: string): string[] {
  const wb = descWords(b);
  return Array.from(descWords(a)).filter((w) => wb.has(w));
}

// Haversine distance in metres.
export function distanceMeters(a: Report["location"], b: Report["location"]): number {
  const R = 6_371_000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function daysApart(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 86_400_000;
}

export interface PairScore {
  matched: boolean;
  confidence: number; // 0..1
}

export function scorePair(a: Report, b: Report): PairScore {
  const ha = normalizeHandle(a.offender_handle);
  if (ha && ha === normalizeHandle(b.offender_handle)) {
    return { matched: true, confidence: 1 };
  }

  const rules = [
    a.category === b.category,
    distanceMeters(a.location, b.location) <= MAX_DISTANCE_M,
    daysApart(a.datetime, b.datetime) <= MAX_DAYS,
    sharedWords(a.offender_desc, b.offender_desc).length >= MIN_SHARED_WORDS,
  ];
  const passed = rules.filter(Boolean).length;
  return { matched: passed === rules.length, confidence: passed / rules.length };
}

export function newGroupId(): string {
  return `mg_${Math.random().toString(36).slice(2, 10)}`;
}

// Compare a report against every other report and return the best match.
// Joins the candidate's existing group if it has one, otherwise starts a new one.
export function findMatch(report: Report, candidates: Report[]): MatchResponse {
  let best: { other: Report; score: PairScore } | null = null;

  for (const other of candidates) {
    if (other.id === report.id) continue;
    const score = scorePair(report, other);
    if (
      !best ||
      (score.matched && !best.score.matched) ||
      (score.matched === best.score.matched && score.confidence > best.score.confidence)
    ) {
      best = { other, score };
    }
  }

  if (!best?.score.matched) {
    return { matched: false, confidence: best?.score.confidence ?? 0 };
  }
  return {
    matched: true,
    match_group_id:
      report.match_group_id ?? best.other.match_group_id ?? newGroupId(),
    confidence: best.score.confidence,
  };
}
