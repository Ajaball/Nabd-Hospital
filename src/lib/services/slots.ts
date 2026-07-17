/**
 * Slot generation (CLAUDE.md §Phase 4) — the technical core of the project.
 *
 * Pure and DB-free: it takes plain data and returns the day's slots, so it is
 * exhaustively unit-testable with no database. All arithmetic is in UTC; only
 * the caller's formatting layer converts to Asia/Riyadh. Riyadh is UTC+3 with
 * no DST, so a wall-clock "HH:mm" on a given calendar date maps to a fixed UTC
 * instant via Date.UTC(y, m, d, hour - 3, minute).
 *
 * Rules:
 *  - Expand the weekly Availability windows for the date's weekday into
 *    slotMinutes intervals.
 *  - Mark a slot unavailable if it starts less than 2 hours from `now`,
 *    overlaps an active (PENDING/CONFIRMED) appointment, or overlaps a TimeOff.
 */

const RIYADH_OFFSET_HOURS = 3;
const MINUTES_MS = 60_000;
const BOOKING_CUTOFF_MS = 2 * 60 * MINUTES_MS;

export type SlotReason = "cutoff" | "booked" | "timeoff";

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

export type ExistingAppointment = Interval & { status: string };

export type GenerateSlotsInput = {
  availability: AvailabilityWindow[];
  timeOff: Interval[];
  existingAppointments: ExistingAppointment[];
  /** Target calendar date in Riyadh, "YYYY-MM-DD". */
  date: string;
  /** The current instant. */
  now: Date;
};

function parseHm(value: string): [number, number] {
  const [h, m] = value.split(":").map(Number);
  return [h, m];
}

/** A Riyadh wall-clock time on calendar date (y, monthIndex, d) as a UTC ms. */
function riyadhToUtcMs(
  y: number,
  monthIndex: number,
  d: number,
  hour: number,
  minute: number,
): number {
  return Date.UTC(y, monthIndex, d, hour - RIYADH_OFFSET_HOURS, minute);
}

function overlaps(a: Interval, bStart: number, bEnd: number): boolean {
  return a.startsAt.getTime() < bEnd && a.endsAt.getTime() > bStart;
}

export function generateSlots({
  availability,
  timeOff,
  existingAppointments,
  date,
  now,
}: GenerateSlotsInput): Slot[] {
  const [y, month, d] = date.split("-").map(Number);
  const monthIndex = month - 1;
  // Weekday of the calendar date (timezone-independent for a bare Y-M-D).
  const weekday = new Date(Date.UTC(y, monthIndex, d)).getUTCDay();

  const windows = availability.filter((w) => w.dayOfWeek === weekday);
  const activeAppointments = existingAppointments.filter(
    (a) => a.status === "PENDING" || a.status === "CONFIRMED",
  );
  const nowMs = now.getTime();

  const slots: Slot[] = [];
  const seen = new Set<number>();

  for (const window of windows) {
    const [sh, sm] = parseHm(window.startTime);
    const [eh, em] = parseHm(window.endTime);
    const windowStart = riyadhToUtcMs(y, monthIndex, d, sh, sm);
    const windowEnd = riyadhToUtcMs(y, monthIndex, d, eh, em);
    const step = window.slotMinutes * MINUTES_MS;
    if (step <= 0) continue;

    for (let t = windowStart; t + step <= windowEnd; t += step) {
      if (seen.has(t)) continue; // guard against overlapping windows
      seen.add(t);

      const start = t;
      const end = t + step;
      let reason: SlotReason | undefined;

      if (start - nowMs < BOOKING_CUTOFF_MS) {
        reason = "cutoff";
      } else if (activeAppointments.some((a) => overlaps(a, start, end))) {
        reason = "booked";
      } else if (timeOff.some((o) => overlaps(o, start, end))) {
        reason = "timeoff";
      }

      slots.push({
        startsAt: new Date(start),
        endsAt: new Date(end),
        isAvailable: reason === undefined,
        reason,
      });
    }
  }

  slots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  return slots;
}
