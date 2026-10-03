import { NextResponse } from "next/server";
import type { CaseResponse } from "@/lib/types";
import { reportsInGroup } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/case/[groupId]?user=<device id>
// Other reporters' aliases are pseudonymised and their summaries withheld, so
// one survivor never receives another's words or identity.
export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  const user = new URL(req.url).searchParams.get("user");
  const aliases = new Map<string, string>();
  const reports = reportsInGroup(params.groupId).map((r) => {
    if (r.user_alias === user) return r;
    if (!aliases.has(r.user_alias)) aliases.set(r.user_alias, `reporter_${aliases.size + 1}`);
    return { ...r, user_alias: aliases.get(r.user_alias)!, summary: "" };
  });
  const res: CaseResponse = { reports };
  return NextResponse.json(res);
}
