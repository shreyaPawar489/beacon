// Owner: Person B. Inserts and deletes a test row to confirm the Supabase connection.
// Run: npm run db:check
// Builds its own client because lib/supabase.ts is "server-only" and can't load outside Next.
import { createClient } from "@supabase/supabase-js";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  }
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const { data, error } = await supabase
    .from("reports")
    .insert({
      user_alias: "db_check",
      datetime: new Date().toISOString(),
      location: { lat: 37.8719, lng: -122.2585, label: "db:check" },
      category: "unsafe_area",
      offender_desc: "",
      severity: 1,
      summary: "connection test",
      hash: "db_check",
    })
    .select()
    .single();
  if (error) throw new Error(`insert failed: ${error.message}`);
  console.log(`inserted ${data.id}`);

  const { error: delError } = await supabase.from("reports").delete().eq("id", data.id);
  if (delError) throw new Error(`delete failed: ${delError.message} (row ${data.id} left behind)`);
  console.log(`deleted ${data.id}`);
  console.log("db:check OK");
}

main().catch((err) => {
  console.error(`db:check FAILED: ${err.message}`);
  process.exit(1);
});
