import type { AppointmentStatus } from "@prisma/client";

import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/**
 * Appointment status marker (CLAUDE.md §4): a 4px-radius rectangle with a 3px
 * leading colour bar on the inline-start edge — the visual language of a colored
 * file tab in a medical record. Not a pill. Colours are the functional status
 * palette, never the brand --pulse.
 */
const STYLES: Record<AppointmentStatus, string> = {
  PENDING: "border-s-st-pending bg-st-pending/8 text-st-pending",
  CONFIRMED: "border-s-st-confirmed bg-st-confirmed/8 text-st-confirmed",
  COMPLETED: "border-s-st-completed bg-st-completed/8 text-st-completed",
  CANCELLED: "border-s-st-cancelled bg-st-cancelled/8 text-st-cancelled",
  NO_SHOW: "border-s-st-noshow bg-st-noshow/8 text-st-noshow",
};

export function StatusBadge({
  status,
  className,
}: {
  status: AppointmentStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border-s-[3px] px-2 py-1 text-xs font-medium",
        STYLES[status],
        className,
      )}
    >
      {ar.statuses[status]}
    </span>
  );
}
