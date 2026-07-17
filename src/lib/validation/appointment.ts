import { z } from "zod";

/**
 * Appointment boundary schemas (CLAUDE.md §2.7). The dedicated messages here
 * are developer-facing (the client maps codes to ar.ts), so plain English is
 * fine for these few.
 */

export const dateParamSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD")
  // Reject well-formed-but-impossible dates (e.g. 2026-13-45) so they never
  // reach the slot query as an Invalid Date and surface as a 500.
  .refine((s) => {
    const [y, m, d] = s.split("-").map((n) => Number.parseInt(n, 10));
    const dt = new Date(Date.UTC(y, m - 1, d));
    return (
      dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
    );
  }, "date must be a real calendar date");

export const createAppointmentSchema = z.object({
  doctorId: z.string().min(1),
  // ISO-8601 instant of the slot start, e.g. "2026-07-19T06:00:00.000Z".
  startsAt: z
    .string()
    .refine((s) => !Number.isNaN(Date.parse(s)), "startsAt must be an ISO datetime"),
  reasonAr: z.string().trim().max(500).optional(),
  // Admin walk-in booking targets a specific patient; patients omit this and
  // book for themselves (the server ignores it for the PATIENT role).
  patientId: z.string().min(1).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

// PATCH transitions. A patient may only "cancel"; an admin may also confirm,
// complete, or mark no-show. The route enforces which role may do which.
export const updateAppointmentSchema = z.object({
  action: z.enum(["cancel", "confirm", "complete", "no_show"]),
});

export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
