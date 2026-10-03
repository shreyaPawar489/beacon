import { NextResponse } from "next/server";
import type { CaseResponse } from "@/lib/types";
import { mockReportsForGroup } from "@/lib/mock";

// STUB — replace with Supabase lookup.
export async function GET(_req: Request, { params }: { params: { groupId: string } }) {
  const res: CaseResponse = { reports: mockReportsForGroup(params.groupId) };
  return NextResponse.json(res);
}
