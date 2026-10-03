import { NextResponse } from "next/server";
import type { IntakeRequest, IntakeResponse } from "@/lib/types";

// STUB — replace with Claude-backed intake (lib/claude.ts).
export async function POST(req: Request) {
  const { messages } = (await req.json()) as IntakeRequest;
  const turns = messages.filter((m) => m.role === "user").length;
  const done = turns >= 3;

  const res: IntakeResponse = {
    reply: done
      ? "Thank you. I've put together a draft of your report — please review it before submitting."
      : [
          "I'm here with you. Can you tell me what happened, in your own words?",
          "Thank you for sharing. Where and roughly when did this happen?",
          "Can you describe the person involved, or any account handle if it was online?",
        ][Math.min(turns, 2)],
    draft: done
      ? {
          category: "harassment",
          severity: 3,
          location: { lat: 37.8679, lng: -122.2588, label: "Telegraph Ave & Durant Ave" },
          datetime: new Date().toISOString(),
          offender_desc: "Man, ~30s, grey hoodie",
          summary: messages.filter((m) => m.role === "user").map((m) => m.content).join(" "),
        }
      : {},
    done,
  };
  return NextResponse.json(res);
}
