"use client";

import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser, type DemoUser } from "./user-provider";

const USERS: { id: DemoUser; label: string }[] = [
  { id: "maya", label: "Maya" },
  { id: "priya", label: "Priya" },
];

export function AppHeader() {
  const { user, setUser } = useUser();
  return (
    <header className="pt-safe sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2 font-semibold text-primary">
          <ShieldCheck className="h-5 w-5" />
          Corroborate
        </div>
        <div className="flex rounded-full bg-muted p-0.5 text-sm" role="group" aria-label="Switch user">
          {USERS.map((u) => (
            <button
              key={u.id}
              onClick={() => setUser(u.id)}
              aria-pressed={user === u.id}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                user === u.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground",
              )}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}
