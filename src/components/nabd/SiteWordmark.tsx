import Link from "next/link";
import { Activity } from "lucide-react";

import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/**
 * The wordmark: the hospital name beside a small pulse mark. The mark is the one
 * place besides PulseTrace where --pulse may appear (CLAUDE.md §4 — "the ECG
 * trace and the logo mark").
 */
export function SiteWordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2 text-ink", className)}
      aria-label={ar.site.name}
    >
      <Activity className="size-6 text-pulse" aria-hidden="true" strokeWidth={2.5} />
      <span className="text-xl font-bold tracking-[-0.01em]">{ar.site.name}</span>
    </Link>
  );
}
