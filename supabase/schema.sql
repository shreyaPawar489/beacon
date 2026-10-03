-- Corroborate schema. Paste into the Supabase SQL Editor and run.
-- Mirrors the Report type in lib/types.ts.

create extension if not exists pgcrypto;

create table if not exists public.reports (
  id              text        primary key default gen_random_uuid()::text,  -- text so mock ids like r_001 seed as-is
  user_alias      text        not null,
  datetime        timestamptz not null,                -- when the incident happened
  location        jsonb       not null,                -- { lat, lng, label }
  category        text        not null,
  offender_desc   text        not null default '',
  offender_handle text,
  severity        smallint    not null,
  summary         text        not null default '',
  hash            text        not null,
  created_at      timestamptz not null default now(),  -- when the report was filed
  match_group_id  text,                                -- e.g. "mg_calbro"

  constraint reports_category_check
    check (category in ('harassment', 'stalking', 'assault', 'unsafe_area', 'online')),
  constraint reports_severity_check
    check (severity between 1 and 5),
  constraint reports_location_check
    check (
      jsonb_typeof(location) = 'object'
      and jsonb_typeof(location -> 'lat') = 'number'
      and jsonb_typeof(location -> 'lng') = 'number'
      and jsonb_typeof(location -> 'label') = 'string'
    )
);

-- If the table already existed with a uuid id, convert it (no-op otherwise).
alter table public.reports alter column id type text using id::text;
alter table public.reports alter column id set default gen_random_uuid()::text;

create index if not exists reports_user_alias_idx      on public.reports (user_alias);
create index if not exists reports_offender_handle_idx on public.reports (offender_handle);
create index if not exists reports_match_group_id_idx  on public.reports (match_group_id);

-- RLS on with no policies: anon/authenticated keys can't read or write.
-- All access goes through Next.js API routes using the service role key,
-- which bypasses RLS.
alter table public.reports enable row level security;

-- Belt and braces: drop the default grants to the public roles too.
revoke all on table public.reports from anon, authenticated;
