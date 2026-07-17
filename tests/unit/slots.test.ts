import { describe, it, expect } from "vitest";
import {
  generateSlots,
  type AvailabilityWindow,
  type Interval,
} from "@/lib/services/slots";

/**
 * Full-branch coverage of the slot engine. All instants are UTC; the fixture
 * date is chosen and its weekday derived so the tests don't hard-code a day
 * number. Riyadh is UTC+3 with no DST, so 09:00 Riyadh is always 06:00 UTC —
 * the DST-free invariant the gate calls for.
 */

const DATE = "2026-07-19"; // a Sunday
const WEEKDAY = new Date(Date.UTC(2026, 6, 19)).getUTCDay();

function window(overrides: Partial<AvailabilityWindow> = {}): AvailabilityWindow {
  return {
    dayOfWeek: WEEKDAY,
    startTime: "09:00",
    endTime: "11:00",
    slotMinutes: 30,
    ...overrides,
  };
}

// A "now" far enough before the day that the 2h cutoff never trips.
const EARLY_NOW = new Date("2026-07-19T00:00:00.000Z");

function iso(slotStart: Date) {
  return slotStart.toISOString();
}

describe("generateSlots — expansion & Riyadh→UTC (DST-free)", () => {
  it("expands a 09:00–11:00 window into four 30-min slots at the right UTC instants", () => {
    const slots = generateSlots({
      availability: [window()],
      timeOff: [],
      existingAppointments: [],
      date: DATE,
      now: EARLY_NOW,
    });

    expect(slots).toHaveLength(4);
    expect(slots.map((s) => iso(s.startsAt))).toEqual([
      "2026-07-19T06:00:00.000Z", // 09:00 Riyadh
      "2026-07-19T06:30:00.000Z", // 09:30
      "2026-07-19T07:00:00.000Z", // 10:00
      "2026-07-19T07:30:00.000Z", // 10:30
    ]);
    expect(slots.every((s) => s.isAvailable)).toBe(true);
    // Each slot is exactly 30 minutes.
    for (const s of slots) {
      expect(s.endsAt.getTime() - s.startsAt.getTime()).toBe(30 * 60000);
    }
  });

  it("excludes a trailing partial slot that would run past the window end", () => {
    // 09:00–10:15 with 30-min slots → 09:00 and 09:30 only (10:00→10:30 overflows).
    const slots = generateSlots({
      availability: [window({ endTime: "10:15" })],
      timeOff: [],
      existingAppointments: [],
      date: DATE,
      now: EARLY_NOW,
    });
    expect(slots.map((s) => iso(s.startsAt))).toEqual([
      "2026-07-19T06:00:00.000Z",
      "2026-07-19T06:30:00.000Z",
    ]);
  });

  it("returns nothing when no availability matches the weekday", () => {
    const slots = generateSlots({
      availability: [window({ dayOfWeek: (WEEKDAY + 1) % 7 })],
      timeOff: [],
      existingAppointments: [],
      date: DATE,
      now: EARLY_NOW,
    });
    expect(slots).toHaveLength(0);
  });
});

describe("generateSlots — 2-hour cutoff", () => {
  it("marks slots less than 2h from now as too_soon, and keeps later ones", () => {
    // now = 05:00 UTC (08:00 Riyadh). Cutoff = 07:00 UTC.
    // 06:00 and 06:30 UTC slots are < 2h away → too_soon; 07:00, 07:30 → available.
    const now = new Date("2026-07-19T05:00:00.000Z");
    const slots = generateSlots({
      availability: [window()],
      timeOff: [],
      existingAppointments: [],
      date: DATE,
      now,
    });

    const byIso = Object.fromEntries(slots.map((s) => [iso(s.startsAt), s]));
    expect(byIso["2026-07-19T06:00:00.000Z"].isAvailable).toBe(false);
    expect(byIso["2026-07-19T06:00:00.000Z"].reason).toBe("too_soon");
    expect(byIso["2026-07-19T06:30:00.000Z"].reason).toBe("too_soon");
    expect(byIso["2026-07-19T07:00:00.000Z"].isAvailable).toBe(true);
    expect(byIso["2026-07-19T07:30:00.000Z"].isAvailable).toBe(true);
  });

  it("marks fully-past slots as past", () => {
    // now = 09:00 UTC → every slot (all before 07:30 UTC end) is past.
    const now = new Date("2026-07-19T09:00:00.000Z");
    const slots = generateSlots({
      availability: [window()],
      timeOff: [],
      existingAppointments: [],
      date: DATE,
      now,
    });
    expect(slots.every((s) => s.reason === "past")).toBe(true);
    expect(slots.every((s) => !s.isAvailable)).toBe(true);
  });
});

describe("generateSlots — time-off overlap", () => {
  it("removes slots overlapping a time-off block", () => {
    // Time off 09:15–09:45 Riyadh (06:15–06:45 UTC) overlaps the 09:00 and 09:30 slots.
    const timeOff: Interval[] = [
      {
        startsAt: new Date("2026-07-19T06:15:00.000Z"),
        endsAt: new Date("2026-07-19T06:45:00.000Z"),
      },
    ];
    const slots = generateSlots({
      availability: [window()],
      timeOff,
      existingAppointments: [],
      date: DATE,
      now: EARLY_NOW,
    });
    const byIso = Object.fromEntries(slots.map((s) => [iso(s.startsAt), s]));
    expect(byIso["2026-07-19T06:00:00.000Z"].reason).toBe("timeoff");
    expect(byIso["2026-07-19T06:30:00.000Z"].reason).toBe("timeoff");
    expect(byIso["2026-07-19T07:00:00.000Z"].isAvailable).toBe(true);
  });

  it("does not remove a slot that merely abuts time-off (half-open)", () => {
    // Time off exactly 07:00–07:30 UTC touches the 06:30 slot's end but must not
    // remove it (half-open intervals).
    const timeOff: Interval[] = [
      {
        startsAt: new Date("2026-07-19T07:00:00.000Z"),
        endsAt: new Date("2026-07-19T07:30:00.000Z"),
      },
    ];
    const slots = generateSlots({
      availability: [window()],
      timeOff,
      existingAppointments: [],
      date: DATE,
      now: EARLY_NOW,
    });
    const byIso = Object.fromEntries(slots.map((s) => [iso(s.startsAt), s]));
    expect(byIso["2026-07-19T06:30:00.000Z"].isAvailable).toBe(true);
    expect(byIso["2026-07-19T07:00:00.000Z"].reason).toBe("timeoff");
  });
});

describe("generateSlots — booked appointments", () => {
  it("marks slots taken by an active appointment as booked", () => {
    const existingAppointments: Interval[] = [
      {
        startsAt: new Date("2026-07-19T06:30:00.000Z"),
        endsAt: new Date("2026-07-19T07:00:00.000Z"),
      },
    ];
    const slots = generateSlots({
      availability: [window()],
      timeOff: [],
      existingAppointments,
      date: DATE,
      now: EARLY_NOW,
    });
    const byIso = Object.fromEntries(slots.map((s) => [iso(s.startsAt), s]));
    expect(byIso["2026-07-19T06:30:00.000Z"].reason).toBe("booked");
    expect(byIso["2026-07-19T06:00:00.000Z"].isAvailable).toBe(true);
  });
});

describe("generateSlots — combined windows", () => {
  it("merges morning and evening windows, sorted by start", () => {
    const slots = generateSlots({
      availability: [
        window({ startTime: "09:00", endTime: "10:00" }),
        window({ startTime: "16:00", endTime: "17:00" }),
      ],
      timeOff: [],
      existingAppointments: [],
      date: DATE,
      now: EARLY_NOW,
    });
    expect(slots.map((s) => iso(s.startsAt))).toEqual([
      "2026-07-19T06:00:00.000Z",
      "2026-07-19T06:30:00.000Z",
      "2026-07-19T13:00:00.000Z",
      "2026-07-19T13:30:00.000Z",
    ]);
  });
});
