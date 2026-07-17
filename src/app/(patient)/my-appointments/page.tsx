import type { Metadata } from "next";
import Link from "next/link";
import { AppointmentStatus } from "@prisma/client";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SignOutButton } from "@/components/nabd/SignOutButton";
import {
  AppointmentsList,
  type AppointmentItem,
} from "@/components/nabd/AppointmentsList";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { getPatientAppointmentsByUser } from "@/lib/services/booking";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: ar.metadata.myAppointments.title,
  description: ar.metadata.myAppointments.description,
};

const CANCEL_CUTOFF_MS = 4 * 60 * 60 * 1000;

/**
 * Patient portal (CLAUDE.md §Phase 4). Access is gated to PATIENT by the
 * middleware. Shows upcoming and past appointments with a StatusBadge and a
 * cancel action on the ones still cancellable (PENDING/CONFIRMED, ≥4h out).
 */
export default async function MyAppointmentsPage() {
  const session = await auth();
  const data = session?.user?.id
    ? await getPatientAppointmentsByUser(session.user.id)
    : null;

  const now = Date.now();
  const upcoming: AppointmentItem[] = [];
  const past: AppointmentItem[] = [];

  for (const a of data?.appointments ?? []) {
    const item: AppointmentItem = {
      id: a.id,
      startsAt: a.startsAt.toISOString(),
      status: a.status,
      doctorNameAr: a.doctor.fullNameAr,
      doctorTitle: a.doctor.title,
      departmentNameAr: a.department.nameAr,
      reasonAr: a.reasonAr,
      canCancel:
        (a.status === AppointmentStatus.PENDING ||
          a.status === AppointmentStatus.CONFIRMED) &&
        a.startsAt.getTime() - now >= CANCEL_CUTOFF_MS,
    };
    if (a.startsAt.getTime() >= now) upcoming.push(item);
    else past.push(item);
  }
  // Upcoming soonest-first; past stays newest-first (query order).
  upcoming.reverse();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <PulseTrace variant="rule" className="mb-6" />
          <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink">
            {ar.appointments.title}
          </h1>
          <p className="mt-2 text-muted-ink">{ar.appointments.lead}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/book" className={cn(buttonVariants({ size: "sm" }))}>
            {ar.appointments.bookCta}
          </Link>
          <SignOutButton />
        </div>
      </div>

      <div className="mt-10">
        <AppointmentsList upcoming={upcoming} past={past} />
      </div>
    </div>
  );
}
