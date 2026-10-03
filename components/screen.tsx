import { cn } from "@/lib/utils";

// Fills the space between the header and tab bar, cancelling <main>'s padding.
// Header and tab bar are each 57px tall (content + 1px border) plus safe areas.
export function Screen({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("relative -mx-4 -mb-24 -mt-4 flex flex-col overflow-hidden", className)}
      style={{
        height:
          "calc(100dvh - 114px - env(safe-area-inset-top) - env(safe-area-inset-bottom))",
      }}
    >
      {children}
    </div>
  );
}
