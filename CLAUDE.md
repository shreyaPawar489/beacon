# Beacon

Mobile-first PWA for anonymous women's safety reporting at UC Berkeley. Survivors file reports through a short guided chat; reports that look like the same offender get matched so people can corroborate each other.

## Stack

- Next.js 14 (App Router), TypeScript 5, Tailwind CSS 3, shadcn/ui (`components/ui/`, new-york style)
- react-leaflet 4 + leaflet for the map (client-only; load via `next/dynamic` with `ssr: false`)
- Supabase (`@supabase/supabase-js`) for storage
- `@react-pdf/renderer` for case-file PDFs
- `@anthropic-ai/sdk` + `zod` for guided intake
- Copy `.env.example` to `.env.local` and fill in `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`.

Layout targets iPhone width (390px) first; the shell is capped at `max-w-phone` (430px). Palette is calm purple/neutral, defined as CSS variables in `app/globals.css`.

Users are anonymous. Each device generates a random private ID on first visit (localStorage `beacon:device`) and is shown a pseudonym derived from it ("Quiet Fern"). Read it with `useUser()` from `components/user-provider.tsx`; `user` is null until loaded. The header lets someone "Start fresh" on a shared device. `?user=<id>` overrides the identity for one tab (sessionStorage).

## Shared contract

`lib/types.ts` defines every shared type and API shape. `lib/mock.ts` has 30 mock reports, including two matched pairs (`mg_doe_hoodie`, `mg_calbro`). All API routes read and write `lib/store.ts`, a JSON file at `data/reports.json` (gitignored, seeded from `lib/mock.ts` on first use; `npm run demo:reset` wipes it). Supabase code is kept for later but unused. The Map tab is hidden.

| Route | Request | Response |
|---|---|---|
| `POST /api/intake` | `IntakeRequest` | `IntakeResponse` |
| `POST /api/reports` | `ReportDraft` | `Report` |
| `GET /api/reports?user=<id>` | – | `Report[]` (that user's only; `user` required) |
| `POST /api/match` | `{ reportId }` | `MatchResponse` |
| `GET /api/case/[groupId]` | – | `CaseResponse` |

## Intake and matching

- **Intake uses Claude** (`app/api/intake/route.ts`, `@anthropic-ai/sdk`, model `claude-opus-5-5`). A calm, trauma-informed assistant asks at most 2 follow-ups (when, where, who) and returns `IntakeResponse` with a structured `draft`. Places are mapped to lat/lng on the server. If `ANTHROPIC_API_KEY` is missing or the call fails, the route falls back to scripted replies so the demo never dead-ends.
- **Matching is rule-based** (`lib/match.ts`), no AI. Two reports match on the same `offender_handle`, or on the same category + within ~500 m + within ~30 days + 2 or more shared words in `offender_desc`. Confidence is the share of rules that matched.
- Stored reports never leave our own database, but what a survivor types during intake is sent to the Anthropic API.

## Database

- `supabase/schema.sql` creates `reports` (mirrors `Report`; `id` is text). RLS is on with no policies, so only the service role key (server-side, `lib/supabase.ts`) can read or write.
- `npm run seed` upserts the mock reports; `npm run db:check` tests the connection.

## Rules

1. One developer owns the whole repo; there are no file ownership boundaries.
2. Never change `lib/types.ts` request/response shapes unless explicitly asked to.
3. Commit small and often. Always run `git pull --rebase` before every push.

## Testing with visitors

`npm run booth` serves on the LAN; phones on the same Wi-Fi open `http://<laptop-ip>:3000`. Over plain http, GPS ("use my location") and the case fingerprint are unavailable; everything else works.

## Gotcha

Webpack refuses to build from a path containing `!`. Keep the project in a folder without `!` in its path, or `npm run dev` and `npm run build` fail with a "contains exclamation mark" error.
