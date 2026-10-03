"use client";

// Chat-style report intake. Scripted questions: each answer fills the
// ReportDraft directly, so it works without an API key.
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUp, Check, Loader2, LocateFixed, Lock, Maximize2, RotateCcw, X } from "lucide-react";
import type { Category, MatchResponse, Report, ReportDraft, Severity } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useUser } from "./user-provider";
import {
  BERKELEY,
  CATEGORIES,
  SEVERITIES,
  categoryEmoji,
  categoryLabel,
  formatWhen,
  PLACES,
  labelFor,
  severityMeta,
} from "./report-meta";

const LocationPicker = dynamic(() => import("./location-picker"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse bg-muted" />,
});

type Step = "category" | "summary" | "where" | "when" | "who" | "severity" | "review";
type Bubble = { id: number; from: "bot" | "user"; text: string };
type Outcome = { kind: "matched"; groupId: string } | { kind: "saved" } | { kind: "error"; message: string };

const QUESTIONS: Record<Step, (d: ReportDraft) => string> = {
  category: () =>
    "Hi. You're safe here. Everything you share stays private unless you choose otherwise. What kind of thing happened?",
  summary: () => "I'm sorry that happened. In your own words, what happened? Share as much or as little as you like.",
  where: (d) =>
    d.category === "online"
      ? "Where were you, roughly? You can tap the map, or skip if it was only online."
      : "Where did it happen? Tap the map to drop a pin.",
  when: () => "When did it happen?",
  who: (d) =>
    d.category === "online"
      ? "What was their username or handle? Anything else you noticed about the account helps too."
      : d.category === "unsafe_area"
        ? "Was there a person involved? Describe them if so. Otherwise, describe what made the place feel unsafe."
        : "Can you describe the person? Clothing, height, anything that stood out.",
  severity: () => "Last one. How did this leave you feeling?",
  review: () =>
    "Thank you. That took courage. Check your incident card below. When you're ready, submit it privately.",
};

const ORDER: Step[] = ["category", "summary", "where", "when", "who", "severity", "review"];

export function IntakeChat() {
  const { user } = useUser();
  const [step, setStep] = useState<Step>("category");
  const [draft, setDraft] = useState<ReportDraft>({});
  const [bubbles, setBubbles] = useState<Bubble[]>([{ id: 0, from: "bot", text: QUESTIONS.category({}) }]);
  const [typing, setTyping] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);

  const say = (from: Bubble["from"], text: string) =>
    setBubbles((b) => [...b, { id: nextId.current++, from, text }]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [bubbles, typing, step]);

  function answer(text: string, patch: ReportDraft) {
    const next = { ...draft, ...patch };
    say("user", text);
    setDraft(next);
    const nextStep = ORDER[ORDER.indexOf(step) + 1];
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      say("bot", QUESTIONS[nextStep](next));
      setStep(nextStep);
    }, 650);
  }

  function restart() {
    setDraft({});
    setStep("category");
    setOutcome(null);
    setBubbles([{ id: nextId.current++, from: "bot", text: QUESTIONS.category({}) }]);
  }

  async function submit() {
    if (!user) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...draft, user_alias: user } satisfies ReportDraft),
      });
      if (!res.ok) throw new Error(`Couldn't save your report (${res.status})`);
      const report = (await res.json()) as Report;

      // A failed match check still leaves the report saved, so treat it as "no match yet".
      let match: MatchResponse | null = null;
      try {
        const m = await fetch("/api/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId: report.id }),
        });
        if (m.ok) match = (await m.json()) as MatchResponse;
      } catch {}

      setOutcome(
        match?.matched && match.match_group_id
          ? { kind: "matched", groupId: match.match_group_id }
          : { kind: "saved" },
      );
    } catch (e) {
      setOutcome({ kind: "error", message: e instanceof Error ? e.message : "Something went wrong" });
    } finally {
      setSubmitting(false);
    }
  }

  const waiting = typing || bubbles[bubbles.length - 1]?.from !== "bot";

  return (
    <>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
        {bubbles.map((b) => (
          <ChatBubble key={b.id} from={b.from}>
            {b.text}
          </ChatBubble>
        ))}
        {typing && <TypingDots />}
      </div>

      <div className="space-y-3 border-t bg-background/95 px-4 pb-3 pt-3 backdrop-blur">
        <IncidentCard draft={draft} />
        <div className={cn("transition-opacity duration-200", waiting && "pointer-events-none opacity-40")}>
          <Composer
            key={step}
            step={step}
            draft={draft}
            submitting={submitting}
            onAnswer={answer}
            onSubmit={submit}
            onRestart={restart}
          />
        </div>
      </div>

      {outcome && <OutcomeScreen outcome={outcome} onClose={restart} onRetry={() => setOutcome(null)} />}
    </>
  );
}

function ChatBubble({ from, children }: { from: Bubble["from"]; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex animate-in fade-in slide-in-from-bottom-2 duration-300",
        from === "user" ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[15px] leading-snug",
          from === "user"
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-card text-card-foreground shadow-sm ring-1 ring-border",
        )}
      >
        {children}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex animate-in fade-in">
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-card px-4 py-3 shadow-sm ring-1 ring-border">
        {[0, 150, 300].map((d) => (
          <span
            key={d}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function IncidentCard({ draft }: { draft: ReportDraft }) {
  const rows: { key: string; label: string; value: React.ReactNode }[] = [];
  if (draft.category)
    rows.push({ key: "type", label: "Type", value: `${categoryEmoji(draft.category)} ${categoryLabel(draft.category)}` });
  if (draft.summary) rows.push({ key: "what", label: "What", value: draft.summary });
  if (draft.location) rows.push({ key: "where", label: "Where", value: draft.location.label });
  if (draft.datetime) rows.push({ key: "when", label: "When", value: formatWhen(draft.datetime) });
  if (draft.offender_handle) rows.push({ key: "handle", label: "Handle", value: draft.offender_handle });
  if (draft.offender_desc) rows.push({ key: "who", label: "Who", value: draft.offender_desc });
  if (draft.severity) {
    const s = severityMeta(draft.severity);
    rows.push({
      key: "sev",
      label: "Severity",
      value: (
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
          {s.level}/5 · {s.label}
        </span>
      ),
    });
  }

  return (
    <div className="rounded-2xl bg-secondary/60 p-3 ring-1 ring-border">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-secondary-foreground/70">
          Incident card
        </span>
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Lock className="h-3 w-3" /> Private
        </span>
      </div>
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground">Details fill in here as you answer.</p>
      ) : (
        <dl className="max-h-32 space-y-1 overflow-y-auto">
          {rows.map((r) => (
            <div
              key={r.key}
              className="grid grid-cols-[4.5rem_1fr] gap-2 text-[13px] animate-in fade-in slide-in-from-left-2 duration-500"
            >
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className="line-clamp-2 font-medium">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function Chip({
  children,
  onClick,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border bg-card px-3.5 py-2 text-sm font-medium shadow-sm transition active:scale-95 active:bg-accent",
        className,
      )}
    >
      {children}
    </button>
  );
}

function SendButton({ disabled, onClick }: { disabled: boolean; onClick: () => void }) {
  return (
    <Button
      size="icon"
      aria-label="Send"
      disabled={disabled}
      onClick={onClick}
      className="h-10 w-10 shrink-0 rounded-full"
    >
      <ArrowUp className="!size-5" />
    </Button>
  );
}

function Composer({
  step,
  draft,
  submitting,
  onAnswer,
  onSubmit,
  onRestart,
}: {
  step: Step;
  draft: ReportDraft;
  submitting: boolean;
  onAnswer: (text: string, patch: ReportDraft) => void;
  onSubmit: () => void;
  onRestart: () => void;
}) {
  const [text, setText] = useState("");
  const [handle, setHandle] = useState("");
  const [custom, setCustom] = useState("");

  switch (step) {
    case "category":
      return (
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Chip key={c.id} onClick={() => onAnswer(`${c.emoji} ${c.label}`, { category: c.id as Category })}>
              {c.emoji} {c.label}
            </Chip>
          ))}
        </div>
      );

    case "summary":
      return (
        <div className="flex items-end gap-2">
          <Textarea
            autoFocus
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What happened…"
            className="max-h-32 min-h-10 resize-none rounded-2xl bg-card"
          />
          <SendButton disabled={!text.trim()} onClick={() => onAnswer(text.trim(), { summary: text.trim() })} />
        </div>
      );

    case "where":
      return <WhereStep online={draft.category === "online"} onAnswer={onAnswer} />;

    case "when": {
      const ago = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();
      return (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Chip onClick={() => onAnswer("Just now", { datetime: ago(0) })}>Just now</Chip>
            <Chip onClick={() => onAnswer("Earlier today", { datetime: ago(3) })}>Earlier today</Chip>
            <Chip onClick={() => onAnswer("Yesterday", { datetime: ago(24) })}>Yesterday</Chip>
            <Chip onClick={() => onAnswer("Last week", { datetime: ago(24 * 7) })}>Last week</Chip>
          </div>
          <div className="flex items-center gap-2">
            <Input
              type="datetime-local"
              value={custom}
              max={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setCustom(e.target.value)}
              className="h-10 rounded-full bg-card"
              aria-label="Pick a date and time"
            />
            <SendButton
              disabled={!custom}
              onClick={() => {
                const iso = new Date(custom).toISOString();
                onAnswer(formatWhen(iso), { datetime: iso });
              }}
            />
          </div>
        </div>
      );
    }

    case "who": {
      const online = draft.category === "online";
      const ready = online ? handle.trim() || text.trim() : text.trim();
      const send = () => {
        const h = handle.trim() ? (handle.trim().startsWith("@") ? handle.trim() : `@${handle.trim()}`) : undefined;
        onAnswer([h, text.trim()].filter(Boolean).join(" · "), {
          offender_handle: h,
          offender_desc: text.trim(),
        });
      };
      return (
        <div className="space-y-2">
          {online && (
            <Input
              autoFocus
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@handle"
              autoCapitalize="none"
              autoCorrect="off"
              className="h-10 rounded-full bg-card"
            />
          )}
          <div className="flex items-end gap-2">
            <Textarea
              autoFocus={!online}
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={online ? "Anything else about the account…" : "e.g. man, ~30s, grey hoodie"}
              className="max-h-32 min-h-10 resize-none rounded-2xl bg-card"
            />
            <SendButton disabled={!ready} onClick={send} />
          </div>
          {!online && (
            <Chip
              className="text-muted-foreground"
              onClick={() => onAnswer("I didn't see them", { offender_desc: "Couldn't see face" })}
            >
              I didn&apos;t see them
            </Chip>
          )}
        </div>
      );
    }

    case "severity":
      return (
        <div className="grid grid-cols-1 gap-1.5">
          {SEVERITIES.map((s) => (
            <button
              key={s.level}
              onClick={() => onAnswer(`${s.level} · ${s.label}`, { severity: s.level as Severity })}
              className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2 text-left text-sm shadow-sm transition active:scale-[0.98] active:bg-accent"
            >
              <span className="h-3 w-3 rounded-full" style={{ background: s.color }} />
              <span className="font-medium">{s.label}</span>
              <span className="ml-auto text-xs text-muted-foreground">{s.level}/5</span>
            </button>
          ))}
        </div>
      );

    case "review":
      return (
        <div className="flex gap-2">
          <Button variant="outline" className="h-12 rounded-xl" onClick={onRestart} disabled={submitting}>
            <RotateCcw /> Start over
          </Button>
          <Button className="h-12 flex-1 rounded-xl text-base" onClick={onSubmit} disabled={submitting}>
            {submitting ? <Loader2 className="animate-spin" /> : <Lock />}
            {submitting ? "Saving securely…" : "Submit privately"}
          </Button>
        </div>
      );
  }
}

type Point = { lat: number; lng: number };

// Live map inline in the chat: tap to drop a pin, or use a quick pick / GPS.
function WhereStep({
  online,
  onAnswer,
}: {
  online: boolean;
  onAnswer: (text: string, patch: ReportDraft) => void;
}) {
  const [point, setPoint] = useState<Point | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(false);
  const label = point ? labelFor(point.lat, point.lng) : null;

  const confirm = (p: Point) => {
    const l = labelFor(p.lat, p.lng);
    onAnswer(`📍 ${l}`, { location: { ...p, label: l } });
  };

  const locate = () => {
    if (!navigator.geolocation) return setGeoError(true);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocating(false);
        setGeoError(false);
        setPoint({ lat: coords.latitude, lng: coords.longitude });
      },
      () => {
        setLocating(false);
        setGeoError(true);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div className="space-y-2">
      <div className="relative isolate h-44 overflow-hidden rounded-2xl ring-1 ring-border">
        <LocationPicker value={point} onPick={(lat, lng) => setPoint({ lat, lng })} />
        {!point && (
          <span className="pointer-events-none absolute left-1/2 top-2 z-[1000] -translate-x-1/2 rounded-full bg-foreground/80 px-3 py-1 text-xs text-background">
            Tap the map to drop a pin
          </span>
        )}
        <div className="absolute right-2 top-2 z-[1000] flex flex-col gap-1.5">
          <MapButton label="Use my location" onClick={locate}>
            {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
          </MapButton>
          <MapButton label="Expand map" onClick={() => setExpanded(true)}>
            <Maximize2 className="h-4 w-4" />
          </MapButton>
        </div>
      </div>

      {point ? (
        <Button className="h-11 w-full rounded-xl" onClick={() => confirm(point)}>
          <Check /> Use {label}
        </Button>
      ) : (
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
          {online && (
            <Chip
              className="shrink-0"
              onClick={() =>
                onAnswer("It was only online", { location: { lat: BERKELEY[0], lng: BERKELEY[1], label: "Online" } })
              }
            >
              Only online
            </Chip>
          )}
          {PLACES.map((p) => (
            <Chip key={p.label} className="shrink-0 whitespace-nowrap" onClick={() => setPoint({ lat: p.lat, lng: p.lng })}>
              {p.label}
            </Chip>
          ))}
        </div>
      )}
      {geoError && <p className="text-xs text-muted-foreground">Couldn&apos;t get your location. Tap the map instead.</p>}

      {expanded && (
        <PinSheet
          initial={point}
          onCancel={() => setExpanded(false)}
          onConfirm={(p) => {
            setExpanded(false);
            setPoint(p);
          }}
        />
      )}
    </div>
  );
}

function MapButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-card text-primary shadow-md ring-1 ring-border active:scale-95"
    >
      {children}
    </button>
  );
}

// Full-screen map. Portalled to <body> because the composer's backdrop-blur
// would otherwise trap `position: fixed` inside it.
function PinSheet({
  initial,
  onCancel,
  onConfirm,
}: {
  initial: Point | null;
  onCancel: () => void;
  onConfirm: (p: Point) => void;
}) {
  const [point, setPoint] = useState<Point | null>(initial);
  const label = point ? labelFor(point.lat, point.lng) : null;

  return createPortal(
    <div className="isolate fixed inset-0 z-50 flex flex-col bg-background animate-in fade-in slide-in-from-bottom-8 duration-300">
      <div className="pt-safe mx-auto flex w-full max-w-phone items-center justify-between border-b px-4 py-3">
        <button onClick={onCancel} className="flex items-center gap-1 text-sm text-muted-foreground">
          <X className="h-4 w-4" /> Cancel
        </button>
        <span className="text-sm font-semibold">Where did it happen?</span>
        <span className="w-14" />
      </div>
      <div className="relative mx-auto w-full max-w-phone flex-1">
        <LocationPicker value={point} onPick={(lat, lng) => setPoint({ lat, lng })} />
        {!point && (
          <div className="pointer-events-none absolute inset-x-0 top-4 z-[1000] flex justify-center">
            <span className="rounded-full bg-foreground/80 px-3 py-1.5 text-xs text-background">
              Tap the map to drop a pin
            </span>
          </div>
        )}
      </div>
      <div className="pb-safe mx-auto w-full max-w-phone border-t px-4 pt-3">
        <p className="mb-2 min-h-5 text-sm text-muted-foreground">{label ?? "No pin yet"}</p>
        <Button
          className="mb-3 h-12 w-full rounded-xl text-base"
          disabled={!point}
          onClick={() => point && onConfirm(point)}
        >
          <Check /> Use this spot
        </Button>
      </div>
    </div>,
    document.body,
  );
}

function OutcomeScreen({
  outcome,
  onClose,
  onRetry,
}: {
  outcome: Outcome;
  onClose: () => void;
  onRetry: () => void;
}) {
  if (outcome.kind === "matched") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[hsl(262_45%_40%)] to-[hsl(280_40%_22%)] text-white animate-in fade-in duration-700">
        <div className="mx-auto max-w-phone px-8 text-center">
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white/10 text-5xl ring-1 ring-white/20 animate-in zoom-in-50 duration-700">
            🔗
          </div>
          <h2 className="text-3xl font-semibold leading-tight animate-in fade-in slide-in-from-bottom-4 delay-300 duration-700 fill-mode-both">
            You&apos;re not alone.
          </h2>
          <p className="mt-3 text-lg text-white/80 animate-in fade-in slide-in-from-bottom-4 delay-500 duration-700 fill-mode-both">
            Your report matched another.
          </p>
          <p className="mt-2 text-sm text-white/60 animate-in fade-in delay-700 duration-700 fill-mode-both">
            Neither of you has been identified to the other. You decide what happens next.
          </p>
          <div className="mt-10 space-y-3 animate-in fade-in slide-in-from-bottom-4 delay-1000 duration-700 fill-mode-both">
            <Link
              href={`/case/${outcome.groupId}`}
              className="flex h-12 w-full items-center justify-center rounded-xl bg-white text-base font-semibold text-[hsl(262_45%_35%)] shadow-lg transition active:scale-[0.98]"
            >
              View the case
            </Link>
            <button onClick={onClose} className="h-10 w-full text-sm text-white/70">
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (outcome.kind === "error") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur animate-in fade-in">
        <div className="mx-auto max-w-phone px-8 text-center">
          <p className="text-4xl">⚠️</p>
          <h2 className="mt-4 text-xl font-semibold">Your report wasn&apos;t sent</h2>
          <p className="mt-2 text-sm text-muted-foreground">{outcome.message}. Your answers are still here.</p>
          <Button className="mt-8 h-12 w-full rounded-xl" onClick={onRetry}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background animate-in fade-in duration-500">
      <div className="mx-auto max-w-phone px-8 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-4xl animate-in zoom-in-75 duration-500">
          🔒
        </div>
        <h2 className="text-2xl font-semibold">Saved privately.</h2>
        <p className="mt-3 text-muted-foreground">
          We&apos;ll let you know if anyone else reports the same person.
        </p>
        <div className="mt-10 space-y-2">
          <Link
            href="/vault"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-primary text-base font-semibold text-primary-foreground transition active:scale-[0.98]"
          >
            Go to my vault
          </Link>
          <button onClick={onClose} className="h-10 w-full text-sm text-muted-foreground">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
