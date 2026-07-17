"use client";

import Link from "next/link";
import { Printer, CheckCircle2 } from "lucide-react";
import type { AppointmentStatus } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/nabd/StatusBadge";
import { formatDateWithWeekday, formatTime } from "@/lib/datetime";
import { ar } from "@/content/ar";

export type SlipData = {
  fileNumber: string;
  doctorNameAr: string;
  departmentNameAr: string;
  startsAt: string; // ISO
  status: AppointmentStatus;
  reasonAr?: string | null;
};

/**
 * The appointment slip (PHASES §4): file number, doctor, department, date, time
 * in IBM Plex Mono with tabular figures, 4px radius, printable. This is the
 * confirmation artifact the patient can keep.
 */
export function AppointmentSlip({ data }: { data: SlipData }) {
  const start = new Date(data.startsAt);

  const rows = [
    { label: ar.booking.slip.fileNumber, value: data.fileNumber, mono: true },
    { label: ar.booking.slip.doctor, value: data.doctorNameAr, mono: false },
    { label: ar.booking.slip.department, value: data.departmentNameAr, mono: false },
    { label: ar.booking.slip.date, value: formatDateWithWeekday(start), mono: true },
    { label: ar.booking.slip.time, value: formatTime(start), mono: true },
  ];

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex flex-col items-center gap-2 text-center print:hidden">
        <CheckCircle2 className="size-10 text-st-confirmed" aria-hidden="true" />
        <h2 className="text-xl font-bold tracking-[-0.01em] text-ink">
          {ar.booking.slip.done}
        </h2>
      </div>

      <div className="rounded-sm border border-line bg-card p-6">
        <h3 className="mb-4 text-sm font-semibold text-muted-ink">
          {ar.booking.slip.title}
        </h3>
        <dl className="divide-y divide-line">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted-ink">{row.label}</dt>
              <dd
                className={
                  row.mono
                    ? "font-data tabular-nums text-ink"
                    : "font-medium text-ink"
                }
              >
                {row.value}
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-sm text-muted-ink">{ar.booking.slip.status}</dt>
            <dd>
              <StatusBadge status={data.status} />
            </dd>
          </div>
          {data.reasonAr ? (
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-sm text-muted-ink">{ar.booking.slip.reason}</dt>
              <dd className="text-ink">{data.reasonAr}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row print:hidden">
        <Button asChild className="flex-1">
          <Link href="/my-appointments">{ar.booking.slip.viewAppointments}</Link>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => window.print()}
        >
          <Printer className="size-4" />
          {ar.booking.slip.print}
        </Button>
      </div>
    </div>
  );
}
