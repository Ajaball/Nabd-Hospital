"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatISODate,
  formatWeekday,
  formatDayMonth,
  formatTime,
  riyadhDayOfWeek,
} from "@/lib/datetime";
import { ar } from "@/content/ar";

type Patient = { id: string; label: string };
type Department = { id: string; nameAr: string };
type Doctor = { id: string; fullNameAr: string; departmentId: string };
type Slot = { startsAt: string; isAvailable: boolean };

const DAY_MS = 24 * 60 * 60 * 1000;
const selectClass =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-ink focus-visible:border-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";

function bookableDates(): { iso: string; label: string }[] {
  const now = Date.now();
  const out: { iso: string; label: string }[] = [];
  for (let i = 0; i < 14 && out.length < 10; i++) {
    const d = new Date(now + i * DAY_MS);
    if (riyadhDayOfWeek(d) > 4) continue;
    out.push({ iso: formatISODate(d), label: `${formatWeekday(d)} ${formatDayMonth(d)}` });
  }
  return out;
}

export function WalkInDialog({
  patients,
  departments,
  doctors,
}: {
  patients: Patient[];
  departments: Department[];
  doctors: Doctor[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const dates = useMemo(() => bookableDates(), []);

  const [patientId, setPatientId] = useState("");
  const [deptId, setDeptId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(dates[0]?.iso ?? "");
  const [slot, setSlot] = useState("");
  const [reason, setReason] = useState("");
  const [slots, setSlots] = useState<Slot[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const deptDoctors = doctors.filter((d) => d.departmentId === deptId);

  useEffect(() => {
    if (!doctorId || !date) {
      setSlots([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/v1/doctors/${doctorId}/slots?date=${date}`)
      .then((r) => r.json())
      .then((j) => {
        if (!cancelled) setSlots(j?.data?.slots ?? []);
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      });
    return () => {
      cancelled = true;
    };
  }, [doctorId, date]);

  const availableSlots = slots.filter((s) => s.isAvailable);

  async function submit() {
    if (!patientId || !doctorId || !slot) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId, doctorId, startsAt: slot, reasonAr: reason || undefined }),
      });
      if (res.status === 201) {
        toast.success(ar.dash.walkIn.success);
        setOpen(false);
        setPatientId("");
        setDeptId("");
        setDoctorId("");
        setSlot("");
        setReason("");
        router.refresh();
        return;
      }
      if (res.status === 409) {
        toast.error(ar.dash.walkIn.conflict);
        return;
      }
      const json = await res.json().catch(() => null);
      toast.error(json?.error?.message ?? ar.dash.walkIn.error);
    } catch {
      toast.error(ar.dash.walkIn.error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="size-4" />
          {ar.dash.appointments.walkIn}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{ar.dash.walkIn.title}</DialogTitle>
          <DialogDescription>{ar.dash.walkIn.lead}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="wi-patient">{ar.dash.walkIn.patient}</Label>
            <select
              id="wi-patient"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className={selectClass}
            >
              <option value="">{ar.dash.walkIn.selectPatient}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="wi-dept">{ar.dash.walkIn.department}</Label>
              <select
                id="wi-dept"
                value={deptId}
                onChange={(e) => {
                  setDeptId(e.target.value);
                  setDoctorId("");
                  setSlot("");
                }}
                className={selectClass}
              >
                <option value="">{ar.dash.common.none}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="wi-doctor">{ar.dash.walkIn.doctor}</Label>
              <select
                id="wi-doctor"
                value={doctorId}
                onChange={(e) => {
                  setDoctorId(e.target.value);
                  setSlot("");
                }}
                disabled={!deptId}
                className={selectClass}
              >
                <option value="">{ar.dash.common.none}</option>
                {deptDoctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullNameAr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wi-date">{ar.dash.walkIn.date}</Label>
            <select
              id="wi-date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setSlot("");
              }}
              className={selectClass}
            >
              {dates.map((d) => (
                <option key={d.iso} value={d.iso}>
                  {d.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>{ar.dash.walkIn.slot}</Label>
            {!doctorId ? (
              <p className="text-sm text-muted-ink">{ar.dash.common.none}</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-muted-ink">{ar.dash.walkIn.noSlots}</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((s) => (
                  <button
                    key={s.startsAt}
                    type="button"
                    onClick={() => setSlot(s.startsAt)}
                    className={`rounded-sm border px-2 py-1.5 font-data text-sm tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${
                      slot === s.startsAt
                        ? "border-teal bg-teal text-paper"
                        : "border-line bg-card text-ink hover:border-teal"
                    }`}
                  >
                    {formatTime(new Date(s.startsAt))}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="wi-reason">{ar.dash.walkIn.reason}</Label>
            <Input
              id="wi-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={submit}
            disabled={submitting || !patientId || !doctorId || !slot}
          >
            {submitting ? ar.dash.walkIn.submitting : ar.dash.walkIn.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
