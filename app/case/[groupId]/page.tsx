"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Phone, ShieldCheck } from "lucide-react";
import type { CaseResponse, Report } from "@/lib/types";
import { useUser } from "@/components/user-provider";
import { categoryEmoji, categoryLabel, formatWhen, severityMeta } from "@/components/report-meta";

const PATHWAY = [
  { title: "Your report stays private", body: "Nothing is shared with anyone, including the other reporters, unless you choose to." },
  { title: "Talk to a confidential advocate", body: "PATH to Care advocates can explain your options without starting a formal process." },
  { title: "Decide together whether to come forward", body: "If every reporter consents, this case file can go to OPHD as one corroborated report." },
  { title: "OPHD (Title IX) review", body: "Berkeley's Office for the Prevention of Harassment & Discrimination can investigate and offer supportive measures such as no-contact directives, housing or class changes." },
];

const RESOURCES = [
  { name: "PATH to Care Center, 24/7 confidential care line", phone: "510-643-2005", url: "https://care.berkeley.edu" },
  { name: "OPHD (Title IX office)", phone: "510-643-7985", url: "https://ophd.berkeley.edu" },
  { name: "UCPD, emergency or non-emergency", phone: "510-642-3333", url: "https://ucpd.berkeley.edu" },
  { name: "Counseling & Psychological Services (Tang Center)", phone: "510-642-9494", url: "https://uhs.berkeley.edu/caps" },
  { name: "BearWALK night safety escort", phone: "510-642-9255", url: "https://bearwalk.berkeley.edu" },
];

async function sha256Hex(text: string): Promise<string | null> {
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return null; // crypto.subtle needs a secure context (https or localhost)
  }
}

export default function CasePage({ params }: { params: { groupId: string } }) {
  const { user } = useUser();
  const [reports, setReports] = useState<Report[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fingerprint, setFingerprint] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setReports(null);
    fetch(`/api/case/${encodeURIComponent(params.groupId)}?user=${encodeURIComponent(user)}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((res: CaseResponse) => {
        setReports(res.reports);
        sha256Hex(res.reports.map((r) => r.hash).join("\n")).then(setFingerprint);
      })
      .catch((e) => setError(e.message));
  }, [params.groupId, user]);

  if (error) return <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">Couldn&apos;t load this case ({error}).</p>;
  if (!reports)
    return (
      <div className="space-y-3">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="h-48 animate-pulse rounded-2xl bg-muted" />
      </div>
    );

  const mine = reports.some((r) => r.user_alias === user);
  if (!mine)
    return (
      <div className="flex flex-col items-center px-6 py-16 text-center">
        <p className="text-4xl">🔒</p>
        <p className="mt-4 font-medium">This case isn&apos;t yours to view</p>
        <p className="mt-1 text-sm text-muted-foreground">Case files are only visible to the people whose reports are in them.</p>
        <Link href="/vault" className="mt-6 text-sm font-medium text-primary">Back to your vault</Link>
      </div>
    );

  // Other reporters are anonymised as Reporter B, C… in filing order.
  const names = new Map<string, string>();
  let next = 0;
  for (const r of reports) {
    if (r.user_alias === user) names.set(r.user_alias, "You");
    else if (!names.has(r.user_alias)) names.set(r.user_alias, `Reporter ${String.fromCharCode(66 + next++)}`);
  }
  // One entry per account, however each person typed it (@Foo vs foo).
  const handles = Array.from(
    new Map(
      reports
        .filter((r) => r.offender_handle)
        .map((r) => [r.offender_handle!.trim().toLowerCase().replace(/^@+/, ""), r.offender_handle!.trim()]),
    ).values(),
  ).map((h) => (h.startsWith("@") ? h : `@${h}`));

  return (
    <div className="space-y-6 pb-4 animate-in fade-in duration-300">
      <Link href="/vault" className="inline-flex items-center gap-1 text-sm text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Vault
      </Link>

      <section className="rounded-2xl bg-gradient-to-br from-[hsl(262_45%_45%)] to-[hsl(280_40%_30%)] p-5 text-white shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Case file</p>
        <h1 className="mt-1 text-2xl font-semibold">🔗 {reports.length} people, one pattern</h1>
        <p className="mt-2 text-sm text-white/80">
          {handles.length ? `Same account: ${handles.join(", ")}. ` : ""}
          {formatWhen(reports[0].datetime)} to {formatWhen(reports[reports.length - 1].datetime)}
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Timeline</h2>
        <ol className="relative space-y-4 border-l-2 border-primary/20 pl-5">
          {reports.map((r) => {
            const isMine = r.user_alias === user;
            const sev = severityMeta(r.severity);
            return (
              <li key={r.id} className="relative">
                <span className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-background" style={{ background: sev.color }} />
                <div className={`rounded-2xl p-4 ring-1 ${isMine ? "bg-secondary/60 ring-primary/30" : "bg-card ring-border"}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold">{names.get(r.user_alias)}</span>
                    <span className="text-muted-foreground">{formatWhen(r.datetime)}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">
                    {categoryEmoji(r.category)} {categoryLabel(r.category)}
                    {r.location.label && r.location.label !== "Online" && ` · ${r.location.label}`}
                  </p>
                  {r.offender_desc && <p className="mt-1 text-sm text-muted-foreground">{r.offender_desc}</p>}
                  <p className="mt-2 text-sm">
                    {isMine ? r.summary : <span className="italic text-muted-foreground">Account withheld until this reporter chooses to share it.</span>}
                  </p>
                  <p className="mt-3 break-all font-mono text-[10px] text-muted-foreground">sha256 {r.hash}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Title IX pathway</h2>
        <ol className="space-y-2">
          {PATHWAY.map((s, i) => (
            <li key={s.title} className="flex gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">{i + 1}</span>
              <div>
                <p className="text-sm font-medium">{s.title}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Berkeley resources</h2>
        <ul className="divide-y rounded-2xl bg-card ring-1 ring-border">
          {RESOURCES.map((r) => (
            <li key={r.name} className="flex items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm font-medium">
                  {r.name} <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                </a>
                <p className="text-xs text-muted-foreground">{r.phone}</p>
              </div>
              <a href={`tel:${r.phone.replace(/-/g, "")}`} aria-label={`Call ${r.name}`} className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-primary">
                <Phone className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">In immediate danger? Call 911.</p>
      </section>

      <section className="rounded-2xl bg-muted/60 p-4">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary" /> Integrity
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Each report was hashed (SHA-256) when it was filed. Any later edit would change its hash. Case fingerprint (hash of all report hashes):
        </p>
        <p className="mt-2 break-all font-mono text-[10px]">{fingerprint ?? "unavailable"}</p>
      </section>
    </div>
  );
}
