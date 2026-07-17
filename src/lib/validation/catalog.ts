/**
 * Zod schemas for admin catalog management (CLAUDE.md §2.7): departments,
 * doctors, availability, and news.
 */
import { z } from "zod";

const slug = z.string().trim().regex(/^[a-z0-9-]+$/);
const arText = (min = 1, max = 5000) => z.string().trim().min(min).max(max);

// --- Departments -------------------------------------------------------------
export const departmentCreateSchema = z.object({
  slug,
  nameAr: arText(),
  descriptionAr: arText(),
  icon: z.string().trim().min(1),
});

export const departmentUpdateSchema = z.object({
  nameAr: arText().optional(),
  descriptionAr: arText().optional(),
  icon: z.string().trim().min(1).optional(),
  isActive: z.boolean().optional(),
  move: z.enum(["up", "down"]).optional(),
});

// --- News --------------------------------------------------------------------
export const newsCreateSchema = z.object({
  slug,
  titleAr: arText(),
  excerptAr: arText(1, 300),
  bodyAr: arText(),
});

export const newsUpdateSchema = z.object({
  titleAr: arText().optional(),
  excerptAr: arText(1, 300).optional(),
  bodyAr: arText().optional(),
  publish: z.boolean().optional(),
});

// --- Doctors -----------------------------------------------------------------
export const doctorCreateSchema = z.object({
  slug,
  fullNameAr: arText(),
  title: arText(),
  departmentId: z.string().min(1),
  bio: arText(),
  yearsExperience: z.coerce.number().int().min(0).max(70),
  isAcceptingPatients: z.boolean().optional(),
});

export const doctorUpdateSchema = z.object({
  fullNameAr: arText().optional(),
  title: arText().optional(),
  departmentId: z.string().min(1).optional(),
  bio: arText().optional(),
  yearsExperience: z.coerce.number().int().min(0).max(70).optional(),
  isAcceptingPatients: z.boolean().optional(),
});

export const availabilitySchema = z.object({
  slots: z
    .array(
      z.object({
        dayOfWeek: z.number().int().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        slotMinutes: z.number().int().min(5).max(120),
      }),
    )
    .max(7),
});
