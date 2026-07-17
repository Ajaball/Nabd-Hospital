import type { Metadata } from "next";
import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SiteHeader } from "@/components/nabd/SiteHeader";
import { SiteFooter } from "@/components/nabd/SiteFooter";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { StatusBadge } from "@/components/nabd/StatusBadge";
import { CancelAppointmentButton } from "@/components/nabd/appointments/CancelAppointmentButton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CANCEL_CUTOFF_MS } from "@/lib/services/booking";
import { formatDateWithWeekday, formatTime, formatISODate } from "@/lib/datetime";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.appointments.title,
  description: ar.appointments.lead,
};

export default async function MyAppointmentsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  // Middleware guarantees a PATIENT session here; this is a defensive fallback.
  const patient = userId
    ? await prisma.patient.findUnique({
        where: { userId },
        select: { id: true, fileNumber: true },
      })
    : null;

  const appointments = patient
    ? await prisma.appointment.findMany({
        where: { patientId: patient.id },
        orderBy: { startsAt: "asc" },
        include: {
          doctor: { select: { fullNameAr: true } },
          department: { select: { nameAr: true } },
        },
      })
    : [];

  const now = Date.now();
  const isActive = (s: string) => s === "PENDING" || s === "CONFIRMED";
  const upcoming = appointments.filter(
    (a) => isActive(a.status) && a.startsAt.getTime() >= now,
  );
  const past = appointments
    .filter((a) => !(isActive(a.status) && a.startsAt.getTime() >= now))
    .reverse();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink sm:text-3xl">
              {ar.appointments.title}
            </h1>
            <p className="mt-2 text-muted-ink">{ar.appointments.lead}</p>
            {patient ? (
              <p className="mt-2 text-sm text-muted-ink">
                {ar.appointments.fileNumberLabel}:{" "}
                <span className="font-data tabular-nums text-ink">
                  {patient.fileNumber}
                </span>
              </p>
            ) : null}
          </div>
          <Button asChild>
            <Link href="/book">
              <CalendarPlus className="size-4" />
              {ar.appointments.bookCta}
            </Link>
          </Button>
        </div>

        <PulseTrace variant="rule" className="my-10" />

        {/* Upcoming */}
        <section>
          <h2 className="text-xl font-bold tracking-[-0.01em] text-ink">
            {ar.appointments.upcoming}
          </h2>
          {upcoming.length === 0 ? (
            <div className="mt-4 rounded-lg border border-line bg-card p-8 text-center">
              <p className="font-medium text-ink">{ar.appointments.empty}</p>
              <p className="mt-1 text-sm text-muted-ink">{ar.appointments.emptyLead}</p>
              <Button asChild className="mt-5">
                <Link href="/book">{ar.appointments.bookCta}</Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {upcoming.map((a) => {
                const canCancel = a.startsAt.getTime() - now >= CANCEL_CUTOFF_MS;
                return (
                  <li
                    key={a.id}
                    className="flex flex-col gap-4 rounded-lg border border-line bg-card p-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-data tabular-nums text-base text-ink">
                          {formatDateWithWeekday(a.startsAt)}
                        </span>
                        <span className="font-data tabular-nums text-base font-semibold text-teal">
                          {formatTime(a.startsAt)}
                        </span>
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="mt-1.5 text-sm text-ink">
                        {a.doctor.fullNameAr}
                        <span className="text-muted-ink"> — {a.department.nameAr}</span>
                      </p>
                      {a.reasonAr ? (
                        <p className="mt-0.5 text-sm text-muted-ink">
                          {ar.appointments.columns.reason}: {a.reasonAr}
                        </p>
                      ) : null}
                    </div>
                    {canCancel ? (
                      <div className="shrink-0">
                        <CancelAppointmentButton appointmentId={a.id} />
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Past / history */}
        <section className="mt-12">
          <h2 className="text-xl font-bold tracking-[-0.01em] text-ink">
            {ar.appointments.past}
          </h2>
          {past.length === 0 ? (
            <p className="mt-4 rounded-lg border border-line bg-card p-6 text-muted-ink">
              {ar.appointments.emptyPast}
            </p>
          ) : (
            <div className="mt-4 rounded-lg border border-line bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{ar.appointments.columns.date}</TableHead>
                    <TableHead>{ar.appointments.columns.time}</TableHead>
                    <TableHead>{ar.appointments.columns.doctor}</TableHead>
                    <TableHead>{ar.appointments.columns.department}</TableHead>
                    <TableHead>{ar.appointments.columns.status}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {past.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-data tabular-nums whitespace-nowrap">
                        {formatISODate(a.startsAt)}
                      </TableCell>
                      <TableCell className="font-data tabular-nums">
                        {formatTime(a.startsAt)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {a.doctor.fullNameAr}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {a.department.nameAr}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
