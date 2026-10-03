// Owner: Person B. Gemini client — not wired up yet.
// Only used for the optional intake chat. Callers must fall back to the
// step-by-step form when this throws or times out. Matching never uses it.
import { GoogleGenAI } from "@google/genai";

export const MODEL = "gemini-flash-latest";

export function getGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");
  return new GoogleGenAI({ apiKey });
}
