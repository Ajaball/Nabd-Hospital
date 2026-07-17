import type { AppointmentStatus } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ar } from "@/content/ar";

/**
 * Appointment status as a colored file-tab (CLAUDE.md §4): a 4px-radius
 * rectangle with a 3px leading color bar on the inline-start edge — never a
 * pill. Status colors are functional and separate from the brand (--pulse is
 * never used here).
 */

const STYLES: Record<
  AppointmentStatus,
  { bar: string; text: string; bg: string }
> = {
  PENDING: { bar: "border-s-st-pending", text: "text-st-pending", bg: "bg-st-pending/8" },
  CONFIRMED: {
    bar: "border-s-st-confirmed",
    text: "text-st-confirmed",
    bg: "bg-st-confirmed/8",
  },
  COMPLETED: {
    bar: "border-s-st-completed",
    text: "text-st-completed",
    bg: "bg-st-completed/8",
  },
  CANCELLED: {
    bar: "border-s-st-cancelled",
    text: "text-st-cancelled",
    bg: "bg-st-cancelled/8",
  },
  NO_SHOW: { bar: "border-s-st-noshow", text: "text-st-noshow", bg: "bg-st-noshow/8" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  const s = STYLES[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border-s-[3px] px-2 py-0.5 text-xs font-medium",
        s.bar,
        s.text,
        s.bg,
        className,
      )}
    >
      {ar.status[status]}
    </span>
  );
}
