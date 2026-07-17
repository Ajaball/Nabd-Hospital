import { prisma } from "@/lib/db";
import {
  formatISODate,
  riyadhWallTimeToUtc,
  riyadhDayOfWeek,
} from "@/lib/datetime";

/**
 * Aggregations for the admin overview (Phase 5). Day/week boundaries are
 * computed in Riyadh (via the UTC anchors) so "today" matches what staff see.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getKpis(now: Date) {
  const todayISO = formatISODate(now);
  const todayStart = riyadhWallTimeToUtc(todayISO, "00:00");
  const todayEnd = new Date(todayStart.getTime() + DAY_MS);

  // Current week, Sunday-based (Riyadh).
  const dow = riyadhDayOfWeek(now);
  const weekStart = new Date(todayStart.getTime() - dow * DAY_MS);
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS);

  const ninetyDaysAgo = new Date(now.getTime() - 90 * DAY_MS);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * DAY_MS);

  const [today, week, activePatients, totalRecent, cancelledRecent] = await Promise.all([
    prisma.appointment.count({
      where: { startsAt: { gte: todayStart, lt: todayEnd } },
    }),
    prisma.appointment.count({
      where: { startsAt: { gte: weekStart, lt: weekEnd } },
    }),
    prisma.appointment
      .findMany({
        where: { startsAt: { gte: thirtyDaysAgo } },
        distinct: ["patientId"],
        select: { patientId: true },
      })
      .then((rows) => rows.length),
    prisma.appointment.count({ where: { createdAt: { gte: ninetyDaysAgo } } }),
    prisma.appointment.count({
      where: { createdAt: { gte: ninetyDaysAgo }, status: "CANCELLED" },
    }),
  ]);

  const cancellationRate =
    totalRecent > 0 ? Math.round((cancelledRecent / totalRecent) * 100) : 0;

  return { today, week, activePatients, cancellationRate };
}

/** Appointment counts per Riyadh day over the last `days` days (inclusive). */
export async function getAppointmentsPerDay(now: Date, days = 30) {
  const todayISO = formatISODate(now);
  const todayStart = riyadhWallTimeToUtc(todayISO, "00:00");
  const end = new Date(todayStart.getTime() + DAY_MS);
  const start = new Date(todayStart.getTime() - (days - 1) * DAY_MS);

  const rows = await prisma.appointment.findMany({
    where: { startsAt: { gte: start, lt: end } },
    select: { startsAt: true },
  });

  const counts = new Map<string, number>();
  for (const r of rows) {
    const key = formatISODate(r.startsAt);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const series: { date: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * DAY_MS);
    const key = formatISODate(d);
    series.push({ date: key.slice(5), count: counts.get(key) ?? 0 }); // MM-DD
  }
  return series;
}

/** Appointment counts per active department. */
export async function getAppointmentsPerDepartment() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { id: true, nameAr: true, _count: { select: { appointments: true } } },
  });
  return departments.map((d) => ({ name: d.nameAr, count: d._count.appointments }));
}

export function getRecentAppointments(take = 8) {
  return prisma.appointment.findMany({
    orderBy: { createdAt: "desc" },
    take,
    include: {
      patient: { select: { fileNumber: true, user: { select: { fullName: true } } } },
      doctor: { select: { fullNameAr: true } },
      department: { select: { nameAr: true } },
    },
  });
}
