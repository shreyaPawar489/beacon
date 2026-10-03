// Upserts the 30 mock reports from lib/mock.ts into Supabase. Safe to re-run.
// Run: npm run seed
// Builds its own client because lib/supabase.ts is "server-only" and can't load outside Next.
import { createClient } from "@supabase/supabase-js";
import { MOCK_REPORTS } from "../lib/mock";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const rows = MOCK_REPORTS.map((r) => ({
    ...r,
    offender_handle: r.offender_handle ?? null,
    match_group_id: r.match_group_id ?? null,
  }));
  const { data, error } = await supabase.from("reports").upsert(rows, { onConflict: "id" }).select("id");
  if (error) throw new Error(error.message);
  console.log(`seeded ${data.length} reports`);
}

main().catch((err) => {
  console.error(`seed FAILED: ${err.message}`);
  process.exit(1);
});
