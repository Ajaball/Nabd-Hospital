/**
 * Read queries for the public site (Phase 3). Server Components may read the
 * database directly for page rendering (CLAUDE.md §2.5 — reads may bypass REST;
 * writes may not). Centralising them here keeps pages thin and gives every
 * public list a single, consistent ordering.
 */
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";

/** Active departments in their curated display order. */
export function getDepartments() {
  return prisma.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

/** One active department by slug, or null. */
export function getDepartmentBySlug(slug: string) {
  return prisma.department.findFirst({
    where: { slug, isActive: true },
  });
}

/** Doctors, optionally scoped to one department slug. Consultants first. */
export function getDoctors(departmentSlug?: string) {
  const where: Prisma.DoctorWhereInput = {
    department: { isActive: true },
    ...(departmentSlug ? { department: { slug: departmentSlug, isActive: true } } : {}),
  };
  return prisma.doctor.findMany({
    where,
    orderBy: [{ yearsExperience: "desc" }, { fullNameAr: "asc" }],
    include: { department: true },
  });
}

/** Doctors within one department (by department id). */
export function getDoctorsByDepartment(departmentId: string) {
  return prisma.doctor.findMany({
    where: { departmentId },
    orderBy: [{ yearsExperience: "desc" }, { fullNameAr: "asc" }],
    include: { department: true },
  });
}

/** One doctor by slug with department + weekly availability. */
export function getDoctorBySlug(slug: string) {
  return prisma.doctor.findUnique({
    where: { slug },
    include: {
      department: true,
      availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
  });
}

/** A small set of doctors to feature on the home page. */
export function getFeaturedDoctors(take = 3) {
  return prisma.doctor.findMany({
    where: { isAcceptingPatients: true, department: { isActive: true } },
    orderBy: { yearsExperience: "desc" },
    take,
    include: { department: true },
  });
}

/** Latest published news, newest first. */
export function getLatestNews(take = 3) {
  return prisma.newsPost.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take,
  });
}

/** Published FAQs grouped by category, preserving each category's sort order. */
export async function getFaqsByCategory() {
  const faqs = await prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
  const groups = new Map<string, typeof faqs>();
  for (const faq of faqs) {
    const bucket = groups.get(faq.category) ?? [];
    bucket.push(faq);
    groups.set(faq.category, bucket);
  }
  return Array.from(groups, ([category, items]) => ({ category, items }));
}

/** Counts for the About page stat block. */
export async function getHospitalStats() {
  const [departments, doctors] = await Promise.all([
    prisma.department.count({ where: { isActive: true } }),
    prisma.doctor.count({ where: { department: { isActive: true } } }),
  ]);
  return { departments, doctors };
}
