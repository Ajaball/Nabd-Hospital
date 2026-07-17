import { z } from "zod";
import { ar } from "@/content/ar";

/**
 * Zod schemas for the auth boundary (CLAUDE.md §2.7 — validate every request).
 * These are the single source of truth for both the client forms
 * (react-hook-form via zodResolver) and the server Route Handlers. Never trust
 * a request body: the server re-parses with the exact same schema.
 *
 * All human-readable messages come from src/content/ar.ts (CLAUDE.md §2.2).
 */

const v = ar.auth.validation;

// A Saudi mobile number in one of the two accepted shapes:
//   05XXXXXXXX      (local)      — e.g. 0501234567
//   +9665XXXXXXXX   (E.164)      — e.g. +966501234567
// The subscriber part always starts with 5 and is 9 digits long.
const SAUDI_PHONE = /^(?:\+9665\d{8}|05\d{8})$/;

// Saudi national / iqama IDs are exactly 10 digits.
const NATIONAL_ID = /^\d{10}$/;

/** Normalize an accepted Saudi phone to canonical E.164 (+9665XXXXXXXX). */
export function normalizeSaudiPhone(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("05")) {
    return `+966${trimmed.slice(1)}`;
  }
  return trimmed;
}

export const emailField = z
  .string({ message: v.emailRequired })
  .trim()
  .min(1, { message: v.emailRequired })
  .pipe(z.email({ message: v.emailInvalid }))
  .transform((s) => s.toLowerCase());

export const passwordField = z
  .string({ message: v.passwordRequired })
  .min(1, { message: v.passwordRequired })
  .min(8, { message: v.passwordTooShort });

export const loginSchema = z.object({
  email: emailField,
  // On login we only require a non-empty password; length rules apply at
  // registration, and echoing them here would leak the policy to attackers.
  password: z
    .string({ message: v.passwordRequired })
    .min(1, { message: v.passwordRequired }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z
    .string({ message: v.fullNameRequired })
    .trim()
    .min(1, { message: v.fullNameRequired })
    .min(3, { message: v.fullNameTooShort }),
  email: emailField,
  password: passwordField,
  phone: z
    .string({ message: v.phoneRequired })
    .trim()
    .min(1, { message: v.phoneRequired })
    .regex(SAUDI_PHONE, { message: v.phoneInvalid })
    .transform(normalizeSaudiPhone),
  nationalId: z
    .string({ message: v.nationalIdRequired })
    .trim()
    .min(1, { message: v.nationalIdRequired })
    .regex(NATIONAL_ID, { message: v.nationalIdInvalid }),
  dateOfBirth: z
    .string({ message: v.dateOfBirthRequired })
    .min(1, { message: v.dateOfBirthRequired })
    .refine((s) => !Number.isNaN(Date.parse(s)), { message: v.dateOfBirthInvalid })
    .refine((s) => Date.parse(s) <= Date.now(), { message: v.dateOfBirthFuture }),
  // Modeled as string → enum so the form can bind an empty default value; the
  // empty string is rejected by min(1) with the "choose a gender" message.
  gender: z
    .string({ message: v.genderRequired })
    .min(1, { message: v.genderRequired })
    .pipe(z.enum(["MALE", "FEMALE"], { message: v.genderRequired })),
});

// Output (post-transform): normalized phone, lowercased email, gender enum.
export type RegisterInput = z.infer<typeof registerSchema>;

// Input (what react-hook-form binds to): every field a plain string, so an
// empty gender default type-checks.
export type RegisterFormValues = z.input<typeof registerSchema>;
