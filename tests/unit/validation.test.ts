import { describe, it, expect } from "vitest";

import { registerSchema } from "@/lib/validation/auth";
import { contactMessageSchema } from "@/lib/validation/contact";
import { computeNextFileNumber } from "@/lib/services/patients";

/** A valid registration payload; individual tests override one field. */
function registration(overrides: Record<string, unknown> = {}) {
  return {
    fullName: "محمد العتيبي",
    email: "m@example.com",
    phone: "0512345678",
    nationalId: "1012345678",
    dateOfBirth: "1994-03-12",
    gender: "MALE",
    password: "Passw0rd!",
    ...overrides,
  };
}

describe("Saudi phone validation", () => {
  it.each(["0512345678", "0500000000", "+966512345678"])(
    "accepts %s",
    (phone) => {
      expect(registerSchema.safeParse(registration({ phone })).success).toBe(true);
    },
  );

  it.each([
    "12345", // too short
    "0412345678", // must start 05
    "512345678", // missing leading 0
    "+9665123456789", // too long
    "05123456789", // one digit too many
    "+96651234567", // too short international
  ])("rejects %s", (phone) => {
    expect(registerSchema.safeParse(registration({ phone })).success).toBe(false);
  });

  it("applies the same rule to the contact form", () => {
    const ok = contactMessageSchema.safeParse({
      fullName: "زائر",
      email: "v@example.com",
      phone: "0512345678",
      subject: "استفسار",
      body: "نص كافٍ الطول للاختبار.",
    });
    expect(ok.success).toBe(true);
    const bad = contactMessageSchema.safeParse({
      fullName: "زائر",
      email: "v@example.com",
      phone: "999",
      subject: "استفسار",
      body: "نص كافٍ الطول للاختبار.",
    });
    expect(bad.success).toBe(false);
  });
});

describe("national ID validation", () => {
  it("accepts a 10-digit id", () => {
    expect(registerSchema.safeParse(registration({ nationalId: "1012345678" })).success).toBe(true);
  });
  it.each(["123", "123456789", "12345678901", "10123abcde"])(
    "rejects %s",
    (nationalId) => {
      expect(registerSchema.safeParse(registration({ nationalId })).success).toBe(false);
    },
  );
});

describe("password strength", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(registerSchema.safeParse(registration({ password: "short" })).success).toBe(false);
  });
  it("accepts 8+ characters", () => {
    expect(registerSchema.safeParse(registration({ password: "12345678" })).success).toBe(true);
  });
});

describe("date of birth", () => {
  it("rejects a future date", () => {
    expect(registerSchema.safeParse(registration({ dateOfBirth: "2999-01-01" })).success).toBe(false);
  });
});

describe("computeNextFileNumber", () => {
  it("starts at NB-0001 when there are no patients", () => {
    expect(computeNextFileNumber(null)).toBe("NB-0001");
  });
  it("increments and zero-pads", () => {
    expect(computeNextFileNumber("NB-0040")).toBe("NB-0041");
    expect(computeNextFileNumber("NB-0009")).toBe("NB-0010");
    expect(computeNextFileNumber("NB-0099")).toBe("NB-0100");
  });
  it("restarts at NB-0001 for a malformed value", () => {
    expect(computeNextFileNumber("garbage")).toBe("NB-0001");
  });
});
