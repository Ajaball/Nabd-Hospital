import { Check } from "lucide-react";

import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

const STEPS = ["department", "doctor", "datetime"] as const;
export type BookingStep = (typeof STEPS)[number];

/** The three-step progress header for the booking flow. */
export function BookingStepper({ current }: { current: BookingStep }) {
  const currentIndex = STEPS.indexOf(current);
  const labels: Record<BookingStep, string> = {
    department: ar.booking.steps.department,
    doctor: ar.booking.steps.doctor,
    datetime: ar.booking.steps.datetime,
  };

  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full text-sm font-semibold font-data",
                  done && "bg-teal text-paper",
                  active && "bg-teal text-paper",
                  !done && !active && "border border-line bg-card text-muted-ink",
                )}
              >
                {done ? <Check className="size-4" aria-hidden="true" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm",
                  active ? "font-semibold text-ink" : "text-muted-ink",
                )}
              >
                {labels[step]}
              </span>
            </div>
            {i < STEPS.length - 1 ? (
              <span className="h-px w-6 bg-line sm:w-10" aria-hidden="true" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
