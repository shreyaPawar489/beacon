"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/report", label: "Report", icon: MessageSquarePlus },
  { href: "/vault", label: "Vault", icon: Lock },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-phone">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
