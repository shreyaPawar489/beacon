"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Lock, MessageSquarePlus } from "lucide-react";
import type { Report } from "@/lib/types";
import { useUser } from "@/components/user-provider";
import { categoryEmoji, categoryLabel, formatWhen, severityMeta } from "@/components/report-meta";

export default function VaultPage() {
  const { user } = useUser();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setReports(null);
    setError(null);
    fetch(`/api/reports?user=${encodeURIComponent(user)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      // Defence in depth: never render someone else's report even if the API slips.
      .then((rs: Report[]) => !cancelled && setReports(rs.filter((r) => r.user_alias === user)))
      .catch((e) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your vault</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Lock className="h-3.5 w-3.5" /> Only you can see these reports.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">Couldn&apos;t load your reports ({error}).</p>
      )}

      {!reports && !error && (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      )}

      {reports?.length === 0 && (
        <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-2xl">🔒</div>
          <p className="font-medium">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">Reports you file are stored privately here.</p>
          <Link
            href="/report"
            className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground"
          >
            <MessageSquarePlus className="h-4 w-4" /> File a report
          </Link>
        </div>
      )}

      <ul className="space-y-3">
        {reports?.map((r) => {
          const sev = severityMeta(r.severity);
          return (
            <li key={r.id} className="rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">
                    {categoryEmoji(r.category)} {categoryLabel(r.category)}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {formatWhen(r.datetime)} · {r.location.label}
                  </p>
                </div>
                {r.match_group_id ? (
                  <Link
                    href={`/case/${r.match_group_id}`}
                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground"
                  >
                    🔗 Matched <ChevronRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                    🔒 Private
                  </span>
                )}
              </div>
              {r.summary && <p className="mt-3 line-clamp-3 text-sm">{r.summary}</p>}
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full" style={{ background: sev.color }} />
                {sev.label}
                {r.offender_handle && <span className="ml-auto font-mono">{r.offender_handle}</span>}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
