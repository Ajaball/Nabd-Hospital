import { cn } from "@/lib/utils";
import { CountUp } from "@/components/nabd/motion/CountUp";

/**
 * A single KPI figure. The number is data — IBM Plex Mono, tabular figures,
 * teal (CLAUDE.md §4). Numeric values count up when scrolled into view.
 */
export function KpiCard({
  label,
  value,
  suffix,
  className,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-line bg-card p-5", className)}>
      <p className="text-sm text-muted-ink">{label}</p>
      <p className="mt-2 font-data text-3xl font-bold tabular-nums text-teal">
        {typeof value === "number" ? <CountUp value={value} /> : value}
        {suffix ? <span className="ms-1 text-lg text-muted-ink">{suffix}</span> : null}
      </p>
    </div>
  );
}
