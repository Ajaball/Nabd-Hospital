import { prisma } from "@/lib/db";

/**
 * Read-side queries for public Server Components (CLAUDE.md §2.5: reads may hit
 * the DB directly; only writes must go through REST). Centralized here so the
 * home page, department pages, and doctor pages share one source of truth for
 * shape and ordering.
 */

export function getActiveDepartments() {
  return prisma.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export function getDepartmentsWithDoctorCount() {
  return prisma.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { doctors: true } } },
  });
}

export function getDepartmentBySlug(slug: string) {
  return prisma.department.findFirst({
    where: { slug, isActive: true },
    include: {
      doctors: {
        orderBy: [{ isAcceptingPatients: "desc" }, { fullNameAr: "asc" }],
      },
    },
  });
}

export function getDoctors(departmentSlug?: string) {
  return prisma.doctor.findMany({
    where: departmentSlug
      ? { department: { slug: departmentSlug, isActive: true } }
      : { department: { isActive: true } },
    orderBy: [{ isAcceptingPatients: "desc" }, { fullNameAr: "asc" }],
    include: { department: true },
  });
}

export function getDoctorBySlug(slug: string) {
  return prisma.doctor.findUnique({
    where: { slug },
    include: {
      department: true,
      availability: { orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }] },
    },
  });
}

export function getFeaturedDoctors(take = 3) {
  return prisma.doctor.findMany({
    where: { isAcceptingPatients: true, department: { isActive: true } },
    orderBy: { yearsExperience: "desc" },
    take,
    include: { department: true },
  });
}

export function getLatestNews(take = 3) {
  return prisma.newsPost.findMany({
    where: { publishedAt: { not: null, lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take,
  });
}

export function getPublishedNews() {
  return prisma.newsPost.findMany({
    where: { publishedAt: { not: null, lte: new Date() } },
    orderBy: { publishedAt: "desc" },
  });
}

export function getPublishedFaqs() {
  return prisma.faq.findMany({
    where: { isPublished: true },
    orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
  });
}

/** Aggregate figures for the About page, set in IBM Plex Mono. */
export async function getHospitalStats() {
  const [departments, doctors, experienceAgg] = await Promise.all([
    prisma.department.count({ where: { isActive: true } }),
    prisma.doctor.count({ where: { department: { isActive: true } } }),
    prisma.doctor.aggregate({ _sum: { yearsExperience: true } }),
  ]);
  return {
    departments,
    doctors,
    totalExperience: experienceAgg._sum.yearsExperience ?? 0,
  };
}
