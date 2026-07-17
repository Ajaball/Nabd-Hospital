/**
 * Zod schemas for authentication (CLAUDE.md §2.7). Shared by react-hook-form on
 * the client and the Route Handlers / Credentials authorize on the server, so
 * the rules are identical everywhere. Messages come from src/content/ar.ts.
 */
import { z } from "zod";
import { Gender } from "@prisma/client";
import { ar } from "@/content/ar";

const e = ar.auth.errors;

// Saudi mobile: local 05XXXXXXXX or international +9665XXXXXXXX.
const SAUDI_PHONE = /^(?:\+9665\d{8}|05\d{8})$/;
// Saudi national ID / iqama: exactly 10 digits.
const NATIONAL_ID = /^\d{10}$/;

export const loginSchema = z.object({
  email: z.string().trim().email({ message: e.email }),
  password: z.string().min(1, { message: e.credentials }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: e.fullNameShort })
    .max(100, { message: e.fullNameLong }),
  email: z.string().trim().email({ message: e.email }),
  phone: z.string().trim().regex(SAUDI_PHONE, { message: e.phone }),
  nationalId: z.string().trim().regex(NATIONAL_ID, { message: e.nationalId }),
  dateOfBirth: z
    .string()
    .min(1, { message: e.dateOfBirth })
    // HTML date input gives YYYY-MM-DD; ensure it parses and is in the past.
    .refine((v) => !Number.isNaN(Date.parse(v)), { message: e.dateOfBirth })
    .refine((v) => new Date(v) < new Date(), { message: e.dateOfBirthFuture }),
  gender: z.nativeEnum(Gender, { message: e.gender }),
  password: z.string().min(8, { message: e.password }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
