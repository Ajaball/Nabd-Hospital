import { riyadhWallTimeToUtc } from "@/lib/datetime";

/**
 * Slot generation — the technical core of the project (Phase 4).
 *
 * PURE: no database, no `now = new Date()` inside. Everything is passed in, so
 * the function is fully unit-testable and deterministic. All arithmetic is on
 * UTC instants (epoch millis); the only timezone touch is converting a doctor's
 * Riyadh wall-clock working hours into the stored UTC instant, which is a
 * conversion, not formatting.
 *
 * Rules (CLAUDE.md / PHASES Phase 4):
 *   1. Expand the weekly Availability windows for the target weekday into
 *      fixed slotMinutes intervals.
 *   2. Remove slots that overlap a TimeOff block.
 *   3. Remove slots already taken by an active (PENDING/CONFIRMED) appointment.
 *   4. Mark slots less than 2 hours from `now` unavailable.
 * A removed slot is still returned, but with isAvailable=false and a reason, so
 * the UI can show it disabled rather than hiding it (PHASES Phase 4).
 */

export const BOOKING_CUTOFF_MS = 2 * 60 * 60 * 1000; // 2 hours

export type SlotReason = "past" | "too_soon" | "timeoff" | "booked";

export type Slot = {
  startsAt: Date;
  endsAt: Date;
  isAvailable: boolean;
  reason?: SlotReason;
};

export type AvailabilityWindow = {
  dayOfWeek: number; // 0 = Sunday .. 6 = Saturday
  startTime: string; // "HH:mm" Riyadh wall-clock
  endTime: string; // "HH:mm" Riyadh wall-clock
  slotMinutes: number;
};

export type Interval = { startsAt: Date; endsAt: Date };

export type GenerateSlotsInput = {
  availability: AvailabilityWindow[];
  timeOff: Interval[];
  /** Only active (PENDING/CONFIRMED) appointments should be passed in. */
  existingAppointments: Interval[];
  /** Target calendar date in Riyadh, "YYYY-MM-DD". */
  date: string;
  /** Reference instant ("now") in UTC. Injected for testability. */
  now: Date;
  cutoffMs?: number;
};

function parseHHmm(value: string): number {
  const [h, m] = value.split(":").map((n) => Number.parseInt(n, 10));
  return h * 60 + m;
}

function toHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Half-open overlap: [aStart, aEnd) intersects [bStart, bEnd). */
function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function generateSlots({
  availability,
  timeOff,
  existingAppointments,
  date,
  now,
  cutoffMs = BOOKING_CUTOFF_MS,
}: GenerateSlotsInput): Slot[] {
  // Weekday of the target calendar date. A date has exactly one weekday, so we
  // read it from a UTC-midnight anchor — no timezone ambiguity for the day name.
  const [y, mo, d] = date.split("-").map((n) => Number.parseInt(n, 10));
  const weekday = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();

  const nowMs = now.getTime();
  const cutoffThreshold = nowMs + cutoffMs;

  const slots: Slot[] = [];

  for (const window of availability) {
    if (window.dayOfWeek !== weekday) continue;
    if (window.slotMinutes <= 0) continue;

    const startMin = parseHHmm(window.startTime);
    const endMin = parseHHmm(window.endTime);

    for (let m = startMin; m + window.slotMinutes <= endMin; m += window.slotMinutes) {
      const startsAt = riyadhWallTimeToUtc(date, toHHmm(m));
      const endsAt = new Date(startsAt.getTime() + window.slotMinutes * 60000);
      const s = startsAt.getTime();
      const e = endsAt.getTime();

      let reason: SlotReason | undefined;

      if (e <= nowMs) {
        reason = "past";
      } else if (timeOff.some((t) => overlaps(s, e, t.startsAt.getTime(), t.endsAt.getTime()))) {
        reason = "timeoff";
      } else if (
        existingAppointments.some((a) =>
          overlaps(s, e, a.startsAt.getTime(), a.endsAt.getTime()),
        )
      ) {
        reason = "booked";
      } else if (s < cutoffThreshold) {
        reason = "too_soon";
      }

      slots.push({ startsAt, endsAt, isAvailable: reason === undefined, reason });
    }
  }

  slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return slots;
}
