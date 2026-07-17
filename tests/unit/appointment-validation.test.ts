import { describe, it, expect } from "vitest";
import {
  dateParamSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
} from "@/lib/validation/appointment";

/**
 * Boundary rules for the appointment endpoints: the date param must be a real
 * calendar date (not just the right shape), and the transition/booking bodies
 * must be well-formed.
 */

describe("dateParamSchema", () => {
  it("accepts a real date", () => {
    expect(dateParamSchema.safeParse("2026-07-19").success).toBe(true);
  });

  it.each(["2026-13-01", "2026-02-30", "2026-00-10", "20260719", "2026-7-9", "bad"])(
    "rejects malformed or impossible date %s",
    (value) => {
      expect(dateParamSchema.safeParse(value).success).toBe(false);
    },
  );
});

describe("createAppointmentSchema", () => {
  it("accepts a valid booking body", () => {
    const r = createAppointmentSchema.safeParse({
      doctorId: "doc_1",
      startsAt: "2026-07-19T06:00:00.000Z",
      reasonAr: "متابعة",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a non-ISO startsAt", () => {
    expect(
      createAppointmentSchema.safeParse({ doctorId: "d", startsAt: "not-a-date" }).success,
    ).toBe(false);
  });
});

describe("updateAppointmentSchema", () => {
  it.each(["cancel", "confirm", "complete", "no_show"])("accepts action %s", (action) => {
    expect(updateAppointmentSchema.safeParse({ action }).success).toBe(true);
  });

  it("rejects an unknown action", () => {
    expect(updateAppointmentSchema.safeParse({ action: "delete" }).success).toBe(false);
  });
});
