// Owner: Person B. Report matching logic — not implemented yet.
import type { MatchResponse, Report } from "./types";

export async function findMatch(_report: Report): Promise<MatchResponse> {
  return { matched: false, confidence: 0 };
}
