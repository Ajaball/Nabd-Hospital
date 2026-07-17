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
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export const cancelAppointmentSchema = z.object({
  action: z.literal("cancel"),
});
