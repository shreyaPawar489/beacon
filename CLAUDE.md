# Corroborate

Mobile-first PWA for anonymous women's safety reporting at UC Berkeley. Survivors file reports through a guided chat; reports that look like the same offender get matched so people can corroborate each other.

## Stack

- Next.js 14 (App Router), TypeScript 5, Tailwind CSS 3, shadcn/ui (`components/ui/`, new-york style)
- react-leaflet 4 + leaflet for the map (client-only; load via `next/dynamic` with `ssr: false`)
- Supabase (`@supabase/supabase-js`) for storage
- Anthropic SDK (`@anthropic-ai/sdk`) for intake chat and matching
- `@react-pdf/renderer` for case-file PDFs
- Copy `.env.example` to `.env.local` and fill in `ANTHROPIC_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Layout targets iPhone width (390px) first; the shell is capped at `max-w-phone` (430px). Palette is calm purple/neutral, defined as CSS variables in `app/globals.css`.

Demo users are Maya and Priya. The header switcher stores the current one in localStorage (`corroborate:user`); read it with `useUser()` from `components/user-provider.tsx`.

## Shared contract

`lib/types.ts` defines every shared type and API shape. `lib/mock.ts` has 30 mock reports, including two matched pairs (`mg_doe_hoodie`, `mg_calbro`). Every API route currently returns mock data, so the frontend can be built before the backend is real.

| Route | Request | Response |
|---|---|---|
| `POST /api/intake` | `IntakeRequest` | `IntakeResponse` |
| `POST /api/reports` | `ReportDraft` | `Report` |
| `GET /api/reports[?user=maya]` | – | `Report[]` |
| `POST /api/match` | `{ reportId }` | `MatchResponse` |
| `GET /api/case/[groupId]` | – | `CaseResponse` |

## File ownership

- **Person A (frontend):** `app/report/`, `app/map/`, `app/vault/`, `components/`, PWA files (`public/manifest.json`, `public/icons/`, PWA metadata in `app/layout.tsx`)
- **Person B (backend):** `app/api/`, `lib/claude.ts`, `lib/supabase.ts`, `lib/match.ts`, `scripts/`, `app/case/`
- Shared, edit only when asked: `lib/types.ts`, `lib/mock.ts`, `CLAUDE.md`, config files

## Rules

1. Never edit files owned by the other person.
2. Never change `lib/types.ts` unless explicitly asked to.
3. Commit small and often. Always run `git pull --rebase` before every push.

## Gotcha

Webpack refuses to build from a path containing `!`. Keep the project in a folder without `!` in its path (e.g. `~/corroborate`), or `npm run dev` and `npm run build` will fail with a "contains exclamation mark" error.
