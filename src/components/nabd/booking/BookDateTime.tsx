"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { SlotGrid, type SlotView } from "@/components/nabd/booking/SlotGrid";
import {
  AppointmentSlip,
  type SlipData,
} from "@/components/nabd/booking/AppointmentSlip";
import { ar } from "@/content/ar";

export type DateOption = { iso: string; weekday: string; label: string };

type Props = {
  doctorId: string;
  isAcceptingPatients: boolean;
  isAuthenticated: boolean;
  dates: DateOption[];
  initialDate?: string;
  initialSlot?: string;
};

export function BookDateTime({
  doctorId,
  isAcceptingPatients,
  isAuthenticated,
  dates,
  initialDate,
  initialSlot,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const firstDate = dates[0]?.iso;
  const [date, setDate] = useState<string | undefined>(
    initialDate && dates.some((d) => d.iso === initialDate) ? initialDate : firstDate,
  );
  const [slots, setSlots] = useState<SlotView[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [slot, setSlot] = useState<string | null>(initialSlot ?? null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [slip, setSlip] = useState<SlipData | null>(null);

  // Reflect date + slot in the URL so refresh, back, and the post-login
  // callbackUrl all restore the exact selection (PHASES §4).
  const syncUrl = useCallback(
    (nextDate?: string, nextSlot?: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextDate) params.set("date", nextDate);
      if (nextSlot) params.set("slot", nextSlot);
      else params.delete("slot");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    setSlots(null);
    fetch(`/api/v1/doctors/${doctorId}/slots?date=${date}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        setSlots(json?.data?.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [date, doctorId]);

  function pickDate(iso: string) {
    setDate(iso);
    setSlot(null);
    syncUrl(iso, null);
  }

  function pickSlot(iso: string) {
    setSlot(iso);
    syncUrl(date, iso);
  }

  async function confirm() {
    if (!slot) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId, startsAt: slot, reasonAr: reason || undefined }),
      });
      const json = await res.json().catch(() => null);

      if (res.status === 201 && json?.data) {
        setSlip({
          fileNumber: json.data.fileNumber,
          doctorNameAr: json.data.doctorNameAr,
          departmentNameAr: json.data.departmentNameAr,
          startsAt: json.data.startsAt,
          status: json.data.status,
          reasonAr: json.data.reasonAr,
        });
        toast.success(ar.booking.success);
        return;
      }

      if (res.status === 409) {
        toast.error(ar.booking.conflict);
        setSlot(null);
        syncUrl(date, null);
        // Refresh the grid so the now-taken slot shows as booked.
        if (date) {
          const refreshed = await fetch(`/api/v1/doctors/${doctorId}/slots?date=${date}`)
            .then((r) => r.json())
            .catch(() => null);
          setSlots(refreshed?.data?.slots ?? slots);
        }
        return;
      }

      toast.error(json?.error?.message ?? ar.booking.genericError);
    } catch {
      toast.error(ar.booking.genericError);
    } finally {
      setSubmitting(false);
    }
  }

  if (slip) {
    return <AppointmentSlip data={slip} />;
  }

  if (!isAcceptingPatients) {
    return (
      <p className="rounded-md border border-st-pending/30 bg-st-pending/5 px-4 py-3 text-sm text-st-pending">
        {ar.booking.notAccepting}
      </p>
    );
  }

  if (dates.length === 0) {
    return (
      <p className="rounded-md border border-line bg-card px-4 py-3 text-sm text-muted-ink">
        {ar.booking.noSlots}
      </p>
    );
  }

  // Post-login return target carrying the full selection.
  const callbackUrl = (() => {
    const params = new URLSearchParams(searchParams.toString());
    if (date) params.set("date", date);
    if (slot) params.set("slot", slot);
    return `${pathname}?${params.toString()}`;
  })();

  return (
    <div className="space-y-8">
      {/* Date picker: Sun–Thu only */}
      <div>
        <h3 className="mb-1 text-sm font-semibold text-ink">{ar.booking.chooseDate}</h3>
        <p className="mb-3 text-xs text-muted-ink">{ar.booking.weekdaysHint}</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {dates.map((d) => (
            <button
              key={d.iso}
              type="button"
              onClick={() => pickDate(d.iso)}
              aria-pressed={date === d.iso}
              className={cn(
                "flex min-w-20 shrink-0 flex-col items-center rounded-md border px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
                date === d.iso
                  ? "border-teal bg-teal text-paper"
                  : "border-line bg-card text-ink hover:border-teal",
              )}
            >
              <span className="text-xs">{d.weekday}</span>
              <span className="font-data text-sm tabular-nums">{d.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Slots */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-ink">{ar.booking.chooseSlot}</h3>
        {loading || slots === null ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-11" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <p className="rounded-md border border-line bg-card px-4 py-3 text-sm text-muted-ink">
            {ar.booking.noSlots}
          </p>
        ) : (
          <SlotGrid slots={slots} selected={slot} onSelect={pickSlot} />
        )}
      </div>

      {/* Reason (optional) */}
      <div>
        <label htmlFor="reason" className="mb-2 block text-sm font-semibold text-ink">
          {ar.booking.reasonLabel}
        </label>
        <Input
          id="reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={ar.booking.reasonPlaceholder}
          maxLength={500}
        />
      </div>

      {/* Confirm */}
      <div className="border-t border-line pt-6">
        {isAuthenticated ? (
          <Button type="button" size="lg" disabled={!slot || submitting} onClick={confirm}>
            {submitting ? ar.booking.confirming : ar.booking.confirm}
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-ink">{ar.booking.loginRequired}</p>
            <Button asChild size="lg" disabled={!slot}>
              <Link href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}>
                {ar.booking.loginCta}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
