import { describe, it, expect } from "vitest";
import { generateSlots, type AvailabilityWindow } from "@/lib/services/slots";

/**
 * Coverage for the slot generator (CLAUDE.md §Phase 4 gate): the DST-free
 * Riyadh mapping, the 2-hour cutoff, a time-off overlap, active-booking
 * subtraction, and the weekday filter.
 *
 * 2026-07-19 is a Sunday (weekday 0). A far-past `now` keeps the cutoff out of
 * the way unless a test sets it deliberately.
 */
const SUNDAY = "2026-07-19";
const FAR_PAST = new Date("2000-01-01T00:00:00.000Z");

const sundayMorning: AvailabilityWindow = {
  dayOfWeek: 0,
  startTime: "08:00",
  endTime: "14:00",
  slotMinutes: 30,
};

function base() {
  return {
    availability: [sundayMorning],
    timeOff: [],
    existingAppointments: [],
    date: SUNDAY,
    now: FAR_PAST,
  };
}

describe("generateSlots", () => {
  it("expands a 08:00–14:00 window into twelve 30-minute slots", () => {
    const slots = generateSlots(base());
    expect(slots).toHaveLength(12);
    expect(slots.every((s) => s.isAvailable)).toBe(true);
  });

  it("maps 08:00 Riyadh to 05:00 UTC (UTC+3, no DST)", () => {
    const [first] = generateSlots(base());
    expect(first.startsAt.toISOString()).toBe("2026-07-19T05:00:00.000Z");
    expect(first.endsAt.toISOString()).toBe("2026-07-19T05:30:00.000Z");
    // Last slot starts 13:30 Riyadh = 10:30 UTC, ends 14:00 Riyadh = 11:00 UTC.
    const last = generateSlots(base()).at(-1);
    expect(last?.startsAt.toISOString()).toBe("2026-07-19T10:30:00.000Z");
    expect(last?.endsAt.toISOString()).toBe("2026-07-19T11:00:00.000Z");
  });

  it("returns no slots for a weekday the doctor does not work", () => {
    // 2026-07-18 is a Saturday (weekday 6); the window is for Sunday only.
    const slots = generateSlots({ ...base(), date: "2026-07-18" });
    expect(slots).toHaveLength(0);
  });

  it("marks slots less than 2 hours from now as unavailable (cutoff)", () => {
    // now = 08:15 Riyadh (05:15 UTC). Slots before 10:15 Riyadh are within the
    // 2h window; the 08:00, 08:30, 09:00, 09:30, 10:00 slots are cut off.
    const now = new Date("2026-07-19T05:15:00.000Z");
    const slots = generateSlots({ ...base(), now });
    const cut = slots.filter((s) => s.reason === "cutoff");
    expect(cut).toHaveLength(5);
    // The 10:30 Riyadh (07:30 UTC) slot is exactly 2h15m out — available.
    const tenThirty = slots.find(
      (s) => s.startsAt.toISOString() === "2026-07-19T07:30:00.000Z",
    );
    expect(tenThirty?.isAvailable).toBe(true);
  });

  it("subtracts an active booking but not a cancelled one", () => {
    const bookedStart = new Date("2026-07-19T06:00:00.000Z"); // 09:00 Riyadh
    const slots = generateSlots({
      ...base(),
      existingAppointments: [
        {
          startsAt: bookedStart,
          endsAt: new Date(bookedStart.getTime() + 30 * 60_000),
          status: "CONFIRMED",
        },
        // A cancelled appointment at 09:30 must NOT block its slot.
        {
          startsAt: new Date("2026-07-19T06:30:00.000Z"),
          endsAt: new Date("2026-07-19T07:00:00.000Z"),
          status: "CANCELLED",
        },
      ],
    });
    const nine = slots.find(
      (s) => s.startsAt.toISOString() === "2026-07-19T06:00:00.000Z",
    );
    const nineThirty = slots.find(
      (s) => s.startsAt.toISOString() === "2026-07-19T06:30:00.000Z",
    );
    expect(nine?.isAvailable).toBe(false);
    expect(nine?.reason).toBe("booked");
    expect(nineThirty?.isAvailable).toBe(true);
  });

  it("removes slots overlapping a time-off block", () => {
    // Time off 09:00–10:00 Riyadh (06:00–07:00 UTC) blocks the 09:00 & 09:30 slots.
    const slots = generateSlots({
      ...base(),
      timeOff: [
        {
          startsAt: new Date("2026-07-19T06:00:00.000Z"),
          endsAt: new Date("2026-07-19T07:00:00.000Z"),
        },
      ],
    });
    const blocked = slots.filter((s) => s.reason === "timeoff");
    expect(blocked).toHaveLength(2);
    expect(blocked.map((s) => s.startsAt.toISOString())).toEqual([
      "2026-07-19T06:00:00.000Z",
      "2026-07-19T06:30:00.000Z",
    ]);
  });
});
