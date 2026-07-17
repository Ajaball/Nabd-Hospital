import type { Metadata } from "next";
import { CalendarClock } from "lucide-react";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SignOutButton } from "@/components/nabd/SignOutButton";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.myAppointments.title,
  description: ar.metadata.myAppointments.description,
};

/**
 * Patient portal. Access is gated to PATIENT by the middleware. The full
 * upcoming/past list with cancel arrives in Phase 4; this authenticated
 * placeholder proves the gate and the session.
 */
export default function MyAppointmentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <PulseTrace variant="rule" className="mb-6" />
          <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink">
            {ar.auth.patientHome.title}
          </h1>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-10 flex flex-col items-center gap-4 rounded-lg border border-dashed border-line bg-card p-12 text-center">
        <CalendarClock className="size-8 text-teal" aria-hidden="true" />
        <p className="max-w-md text-muted-ink">{ar.auth.patientHome.placeholder}</p>
      </div>
    </div>
  );
}
