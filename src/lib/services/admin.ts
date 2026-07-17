/**
 * Admin read queries (CLAUDE.md §Phase 5). KPIs, chart series, and recent
 * activity for the dashboard overview. All day bucketing is by the Riyadh
 * calendar; storage stays UTC.
 */
import { AppointmentStatus, type Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { isoDate } from "@/lib/datetime";

const DAY_MS = 24 * 60 * 60 * 1000;
export const PAGE_SIZE = 12;

/** UTC instant of Riyadh 00:00 for a "YYYY-MM-DD" date. */
function riyadhMidnight(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, -3, 0));
}

/** Weekday (0=Sun..6=Sat) of a "YYYY-MM-DD" date. */
function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export async function getOverviewKpis(now: Date) {
  const today = isoDate(now);
  const todayStart = riyadhMidnight(today);
  const todayEnd = new Date(todayStart.getTime() + DAY_MS);

  // Current week: back to Sunday, forward seven days.
  const weekStart = new Date(todayStart.getTime() - weekdayOf(today) * DAY_MS);
  const weekEnd = new Date(weekStart.getTime() + 7 * DAY_MS);

  const ninetyAgo = new Date(now.getTime() - 90 * DAY_MS);

  const [todayCount, weekCount, activePatients, cancelled, total] =
    await Promise.all([
      prisma.appointment.count({
        where: { startsAt: { gte: todayStart, lt: todayEnd } },
      }),
      prisma.appointment.count({
        where: { startsAt: { gte: weekStart, lt: weekEnd } },
      }),
      prisma.patient.count({
        where: {
          appointments: {
            some: {
              startsAt: { gte: ninetyAgo },
              status: { not: AppointmentStatus.CANCELLED },
            },
          },
        },
      }),
      prisma.appointment.count({
        where: {
          createdAt: { gte: ninetyAgo },
          status: AppointmentStatus.CANCELLED,
        },
      }),
      prisma.appointment.count({ where: { createdAt: { gte: ninetyAgo } } }),
    ]);

  const cancellationRate = total > 0 ? Math.round((cancelled / total) * 100) : 0;

  return { todayCount, weekCount, activePatients, cancellationRate };
}

/** Appointment counts per Riyadh day for the last `days` days (oldest first). */
export async function getAppointmentsPerDay(now: Date, days = 30) {
  const from = new Date(riyadhMidnight(isoDate(now)).getTime() - (days - 1) * DAY_MS);
  const rows = await prisma.appointment.findMany({
    where: { startsAt: { gte: from } },
    select: { startsAt: true },
  });

  const counts = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    counts.set(isoDate(new Date(from.getTime() + i * DAY_MS)), 0);
  }
  for (const row of rows) {
    const key = isoDate(row.startsAt);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts, ([date, count]) => ({ date, count }));
}

/** Appointment counts per department (active departments), highest first. */
export async function getAppointmentsPerDepartment() {
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    select: { nameAr: true, _count: { select: { appointments: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return departments.map((d) => ({ name: d.nameAr, count: d._count.appointments }));
}

/** A page of appointments with server-side filtering (CLAUDE.md §Phase 5). */
export async function listAppointments(opts: {
  status?: AppointmentStatus;
  deptSlug?: string;
  q?: string;
  page: number;
}) {
  const where: Prisma.AppointmentWhereInput = {};
  if (opts.status) where.status = opts.status;
  if (opts.deptSlug) where.department = { slug: opts.deptSlug };
  if (opts.q) {
    where.patient = {
      OR: [
        { fileNumber: { contains: opts.q, mode: "insensitive" } },
        { user: { fullName: { contains: opts.q, mode: "insensitive" } } },
      ],
    };
  }

  const page = Math.max(1, opts.page);
  const [rows, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      orderBy: { startsAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        patient: { select: { fileNumber: true, user: { select: { fullName: true } } } },
        doctor: { select: { fullNameAr: true } },
        department: { select: { nameAr: true } },
      },
    }),
    prisma.appointment.count({ where }),
  ]);

  return { rows, total, page, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** The most recently created appointments with the names needed to render them. */
export async function getRecentActivity(take = 8) {
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

/** Contact inbox, unread first, then newest first. */
export async function listMessages(page: number) {
  const p = Math.max(1, page);
  const [rows, total] = await Promise.all([
    prisma.contactMessage.findMany({
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      skip: (p - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.contactMessage.count(),
  ]);
  return { rows, total, page: p, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Patients with their user + a bounded appointment history for the drawer. */
export async function listPatients(opts: { q?: string; page: number }) {
  const where: Prisma.PatientWhereInput = {};
  if (opts.q) {
    where.OR = [
      { fileNumber: { contains: opts.q, mode: "insensitive" } },
      { user: { fullName: { contains: opts.q, mode: "insensitive" } } },
    ];
  }
  const p = Math.max(1, opts.page);
  const [rows, total] = await Promise.all([
    prisma.patient.findMany({
      where,
      orderBy: { fileNumber: "asc" },
      skip: (p - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        user: { select: { fullName: true, phone: true } },
        _count: { select: { appointments: true } },
        appointments: {
          orderBy: { startsAt: "desc" },
          take: 20,
          include: {
            doctor: { select: { fullNameAr: true } },
            department: { select: { nameAr: true } },
          },
        },
      },
    }),
    prisma.patient.count({ where }),
  ]);
  return { rows, total, page: p, pageCount: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
