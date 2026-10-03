// Owner: Person B. Anthropic client — not wired up yet.
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-sonnet-5-5";

export function getAnthropic() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
}
