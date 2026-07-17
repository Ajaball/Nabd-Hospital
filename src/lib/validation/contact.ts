import { z } from "zod";
import { ar } from "@/content/ar";

/**
 * Contact-message boundary schema (CLAUDE.md §2.7). Shared by the client form
 * and POST /api/v1/contact-messages. Includes a honeypot field (`website`) that
 * real users never see; if a bot fills it, the server drops the submission.
 */

const v = ar.contact.validation;
const SAUDI_PHONE = /^(?:\+9665\d{8}|05\d{8})$/;

export const contactSchema = z.object({
  fullName: z
    .string({ message: v.fullNameRequired })
    .trim()
    .min(1, { message: v.fullNameRequired }),
  email: z
    .string({ message: v.emailInvalid })
    .trim()
    .min(1, { message: v.emailInvalid })
    .pipe(z.email({ message: v.emailInvalid }))
    .transform((s) => s.toLowerCase()),
  phone: z
    .string({ message: v.phoneInvalid })
    .trim()
    .min(1, { message: v.phoneInvalid })
    .regex(SAUDI_PHONE, { message: v.phoneInvalid }),
  subject: z
    .string({ message: v.subjectRequired })
    .trim()
    .min(1, { message: v.subjectRequired }),
  body: z
    .string({ message: v.bodyRequired })
    .trim()
    .min(1, { message: v.bodyRequired })
    .min(10, { message: v.bodyTooShort }),
  // Honeypot: must stay empty. Optional so real submissions (no field) pass.
  website: z.string().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export type ContactFormValues = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
  website?: string;
};
