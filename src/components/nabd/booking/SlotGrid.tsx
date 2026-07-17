"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/datetime";
import { ar } from "@/content/ar";
import type { SlotReason } from "@/lib/services/slots";

export type SlotView = {
  startsAt: string; // ISO
  endsAt: string;
  isAvailable: boolean;
  reason: SlotReason | null;
};

/**
 * The slot grid. Taken/past slots are shown disabled with their reason
 * (PHASES §4: disabled, not hidden), and announce their state to assistive tech.
 */
export function SlotGrid({
  slots,
  selected,
  onSelect,
}: {
  slots: SlotView[];
  selected: string | null;
  onSelect: (iso: string) => void;
}) {
  return (
    <div
      role="listbox"
      aria-label={ar.booking.chooseSlot}
      className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4"
    >
      {slots.map((slot) => {
        const time = formatTime(new Date(slot.startsAt));
        const isSelected = selected === slot.startsAt;
        const reasonLabel = slot.reason ? ar.booking.slotReason[slot.reason] : null;

        return (
          <button
            key={slot.startsAt}
            type="button"
            role="option"
            aria-selected={isSelected}
            disabled={!slot.isAvailable}
            onClick={() => onSelect(slot.startsAt)}
            aria-label={
              slot.isAvailable ? time : `${time} — ${reasonLabel ?? ""}`.trim()
            }
            className={cn(
              "flex flex-col items-center rounded-sm border px-2 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
              slot.isAvailable
                ? isSelected
                  ? "border-teal bg-teal text-paper"
                  : "border-line bg-card text-ink hover:border-teal hover:bg-mint"
                : "cursor-not-allowed border-line bg-mint/30 text-muted-ink/70",
            )}
          >
            <span className="font-data tabular-nums">{time}</span>
            {!slot.isAvailable && reasonLabel ? (
              <span className="mt-0.5 text-[10px]">{reasonLabel}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
