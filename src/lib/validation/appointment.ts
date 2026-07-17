import { z } from "zod";

/**
 * Appointment boundary schemas (CLAUDE.md §2.7). The dedicated messages here
 * are developer-facing (the client never shows raw slot errors — it maps codes
 * to ar.ts), so plain English is fine for these few.
 */

export const dateParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD");

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  // ISO-8601 instant of the slot start, e.g. "2026-07-19T06:00:00.000Z".
  startsAt: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "startsAt must be an ISO datetime"),
  reasonAr: z.string().trim().max(500).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

// PATCH body: the only patient-initiated transition is cancellation.
export const cancelAppointmentSchema = z.object({
  action: z.literal("cancel"),
});
