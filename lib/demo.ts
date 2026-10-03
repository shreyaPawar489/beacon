// Demo match mode: lets a single visitor see the matching flow by pairing
// their report with a clearly labelled sample report. Sample reports never
// take part in real matching.
import type { Report } from "./types";

export const DEMO_ALIAS_PREFIX = "demo_";
export const DEMO_GROUP_PREFIX = "mg_demo_";

export const isDemoGroup = (groupId?: string | null) => !!groupId?.startsWith(DEMO_GROUP_PREFIX);
export const isDemoReport = (r: Pick<Report, "user_alias">) => r.user_alias.startsWith(DEMO_ALIAS_PREFIX);
