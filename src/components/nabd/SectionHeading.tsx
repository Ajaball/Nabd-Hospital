import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { cn } from "@/lib/utils";

/**
 * A section header led by the pulse hairline rule (CLAUDE.md §4 — the trace
 * persists as a 1px divider at the top of each section). Title, optional lead,
 * and an optional "view all" link on the inline-end.
 */
export function SectionHeading({
  title,
  lead,
  action,
  as: As = "h2",
  className,
}: {
  title: string;
  lead?: string;
  action?: { href: string; label: string };
  as?: "h1" | "h2";
  className?: string;
}) {
  return (
    <div className={cn("mb-8", className)}>
      <PulseTrace variant="rule" className="mb-6" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <As
            className={cn(
              "font-bold tracking-[-0.01em] text-ink",
              As === "h1" ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl",
            )}
          >
            {title}
          </As>
          {lead ? (
            <p className="mt-2 text-base leading-relaxed text-muted-ink">{lead}</p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="inline-flex items-center gap-1 text-sm font-medium text-teal transition-colors hover:brightness-90"
          >
            {action.label}
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
