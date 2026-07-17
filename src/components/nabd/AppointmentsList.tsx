"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus } from "@prisma/client";
import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/nabd/StatusBadge";
import { ar } from "@/content/ar";
import { formatLongDate, formatTime } from "@/lib/datetime";

export type AppointmentItem = {
  id: string;
  startsAt: string;
  status: AppointmentStatus;
  doctorNameAr: string;
  doctorTitle: string;
  departmentNameAr: string;
  reasonAr: string | null;
  canCancel: boolean;
};

export function AppointmentsList({
  upcoming,
  past,
}: {
  upcoming: AppointmentItem[];
  past: AppointmentItem[];
}) {
  return (
    <div className="space-y-12">
      <Section
        title={ar.appointments.upcoming}
        items={upcoming}
        emptyLabel={ar.appointments.emptyUpcoming}
        cancellable
      />
      <Section
        title={ar.appointments.past}
        items={past}
        emptyLabel={ar.appointments.emptyPast}
      />
    </div>
  );
}

function Section({
  title,
  items,
  emptyLabel,
  cancellable = false,
}: {
  title: string;
  items: AppointmentItem[];
  emptyLabel: string;
  cancellable?: boolean;
}) {
  return (
    <section>
      <h2 className="mb-4 text-xl font-bold tracking-[-0.01em] text-ink">{title}</h2>
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id}>
              <AppointmentCard item={item} cancellable={cancellable} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-line bg-card p-10 text-center">
          <CalendarClock className="size-7 text-teal" aria-hidden="true" />
          <p className="text-muted-ink">{emptyLabel}</p>
        </div>
      )}
    </section>
  );
}

function AppointmentCard({
  item,
  cancellable,
}: {
  item: AppointmentItem;
  cancellable: boolean;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/appointments/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) throw new Error("failed");
      setConfirming(false);
      router.refresh();
    } catch {
      setError(ar.appointments.cancelError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="font-semibold text-ink">{item.doctorNameAr}</h3>
          <p className="text-sm text-muted-ink">
            {item.doctorTitle} · {item.departmentNameAr}
          </p>
        </div>
        <StatusBadge status={item.status} />
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <dt className="text-muted-ink">{ar.appointments.labels.date}:</dt>
          <dd className="font-data text-ink">
            {formatLongDate(new Date(item.startsAt))}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-muted-ink">{ar.appointments.labels.time}:</dt>
          <dd className="font-data text-ink">
            {formatTime(new Date(item.startsAt))}
          </dd>
        </div>
        {item.reasonAr ? (
          <div className="flex items-center gap-2 sm:col-span-2">
            <dt className="text-muted-ink">{ar.appointments.labels.reason}:</dt>
            <dd className="text-ink">{item.reasonAr}</dd>
          </div>
        ) : null}
      </dl>

      {cancellable && item.canCancel ? (
        <div className="mt-4 border-t border-line pt-4">
          {confirming ? (
            <div className="space-y-3">
              <p className="text-sm text-ink">{ar.appointments.cancelBody}</p>
              {error ? (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={cancel}
                  disabled={busy}
                >
                  {busy ? ar.appointments.cancelling : ar.appointments.cancelConfirm}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirming(false)}
                  disabled={busy}
                >
                  {ar.appointments.cancelKeep}
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setConfirming(true)}>
              {ar.appointments.cancelCta}
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
