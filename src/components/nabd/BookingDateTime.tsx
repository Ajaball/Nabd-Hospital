"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Printer, CalendarCheck } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/nabd/StatusBadge";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { ar } from "@/content/ar";
import {
  formatTime,
  formatClinicDay,
  formatLongDate,
  listClinicDays,
} from "@/lib/datetime";
import { cn } from "@/lib/utils";

type SlotDto = {
  startsAt: string;
  endsAt: string;
  isAvailable: boolean;
  reason: "cutoff" | "booked" | "timeoff" | null;
};

type Success = {
  fileNumber: string;
  doctorNameAr: string;
  departmentNameAr: string;
  startsAt: string;
};

export function BookingDateTime({
  doctorId,
  doctorSlug,
  doctorNameAr,
  doctorTitle,
  departmentNameAr,
  deptSlug,
  initialDate,
  initialSlot,
  isAuthenticated,
}: {
  doctorId: string;
  doctorSlug: string;
  doctorNameAr: string;
  doctorTitle: string;
  departmentNameAr: string;
  deptSlug: string;
  initialDate?: string;
  initialSlot?: string;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const [days] = useState(() => listClinicDays(new Date(), 14));
  const [date, setDate] = useState(initialDate ?? days[0]);
  const [slots, setSlots] = useState<SlotDto[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(initialSlot ?? null);
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<Success | null>(null);

  const syncUrl = useCallback(
    (nextDate: string, nextSlot: string | null) => {
      const params = new URLSearchParams({
        step: "datetime",
        dept: deptSlug,
        doctor: doctorSlug,
        date: nextDate,
      });
      if (nextSlot) params.set("slot", nextSlot);
      router.replace(`/book?${params.toString()}`, { scroll: false });
    },
    [router, deptSlug, doctorSlug],
  );

  const fetchSlots = useCallback(async (forDate: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/doctors/${doctorId}/slots?date=${forDate}`);
      const data = await res.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    void fetchSlots(date);
  }, [date, fetchSlots]);

  function pickDate(next: string) {
    setDate(next);
    setSelected(null);
    setStatus("idle");
    setErrorMsg(null);
    syncUrl(next, null);
  }

  function pickSlot(iso: string) {
    setSelected(iso);
    setStatus("idle");
    setErrorMsg(null);
    syncUrl(date, iso);
  }

  async function confirm() {
    if (!selected) return;
    if (!isAuthenticated) {
      const params = new URLSearchParams({
        step: "datetime",
        dept: deptSlug,
        doctor: doctorSlug,
        date,
        slot: selected,
      });
      const callbackUrl = `/book?${params.toString()}`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          startsAt: selected,
          reasonAr: reason.trim() || undefined,
        }),
      });
      if (res.status === 201) {
        const data = await res.json();
        setSuccess(data.appointment as Success);
        toast.success(ar.toasts.appointmentBooked);
        return;
      }
      if (res.status === 409) {
        setErrorMsg(ar.booking.errors.slotTaken);
        setStatus("error");
        setSelected(null);
        toast.error(ar.booking.errors.slotTaken);
        void fetchSlots(date);
        return;
      }
      setErrorMsg(ar.booking.errors.invalid);
      setStatus("error");
      toast.error(ar.booking.errors.invalid);
    } catch {
      setErrorMsg(ar.booking.errors.invalid);
      setStatus("error");
      toast.error(ar.booking.errors.invalid);
    }
  }

  // --- Success: the appointment slip -----------------------------------------
  if (success) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="flex flex-col items-center gap-3 text-center">
          <CalendarCheck className="size-9 text-st-confirmed" aria-hidden="true" />
          <h2 className="text-2xl font-bold tracking-[-0.01em] text-ink">
            {ar.booking.successTitle}
          </h2>
          <p className="text-sm text-muted-ink">{ar.booking.successLead}</p>
        </div>

        <div className="mt-8 rounded-lg border border-line bg-card p-6 shadow-clinical">
          <PulseTrace variant="rule" className="mb-5" />
          <h3 className="mb-4 text-sm font-semibold text-muted-ink">
            {ar.booking.slip.title}
          </h3>
          <dl className="space-y-3 text-sm">
            <SlipRow label={ar.booking.slip.fileNumber} mono>
              {success.fileNumber}
            </SlipRow>
            <SlipRow label={ar.booking.slip.doctor}>{success.doctorNameAr}</SlipRow>
            <SlipRow label={ar.booking.slip.department}>
              {success.departmentNameAr}
            </SlipRow>
            <SlipRow label={ar.booking.slip.date} mono>
              {formatLongDate(new Date(success.startsAt))}
            </SlipRow>
            <SlipRow label={ar.booking.slip.time} mono>
              {formatTime(new Date(success.startsAt))}
            </SlipRow>
            <div className="flex items-center justify-between gap-4 border-t border-line pt-3">
              <dt className="text-muted-ink">{ar.booking.slip.status}</dt>
              <dd>
                <StatusBadge status="PENDING" />
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" />
            {ar.booking.slip.print}
          </Button>
          <Link href="/my-appointments" className={cn(buttonVariants())}>
            {ar.booking.slip.toAppointments}
          </Link>
        </div>
      </div>
    );
  }

  const selectedSlotData = slots?.find((s) => s.startsAt === selected);

  return (
    <div className="space-y-8">
      {/* Date picker — clinic days only (Sun–Thu) */}
      <div>
        <h2 className="mb-1 text-lg font-semibold text-ink">
          {ar.booking.chooseDate}
        </h2>
        <p className="mb-4 text-sm text-muted-ink">{ar.booking.weekendNote}</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {days.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => pickDate(d)}
              aria-pressed={d === date}
              className={cn(
                "shrink-0 rounded-md border px-4 py-2 text-sm transition-colors",
                d === date
                  ? "border-teal bg-teal text-paper"
                  : "border-line bg-card text-ink hover:border-teal",
              )}
            >
              {formatClinicDay(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Slot grid */}
      <div>
        <h2 className="mb-1 text-lg font-semibold text-ink">
          {ar.booking.chooseSlot}
        </h2>
        <p className="mb-4 text-sm text-muted-ink">{ar.booking.slotsLead}</p>

        {loading ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-md bg-mint/50" />
            ))}
          </div>
        ) : slots && slots.length > 0 ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((slot) => {
              const isSelected = slot.startsAt === selected;
              const label = formatTime(new Date(slot.startsAt));
              if (!slot.isAvailable) {
                const reasonText = slot.reason
                  ? ar.booking.slotReasons[slot.reason]
                  : "";
                return (
                  <button
                    key={slot.startsAt}
                    type="button"
                    disabled
                    aria-label={`${label} — ${reasonText}`}
                    title={reasonText || undefined}
                    className="flex h-11 cursor-not-allowed flex-col items-center justify-center rounded-md border border-line bg-mint/20 text-muted-ink/60 line-through"
                  >
                    <span className="font-data text-sm" aria-hidden="true">
                      {label}
                    </span>
                  </button>
                );
              }
              return (
                <button
                  key={slot.startsAt}
                  type="button"
                  onClick={() => pickSlot(slot.startsAt)}
                  aria-pressed={isSelected}
                  className={cn(
                    "h-11 rounded-md border font-data text-sm transition-colors",
                    isSelected
                      ? "border-teal bg-teal text-paper"
                      : "border-teal/40 bg-card text-teal hover:bg-mint",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed border-line bg-card p-8 text-center text-muted-ink">
            {ar.booking.noSlots}
          </p>
        )}
      </div>

      {/* Confirm panel */}
      {selected && selectedSlotData ? (
        <div className="rounded-lg border border-line bg-card p-6">
          <h2 className="text-lg font-semibold text-ink">
            {ar.booking.reviewTitle}
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <SlipRow label={ar.booking.slip.doctor}>
              {doctorNameAr} · {doctorTitle}
            </SlipRow>
            <SlipRow label={ar.booking.slip.department}>{departmentNameAr}</SlipRow>
            <SlipRow label={ar.booking.slip.date} mono>
              {formatLongDate(new Date(selected))}
            </SlipRow>
            <SlipRow label={ar.booking.slip.time} mono>
              {formatTime(new Date(selected))}
            </SlipRow>
          </dl>

          <div className="mt-5 space-y-2">
            <Label htmlFor="reason">{ar.booking.reasonLabel}</Label>
            <Textarea
              id="reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={ar.booking.reasonPlaceholder}
            />
          </div>

          {errorMsg ? (
            <p
              role="alert"
              className="mt-4 rounded-md border-s-[3px] border-s-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {errorMsg}
            </p>
          ) : null}

          {isAuthenticated ? (
            <Button
              className="mt-5 w-full sm:w-auto"
              size="lg"
              onClick={confirm}
              disabled={status === "submitting"}
            >
              {status === "submitting"
                ? ar.booking.confirming
                : ar.booking.confirmCta}
            </Button>
          ) : (
            <div className="mt-5 space-y-3">
              <p className="text-sm text-muted-ink">{ar.booking.loginPrompt}</p>
              <Button className="w-full sm:w-auto" size="lg" onClick={confirm}>
                {ar.booking.loginCta}
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function SlipRow({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-ink">{label}</dt>
      <dd className={cn("text-ink", mono && "font-data")}>{children}</dd>
    </div>
  );
}
