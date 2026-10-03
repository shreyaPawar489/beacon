import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { NextResponse } from "next/server";
import { z } from "zod";
import type { IntakeRequest, IntakeResponse, Location, Report } from "@/lib/types";

// Guided intake with Claude. Falls back to a scripted reply if the API key is
// missing or the call fails, so the demo never dead-ends.

const MODEL = "claude-opus-5-5";
// Opening answer + up to 2 follow-ups; after that we always finish.
const MAX_USER_TURNS = 3;

const PLACES: Record<string, Location> = {
  telegraph: { lat: 37.8683, lng: -122.25877, label: "Telegraph Ave" },
  durant: { lat: 37.86779, lng: -122.2587, label: "Telegraph Ave & Durant Ave" },
  southside: { lat: 37.86375, lng: -122.25631, label: "Southside" },
  doe_library: { lat: 37.87205, lng: -122.25935, label: "Doe Library" },
  downtown_bart: { lat: 37.87005, lng: -122.26844, label: "Downtown Berkeley BART" },
  peoples_park: { lat: 37.86544, lng: -122.25677, label: "People's Park" },
  sproul: { lat: 37.8696, lng: -122.2591, label: "Sproul Plaza" },
  campus: { lat: 37.8719, lng: -122.2585, label: "UC Berkeley campus" },
};
type PlaceKey = keyof typeof PLACES;

const Extraction = z.object({
  reply: z.string().describe("What to say to the person next. 1–3 short, warm sentences."),
  done: z.boolean().describe("True once you have what happened, roughly when, roughly where, and a description or handle — or the person can't say more."),
  category: z.enum(["harassment", "stalking", "assault", "unsafe_area", "online"]).nullable(),
  severity: z.number().int().min(1).max(5).nullable().describe("1 = uneasy … 5 = in danger or physically hurt"),
  place: z.enum(Object.keys(PLACES) as [PlaceKey, ...PlaceKey[]]).nullable().describe("Closest known place, or null if not mentioned"),
  place_detail: z.string().nullable().describe("The person's own words for where, e.g. 'outside Cafe Strada'"),
  datetime: z.string().nullable().describe("ISO 8601 with timezone offset (America/Los_Angeles), or null if not mentioned"),
  offender_desc: z.string().nullable().describe("Physical description, or account details if online"),
  offender_handle: z.string().nullable().describe("Online username starting with @, if any"),
  summary: z.string().nullable().describe("1–2 sentence first-person summary in the person's own terms"),
});
type Extraction = z.infer<typeof Extraction>;

const SYSTEM = `You help a UC Berkeley student file an anonymous safety report. They may have just been harassed, followed, or assaulted.

How to talk:
- Calm, warm, plain language. Short messages. Never blame, never question whether it happened, never push for detail they don't offer.
- Believe them. Thank them for sharing. Remind them they can skip anything.
- Ask at most ONE question per message, and at most TWO follow-up questions in the whole conversation. Prioritise: roughly when, roughly where, and a description of the person (or their username if online).
- If they're in immediate danger, tell them to call 911 or UCPD at (510) 642-3333 first.
- When done, thank them and tell them they can review the card before submitting privately. Don't promise outcomes.

How to fill the draft:
- Extract only what they actually said. Use null for anything not mentioned. Don't invent details.
- Map places to the closest key: telegraph (Telegraph Ave generally), durant (Telegraph & Durant), southside, doe_library, downtown_bart, peoples_park, sproul (Sproul Plaza / Sather Gate area), campus (elsewhere on campus).
- Resolve relative times ("last night", "an hour ago") against the current time given below.`;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as IntakeRequest;
  const userTurns = messages.filter((m) => m.role === "user").length;
  if (userTurns === 0) {
    return NextResponse.json({
      reply: "I'm here with you. You're safe to share as much or as little as you like. What happened?",
      draft: {},
      done: false,
    } satisfies IntakeResponse);
  }

  try {
    const extraction = await extract(messages, userTurns >= MAX_USER_TURNS);
    return NextResponse.json(toResponse(extraction, userTurns));
  } catch (err) {
    console.error("[intake] Claude call failed, using scripted fallback:", err);
    return NextResponse.json(scripted(messages));
  }
}

async function extract(messages: IntakeRequest["messages"], mustFinish: boolean): Promise<Extraction> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not set");
  const client = new Anthropic();

  const now = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles", dateStyle: "full", timeStyle: "short" });
  const turnNote = mustFinish
    ? "You have used all follow-ups. Set done=true now and fill the draft from what you have."
    : "Ask a follow-up only if when, where, or who is still missing.";

  const response = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    output_config: { effort: "low", format: zodOutputFormat(Extraction) },
    system: SYSTEM,
    messages: [
      // The API needs a user turn first; the UI may open with our greeting.
      ...(messages[0]?.role === "assistant" ? [{ role: "user", content: "(Opened the report screen.)" }] : []),
      ...messages.map((m) => ({ role: m.role, content: m.content })),
      { role: "system", content: `Current time in Berkeley: ${now}. ${turnNote}` },
    ] as Anthropic.MessageParam[],
  });

  if (response.stop_reason === "refusal") throw new Error("Claude declined the request");
  if (!response.parsed_output) throw new Error(`No parsed output (stop_reason=${response.stop_reason})`);
  return response.parsed_output;
}

function toResponse(x: Extraction, userTurns: number): IntakeResponse {
  const draft: Partial<Report> = {};
  if (x.category) draft.category = x.category;
  if (x.severity) draft.severity = x.severity as Report["severity"];
  if (x.place) {
    const p = PLACES[x.place];
    draft.location = { ...p, label: x.place_detail ? `${x.place_detail} (${p.label})` : p.label };
  }
  if (x.datetime && !Number.isNaN(Date.parse(x.datetime))) draft.datetime = new Date(x.datetime).toISOString();
  if (x.offender_desc) draft.offender_desc = x.offender_desc;
  if (x.offender_handle) draft.offender_handle = x.offender_handle.startsWith("@") ? x.offender_handle : `@${x.offender_handle}`;
  if (x.summary) draft.summary = x.summary;

  return { reply: x.reply, draft, done: x.done || userTurns >= MAX_USER_TURNS };
}

function scripted(messages: IntakeRequest["messages"]): IntakeResponse {
  const said = messages.filter((m) => m.role === "user").map((m) => m.content);
  const done = said.length >= MAX_USER_TURNS;
  return {
    reply: done
      ? "Thank you. I've put together a draft of your report — please review it before submitting."
      : [
          "Thank you for telling me. Roughly where and when did this happen?",
          "Can you describe the person involved, or their account handle if it was online?",
        ][said.length - 1],
    draft: done
      ? {
          category: "harassment",
          severity: 3,
          location: PLACES.campus,
          datetime: new Date().toISOString(),
          offender_desc: said[2] ?? "",
          summary: said.join(" "),
        }
      : {},
    done,
  };
}
