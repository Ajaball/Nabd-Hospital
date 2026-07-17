import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { ar } from "@/content/ar";

export type BookingStep = "department" | "doctor" | "datetime";

const ORDER: BookingStep[] = ["department", "doctor", "datetime"];
const LABELS: Record<BookingStep, string> = {
  department: ar.booking.steps.department,
  doctor: ar.booking.steps.doctor,
  datetime: ar.booking.steps.datetime,
};

/** Three-step progress indicator for the booking flow. */
export function BookingStepper({ current }: { current: BookingStep }) {
  const currentIndex = ORDER.indexOf(current);

  return (
    <ol className="flex items-center gap-2" aria-label={ar.booking.title}>
      {ORDER.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold",
                done && "border-teal bg-teal text-paper",
                active && "border-teal bg-mint text-teal",
                !done && !active && "border-line bg-card text-muted-ink",
              )}
              aria-current={active ? "step" : undefined}
            >
              {done ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <span className="font-data">{i + 1}</span>
              )}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                active ? "font-medium text-ink" : "text-muted-ink",
              )}
            >
              {LABELS[step]}
            </span>
            {i < ORDER.length - 1 ? (
              <span
                className={cn(
                  "h-px flex-1",
                  i < currentIndex ? "bg-teal" : "bg-line",
                )}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
