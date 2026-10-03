import { NextResponse } from "next/server";
import { consentStatus, reportsInGroup, setConsent } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET  /api/case/[groupId]/consent?user=<id>  -> { ready, total, mine }
// POST /api/case/[groupId]/consent  { user, consent: boolean } -> same
// Only counts are returned, never who has or hasn't agreed.
export async function GET(req: Request, { params }: { params: { groupId: string } }) {
  const user = new URL(req.url).searchParams.get("user");
  return NextResponse.json(consentStatus(params.groupId, user));
}

export async function POST(req: Request, { params }: { params: { groupId: string } }) {
  const { user, consent } = (await req.json()) as { user?: string; consent?: boolean };
  if (!user || typeof consent !== "boolean") {
    return NextResponse.json({ error: "user and consent are required" }, { status: 400 });
  }
  if (!reportsInGroup(params.groupId).some((r) => r.user_alias === user)) {
    return NextResponse.json({ error: "Only people in this case can respond" }, { status: 403 });
  }
  setConsent(params.groupId, user, consent);
  return NextResponse.json(consentStatus(params.groupId, user));
}
