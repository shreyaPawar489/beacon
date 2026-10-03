"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, ShieldCheck } from "lucide-react";
import { useUser } from "./user-provider";

export function AppHeader() {
  const { user, name, startFresh } = useUser();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <header className="pt-safe sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <ShieldCheck className="h-5 w-5" />
          Beacon
        </div>

        <div ref={ref} className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex items-center gap-2 rounded-full bg-muted py-1 pl-1 pr-3 text-sm transition active:scale-95"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {name ? name.split(" ").map((w) => w[0]).join("") : "·"}
            </span>
            <span className="max-w-[9rem] truncate">{name || "…"}</span>
          </button>

          {open && user && (
            <div className="absolute right-0 top-11 w-72 rounded-2xl bg-card p-4 text-sm shadow-xl ring-1 ring-border animate-in fade-in slide-in-from-top-2 duration-200">
              <p className="font-semibold">You&apos;re anonymous</p>
              <p className="mt-1 text-muted-foreground">
                No name, email or account. &ldquo;{name}&rdquo; is a random pseudonym, and your reports are tied only to
                this device.
              </p>
              {confirming ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">
                    This device will forget your vault. Reports you filed stay in the system and can still match.
                  </p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirming(false)} className="h-9 flex-1 rounded-xl border text-sm">
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        startFresh();
                        setOpen(false);
                        setConfirming(false);
                      }}
                      className="h-9 flex-1 rounded-xl bg-primary text-sm font-medium text-primary-foreground"
                    >
                      Start fresh
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirming(true)}
                  className="mt-4 flex items-center gap-1.5 text-sm font-medium text-primary"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Start fresh on this device
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
