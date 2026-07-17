import Link from "next/link";
import type { Prisma, AppointmentStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/nabd/StatusBadge";
import { AppointmentFilters } from "@/components/nabd/dashboard/AppointmentFilters";
import { AppointmentRowActions } from "@/components/nabd/dashboard/AppointmentRowActions";
import { WalkInDialog } from "@/components/nabd/dashboard/WalkInDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatISODate, formatTime } from "@/lib/datetime";
import { ar } from "@/content/ar";

const PAGE_SIZE = 20;
const STATUSES: AppointmentStatus[] = [
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

type SearchParams = Promise<{
  status?: string;
  dept?: string;
  doctor?: string;
  q?: string;
  page?: string;
}>;

export default async function AppointmentsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const where: Prisma.AppointmentWhereInput = {};
  if (sp.status && STATUSES.includes(sp.status as AppointmentStatus)) {
    where.status = sp.status as AppointmentStatus;
  }
  if (sp.dept) where.department = { slug: sp.dept };
  if (sp.doctor) where.doctorId = sp.doctor;
  if (sp.q) {
    where.patient = {
      OR: [
        { user: { fullName: { contains: sp.q, mode: "insensitive" } } },
        { fileNumber: { contains: sp.q, mode: "insensitive" } },
      ],
    };
  }

  const [total, appointments, departments, doctors, patients] = await Promise.all([
    prisma.appointment.count({ where }),
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
    prisma.department.findMany({ orderBy: { sortOrder: "asc" }, select: { id: true, slug: true, nameAr: true } }),
    prisma.doctor.findMany({
      orderBy: { fullNameAr: "asc" },
      select: { id: true, fullNameAr: true, departmentId: true, isAcceptingPatients: true },
    }),
    prisma.patient.findMany({
      orderBy: { fileNumber: "asc" },
      select: { id: true, fileNumber: true, user: { select: { fullName: true } } },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (v && k !== "page") qs.set(k, String(v));
  const pageHref = (p: number) => {
    const s = new URLSearchParams(qs);
    s.set("page", String(p));
    return `/dashboard/appointments?${s.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
            {ar.dash.appointments.title}
          </h1>
          <p className="mt-1 text-muted-ink">{ar.dash.appointments.lead}</p>
        </div>
        <WalkInDialog
          patients={patients.map((p) => ({
            id: p.id,
            label: `${p.fileNumber} — ${p.user.fullName}`,
          }))}
          departments={departments.map((d) => ({ id: d.id, nameAr: d.nameAr }))}
          doctors={doctors.filter((d) => d.isAcceptingPatients)}
        />
      </div>

      <div className="mt-6">
        <AppointmentFilters
          departments={departments.map((d) => ({ slug: d.slug, nameAr: d.nameAr }))}
          doctors={doctors.map((d) => ({ id: d.id, fullNameAr: d.fullNameAr }))}
        />
      </div>

      <div className="mt-4 rounded-lg border border-line bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ar.dash.appointments.columns.datetime}</TableHead>
              <TableHead>{ar.dash.appointments.columns.patient}</TableHead>
              <TableHead>{ar.dash.appointments.columns.fileNumber}</TableHead>
              <TableHead>{ar.dash.appointments.columns.doctor}</TableHead>
              <TableHead>{ar.dash.appointments.columns.department}</TableHead>
              <TableHead>{ar.dash.appointments.columns.status}</TableHead>
              <TableHead className="text-end">{ar.dash.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-ink">
                  {ar.dash.appointments.empty}
                </TableCell>
              </TableRow>
            ) : (
              appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap font-data tabular-nums">
                    {formatISODate(a.startsAt)} {formatTime(a.startsAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {a.patient.user.fullName}
                  </TableCell>
                  <TableCell className="font-data tabular-nums">
                    {a.patient.fileNumber}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{a.doctor.fullNameAr}</TableCell>
                  <TableCell className="whitespace-nowrap">{a.department.nameAr}</TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="text-end">
                    <AppointmentRowActions id={a.id} status={a.status} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-ink">
            <span className="font-data tabular-nums">{page}</span> /{" "}
            <span className="font-data tabular-nums">{totalPages}</span>
          </p>
          <div className="flex gap-2">
            {page <= 1 ? (
              <Button variant="outline" size="sm" disabled>
                {ar.common.back}
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(page - 1)}>{ar.common.back}</Link>
              </Button>
            )}
            {page >= totalPages ? (
              <Button variant="outline" size="sm" disabled>
                {ar.booking.next}
              </Button>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(page + 1)}>{ar.booking.next}</Link>
              </Button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
