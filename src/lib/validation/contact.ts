/**
 * Zod schema for the public contact form (CLAUDE.md §2.7 — Zod at every
 * boundary). Shared by react-hook-form on the client and the Route Handler on
 * the server, so validation is identical in both places. Every message comes
 * from src/content/ar.ts (CLAUDE.md §2.2).
 */
import { z } from "zod";
import { ar } from "@/content/ar";

// Saudi mobile: local 05XXXXXXXX or international +9665XXXXXXXX.
const SAUDI_PHONE = /^(?:\+9665\d{8}|05\d{8})$/;

const e = ar.contact.errors;

export const contactMessageSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, { message: e.fullNameShort })
    .max(100, { message: e.fullNameLong }),
  email: z.string().trim().email({ message: e.email }),
  phone: z
    .string()
    .trim()
    .regex(SAUDI_PHONE, { message: e.phone }),
  subject: z
    .string()
    .trim()
    .min(3, { message: e.subjectShort })
    .max(150, { message: e.subjectLong }),
  body: z
    .string()
    .trim()
    .min(10, { message: e.bodyShort })
    .max(2000, { message: e.bodyLong }),
  // Honeypot: a field hidden from real users. Bots fill it; humans leave it
  // empty. It always passes validation so the Route Handler can silently accept
  // and discard a filled submission rather than signalling rejection to a bot.
  website: z.string().optional(),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
