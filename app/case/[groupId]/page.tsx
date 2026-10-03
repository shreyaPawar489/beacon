"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, ExternalLink, Loader2, Phone, ShieldCheck, Users } from "lucide-react";
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
  const [activeStep, setActiveStep] = useState(2);

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

      <NextStep groupId={params.groupId} user={user!} reports={reports} handles={handles} fingerprint={fingerprint} onStep={setActiveStep} />

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
            <li
              key={s.title}
              className={`flex gap-3 rounded-2xl p-4 ring-1 transition ${
                i === activeStep ? "bg-secondary/70 ring-primary/40" : i < activeStep ? "bg-card opacity-60 ring-border" : "bg-card ring-border"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i < activeStep ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
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

type Consent = { ready: number; total: number; mine: boolean };

// The decision point after a match: go to Title IX together, or talk to an advocate first.
function NextStep({
  groupId,
  user,
  reports,
  handles,
  fingerprint,
  onStep,
}: {
  groupId: string;
  user: string;
  reports: Report[];
  handles: string[];
  fingerprint: string | null;
  onStep: (i: number) => void;
}) {
  const [consent, setConsent] = useState<Consent | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const url = `/api/case/${encodeURIComponent(groupId)}/consent`;

  useEffect(() => {
    fetch(`${url}?user=${encodeURIComponent(user)}`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setConsent)
      .catch(() => {});
  }, [url, user]);

  const allReady = !!consent && consent.ready === consent.total;
  useEffect(() => onStep(allReady ? 3 : 2), [allReady, onStep]);

  async function respond(value: boolean) {
    setSaving(true);
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, consent: value }),
      });
      if (r.ok) setConsent(await r.json());
    } finally {
      setSaving(false);
    }
  }

  const summary = [
    "Beacon case file: corroborated report for OPHD (Title IX)",
    `Case ID: ${groupId}`,
    `Independent reports: ${reports.length}`,
    handles.length ? `Account named: ${handles.join(", ")}` : null,
    "",
    ...reports.map(
      (r, i) =>
        `${i + 1}. ${formatWhen(r.datetime)}: ${categoryLabel(r.category)}${r.location.label && r.location.label !== "Online" ? ` at ${r.location.label}` : ""}. ${r.offender_desc}\n   sha256 ${r.hash}`,
    ),
    "",
    fingerprint ? `Case fingerprint (sha256 of all hashes): ${fingerprint}` : null,
    "Each reporter has consented to share. Identities are released only through OPHD.",
  ]
    .filter((l) => l !== null)
    .join("\n");

  if (!consent) return <div className="h-40 animate-pulse rounded-2xl bg-muted" />;

  const dots = (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {Array.from({ length: consent.total }, (_, i) => (
          <span key={i} className={`h-2.5 w-2.5 rounded-full ${i < consent.ready ? "bg-primary" : "bg-primary/20"}`} />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {consent.ready} of {consent.total} ready
      </span>
    </div>
  );

  return (
    <section className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-primary/30 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Your next step</p>

      {allReady ? (
        <>
          <h2 className="mt-1 text-lg font-semibold">Everyone is ready to go to Title IX together</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            OPHD (Berkeley&apos;s Title IX office) receives this as one report from {consent.total} people. Their
            identities aren&apos;t shared with each other.
          </p>
          <div className="mt-3">{dots}</div>
          <ol className="mt-4 space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">1</span>
              <div className="flex-1">
                <p className="font-medium">Copy the case file</p>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(summary).then(() => setCopied(true), () => {});
                  }}
                  className="mt-1.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-secondary px-3 text-xs font-medium text-secondary-foreground"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied" : "Copy case summary"}
                </button>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">2</span>
              <div className="flex-1">
                <p className="font-medium">File with OPHD and paste it in</p>
                <a
                  href="https://ophd.berkeley.edu"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3 text-xs font-medium text-primary-foreground"
                >
                  Open OPHD reporting <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">3</span>
              <p className="flex-1 text-muted-foreground">
                OPHD will contact you about supportive measures. You can bring a PATH to Care advocate to any meeting.
              </p>
            </li>
          </ol>
        </>
      ) : consent.mine ? (
        <>
          <h2 className="mt-1 text-lg font-semibold">You&apos;re ready. Waiting for the others.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Nothing goes to Title IX until everyone in this case agrees. Nobody is told who has or hasn&apos;t.
          </p>
          <div className="mt-3">{dots}</div>
          <button onClick={() => respond(false)} disabled={saving} className="mt-4 text-sm font-medium text-muted-foreground underline underline-offset-4">
            I&apos;ve changed my mind
          </button>
        </>
      ) : (
        <>
          <h2 className="mt-1 text-lg font-semibold">Go to Title IX together?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {consent.total} people reported the same person. A report backed by several people is much harder to dismiss.
            Nothing is shared unless everyone agrees, and you can change your mind.
          </p>
          <div className="mt-3">{dots}</div>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => respond(true)}
              disabled={saving}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-base font-semibold text-primary-foreground transition active:scale-[0.98] disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
              I&apos;m ready to report together
            </button>
            <a
              href="tel:5106432005"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border text-sm font-medium"
            >
              <Phone className="h-4 w-4" /> Talk to a confidential advocate first
            </a>
          </div>
        </>
      )}
    </section>
  );
}
