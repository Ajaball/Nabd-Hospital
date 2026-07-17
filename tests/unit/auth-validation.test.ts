import { describe, it, expect } from "vitest";
import {
  loginSchema,
  registerSchema,
  registerFormSchema,
  SAUDI_PHONE,
  NATIONAL_ID,
} from "@/lib/validation/auth";

const validRegistration = {
  fullName: "سارة العتيبي",
  email: "sara@example.com",
  phone: "0512345678",
  nationalId: "1234567890",
  dateOfBirth: "1995-05-20",
  gender: "FEMALE" as const,
  password: "Sara@12345",
};

describe("Saudi phone rule", () => {
  it("accepts local 05XXXXXXXX and international +9665XXXXXXXX", () => {
    expect(SAUDI_PHONE.test("0512345678")).toBe(true);
    expect(SAUDI_PHONE.test("+966512345678")).toBe(true);
  });

  it("rejects wrong prefixes, lengths, and non-mobile numbers", () => {
    expect(SAUDI_PHONE.test("0412345678")).toBe(false); // not a mobile prefix
    expect(SAUDI_PHONE.test("051234567")).toBe(false); // too short
    expect(SAUDI_PHONE.test("05123456789")).toBe(false); // too long
    expect(SAUDI_PHONE.test("+9660512345678")).toBe(false); // malformed intl
    expect(SAUDI_PHONE.test("966512345678")).toBe(false); // missing +
  });
});

describe("national ID rule", () => {
  it("accepts exactly ten digits", () => {
    expect(NATIONAL_ID.test("1234567890")).toBe(true);
  });

  it("rejects wrong lengths and non-digits", () => {
    expect(NATIONAL_ID.test("123456789")).toBe(false); // 9 digits
    expect(NATIONAL_ID.test("12345678901")).toBe(false); // 11 digits
    expect(NATIONAL_ID.test("123456789a")).toBe(false); // contains a letter
  });
});

describe("loginSchema", () => {
  it("requires a valid email and a non-empty password", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(
      true,
    );
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(
      false,
    );
  });
});

describe("registerSchema", () => {
  it("accepts a well-formed registration", () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  it("lowercases and trims the email", () => {
    const parsed = registerSchema.parse({
      ...validRegistration,
      email: "  Sara@Example.COM ",
    });
    expect(parsed.email).toBe("sara@example.com");
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ ...validRegistration, password: "short7!" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid Saudi phone", () => {
    const result = registerSchema.safeParse({ ...validRegistration, phone: "0412345678" });
    expect(result.success).toBe(false);
  });

  it("rejects a national ID that is not ten digits", () => {
    const result = registerSchema.safeParse({ ...validRegistration, nationalId: "123" });
    expect(result.success).toBe(false);
  });

  it("rejects a future date of birth", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      dateOfBirth: "2999-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an impossible calendar date", () => {
    const result = registerSchema.safeParse({
      ...validRegistration,
      dateOfBirth: "1995-02-30",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerFormSchema", () => {
  it("requires the two passwords to match", () => {
    const ok = registerFormSchema.safeParse({
      ...validRegistration,
      confirmPassword: validRegistration.password,
    });
    expect(ok.success).toBe(true);

    const mismatch = registerFormSchema.safeParse({
      ...validRegistration,
      confirmPassword: "different",
    });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(mismatch.error.issues.some((i) => i.path.includes("confirmPassword"))).toBe(
        true,
      );
    }
  });
});
