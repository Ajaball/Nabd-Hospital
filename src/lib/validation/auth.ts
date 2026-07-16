import { z } from "zod";
import { ar } from "@/content/ar";

/**
 * Zod schemas for the auth boundary (CLAUDE.md §2.7 — validate every input).
 * The same schemas run on the client (react-hook-form via zodResolver) and on
 * the server (the Credentials provider and the register Route Handler), so a
 * user never sees a client-side pass that the server then rejects with a
 * different message.
 */

const v = ar.validation;

// Saudi mobile: local 05XXXXXXXX or international +9665XXXXXXXX. Landlines and
// other formats are intentionally rejected — patients book with a mobile.
export const SAUDI_PHONE = /^(?:\+9665\d{8}|05\d{8})$/;

// Saudi national ID / Iqama: exactly 10 digits. We validate length and shape
// only (a checksum would reject the fictional seed IDs).
export const NATIONAL_ID = /^\d{10}$/;

// yyyy-mm-dd as produced by <input type="date">.
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isNotFuture(value: string): boolean {
  return new Date(`${value}T00:00:00.000Z`).getTime() <= Date.now();
}

export const loginSchema = z.object({
  email: z.string().trim().min(1, v.required).email(v.email),
  password: z.string().min(1, v.required),
});
export type LoginInput = z.infer<typeof loginSchema>;

// The server-side contract for POST /api/v1/auth/register.
export const registerSchema = z.object({
  fullName: z.string().trim().min(3, v.fullNameMin).max(80, v.fullNameMax),
  email: z.string().trim().toLowerCase().min(1, v.required).email(v.email),
  phone: z.string().trim().regex(SAUDI_PHONE, v.phoneInvalid),
  nationalId: z.string().trim().regex(NATIONAL_ID, v.nationalIdInvalid),
  dateOfBirth: z
    .string()
    .min(1, v.required)
    .refine(isRealIsoDate, v.dobInvalid)
    .refine(isNotFuture, v.dobFuture),
  gender: z.enum(["MALE", "FEMALE"], v.genderRequired),
  password: z.string().min(8, v.passwordMin).max(72, v.passwordMax),
});
export type RegisterInput = z.infer<typeof registerSchema>;

// The client form adds a confirm field and cross-checks it. The API never sees
// confirmPassword — it is a UI concern only.
export const registerFormSchema = registerSchema
  .extend({ confirmPassword: z.string().min(1, v.required) })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: v.passwordMismatch,
  });
export type RegisterFormInput = z.infer<typeof registerFormSchema>;
