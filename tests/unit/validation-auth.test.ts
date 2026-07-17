import { describe, it, expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  normalizeSaudiPhone,
} from "@/lib/validation/auth";

/**
 * Covers the Saudi-specific registration rules (CLAUDE.md §2.7 / Phase 2 gate):
 * password strength, Saudi phone shapes, national-ID length, and the field
 * transforms (email lowercasing, phone normalization to E.164).
 */

const base = {
  fullName: "سعد المطيري",
  email: "Saad@Example.com",
  password: "Str0ngPass",
  phone: "0501234567",
  nationalId: "1012345678",
  dateOfBirth: "1990-05-01",
  gender: "MALE" as const,
};

describe("registerSchema — password", () => {
  it("rejects a password shorter than 8 characters", () => {
    const r = registerSchema.safeParse({ ...base, password: "Ab1" });
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path[0] === "password")).toBe(true);
    }
  });

  it("accepts an 8-character password", () => {
    const r = registerSchema.safeParse({ ...base, password: "abcd1234" });
    expect(r.success).toBe(true);
  });
});

describe("registerSchema — Saudi phone", () => {
  it("accepts the local 05XXXXXXXX form and normalizes to +9665…", () => {
    const r = registerSchema.safeParse({ ...base, phone: "0512345678" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe("+966512345678");
  });

  it("accepts the E.164 +9665XXXXXXXX form unchanged", () => {
    const r = registerSchema.safeParse({ ...base, phone: "+966512345678" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.phone).toBe("+966512345678");
  });

  it.each([
    "012345678", // doesn't start with 05
    "0601234567", // subscriber part must start with 5
    "05123456", // too short
    "+96650123456", // too short
    "+9665123456789", // too long
    "0501234567 ext", // trailing junk
  ])("rejects invalid phone %s", (phone) => {
    expect(registerSchema.safeParse({ ...base, phone }).success).toBe(false);
  });
});

describe("registerSchema — national ID", () => {
  it("accepts exactly 10 digits", () => {
    expect(
      registerSchema.safeParse({ ...base, nationalId: "2233445566" }).success,
    ).toBe(true);
  });

  it.each(["123456789", "12345678901", "12345abcde", ""])(
    "rejects national ID %s",
    (nationalId) => {
      expect(
        registerSchema.safeParse({ ...base, nationalId }).success,
      ).toBe(false);
    },
  );
});

describe("registerSchema — email + date + gender", () => {
  it("lowercases the email", () => {
    const r = registerSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("saad@example.com");
  });

  it("rejects a malformed email", () => {
    expect(registerSchema.safeParse({ ...base, email: "not-an-email" }).success).toBe(
      false,
    );
  });

  it("rejects a future date of birth", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    expect(
      registerSchema.safeParse({ ...base, dateOfBirth: future }).success,
    ).toBe(false);
  });

  it("rejects an out-of-range gender", () => {
    expect(
      registerSchema.safeParse({ ...base, gender: "OTHER" }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts any non-empty password (no length policy leak)", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "x" });
    expect(r.success).toBe(true);
  });

  it("rejects an empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(
      false,
    );
  });
});

describe("normalizeSaudiPhone", () => {
  it("converts 05… to +9665…", () => {
    expect(normalizeSaudiPhone("0501234567")).toBe("+966501234567");
  });
  it("leaves +9665… untouched", () => {
    expect(normalizeSaudiPhone("+966501234567")).toBe("+966501234567");
  });
});
