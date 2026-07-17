import { z } from "zod";

/**
 * Admin CRUD boundary schemas (CLAUDE.md §2.7). Messages are developer-facing;
 * the admin UI surfaces field errors generically.
 */

const slug = z
  .string()
  .trim()
  .min(1)
  .regex(/^[a-z0-9-]+$/, "slug must be lowercase letters, digits, and hyphens");

const hhmm = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "time must be HH:mm");

// ---- Departments ----------------------------------------------------------

export const departmentCreateSchema = z.object({
  slug,
  nameAr: z.string().trim().min(1),
  descriptionAr: z.string().trim().min(1),
  icon: z.string().trim().min(1),
  sortOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const departmentUpdateSchema = departmentCreateSchema.partial();

export type DepartmentCreateInput = z.infer<typeof departmentCreateSchema>;

// ---- Doctors --------------------------------------------------------------

export const doctorCreateSchema = z.object({
  slug,
  fullNameAr: z.string().trim().min(1),
  title: z.string().trim().min(1),
  departmentId: z.string().min(1),
  bio: z.string().trim().min(1),
  photoUrl: z.string().url().optional().or(z.literal("")),
  yearsExperience: z.number().int().min(0).max(70),
  isAcceptingPatients: z.boolean().optional(),
});

export const doctorUpdateSchema = doctorCreateSchema.partial();

export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>;

const availabilityRow = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: hhmm,
    endTime: hhmm,
    slotMinutes: z.number().int().min(5).max(240),
  })
  .refine((r) => r.startTime < r.endTime, {
    message: "startTime must be before endTime",
    path: ["endTime"],
  });

// Full replacement of a doctor's weekly availability.
export const availabilitySchema = z.object({
  availability: z.array(availabilityRow).max(50),
});

export type AvailabilityInput = z.infer<typeof availabilitySchema>;

// ---- News -----------------------------------------------------------------

export const newsCreateSchema = z.object({
  slug,
  titleAr: z.string().trim().min(1),
  excerptAr: z.string().trim().min(1).max(300),
  bodyAr: z.string().trim().min(1),
  coverUrl: z.string().url().optional().or(z.literal("")),
  published: z.boolean(),
});

export const newsUpdateSchema = newsCreateSchema.partial();

export type NewsCreateInput = z.infer<typeof newsCreateSchema>;

// ---- Contact messages -----------------------------------------------------

export const messageUpdateSchema = z.object({
  isRead: z.boolean(),
});
