import Link from "next/link";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { ar } from "@/content/ar";

/**
 * The wordmark. The Activity glyph in --pulse is the logo mark — one of the two
 * sanctioned uses of the brand red (CLAUDE.md §4), alongside the ECG trace.
 */
export function Logo({
  className,
  withText = true,
}: {
  className?: string;
  withText?: boolean;
}) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
        className,
      )}
      aria-label={ar.site.name}
    >
      <Activity
        className="nb-logo-mark size-6 text-pulse"
        strokeWidth={2.5}
        aria-hidden="true"
      />
      {withText ? (
        <span className="text-lg font-bold tracking-[-0.01em] text-ink">
          {ar.site.name}
        </span>
      ) : null}
    </Link>
  );
}
