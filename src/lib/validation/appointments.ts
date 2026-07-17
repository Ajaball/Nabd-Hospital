/**
 * Zod schemas for the booking endpoints (CLAUDE.md §2.7).
 */
import { z } from "zod";

// A calendar date in Riyadh, "YYYY-MM-DD".
export const dateParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "INVALID_DATE" });

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  // ISO-8601 instant of the slot start (UTC), e.g. from slot.startsAt.
  startsAt: z.string().datetime({ offset: true }),
  reasonAr: z.string().trim().max(500).optional(),
  // Admin walk-in only: book on behalf of this patient. Ignored for patients.
  patientId: z.string().min(1).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

// Patients may only "cancel"; admins may also drive the status forward.
export const appointmentActionSchema = z.object({
  action: z.enum(["cancel", "confirm", "complete", "noShow"]),
});

export type AppointmentActionInput = z.infer<typeof appointmentActionSchema>;
