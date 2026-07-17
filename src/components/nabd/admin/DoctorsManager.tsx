"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

type Slot = { dayOfWeek: number; startTime: string; endTime: string; slotMinutes: number };

export type DoctorRow = {
  id: string;
  slug: string;
  fullNameAr: string;
  title: string;
  departmentId: string;
  departmentNameAr: string;
  bio: string;
  yearsExperience: number;
  isAcceptingPatients: boolean;
  futureCount: number;
  availability: Slot[];
};

type Dept = { id: string; nameAr: string };

type Editing =
  | { mode: "create" }
  | { mode: "edit"; doctor: DoctorRow }
  | { mode: "availability"; doctor: DoctorRow }
  | null;

const selectClass =
  "h-11 w-full rounded-md border border-input bg-card px-3 text-sm text-ink focus-visible:border-teal focus-visible:outline-none";

export function DoctorsManager({
  doctors,
  departments,
}: {
  doctors: DoctorRow[];
  departments: Dept[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(url: string, method: string, body?: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        setEditing(null);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message ?? ar.admin.common.genericError);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {error ? (
        <p role="alert" className="rounded-md border-s-[3px] border-s-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing({ mode: "create" })}>
          {ar.admin.common.create}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-line bg-mint/40">
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.doctors.colName}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.doctors.colDepartment}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.doctors.colExperience}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.doctors.colAccepting}</th>
              <th className="px-4 py-3 text-end font-semibold text-ink">{ar.admin.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((d) => (
              <tr key={d.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-ink">{d.fullNameAr}</div>
                  <div className="text-xs text-muted-ink">{d.title}</div>
                </td>
                <td className="px-4 py-3 text-muted-ink">{d.departmentNameAr}</td>
                <td className="px-4 py-3 font-data text-ink">{d.yearsExperience}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-sm border-s-[3px] px-2 py-0.5 text-xs font-medium",
                      d.isAcceptingPatients
                        ? "border-s-st-confirmed bg-st-confirmed/8 text-st-confirmed"
                        : "border-s-st-completed bg-st-completed/8 text-st-completed",
                    )}
                  >
                    {d.isAcceptingPatients ? ar.admin.doctors.accepting : ar.admin.doctors.notAccepting}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <Button variant="ghost" size="sm" className="h-8 px-2.5 text-xs" disabled={busy}
                      onClick={() => send(`/api/v1/doctors/${d.id}`, "PATCH", { isAcceptingPatients: !d.isAcceptingPatients })}>
                      {ar.admin.doctors.toggleAccepting}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 gap-1 px-2.5 text-xs"
                      onClick={() => setEditing({ mode: "availability", doctor: d })}>
                      <CalendarClock className="size-3.5" />
                      {ar.common.weeklySchedule}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs"
                      onClick={() => setEditing({ mode: "edit", doctor: d })}>
                      {ar.admin.common.edit}
                    </Button>
                    <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs" disabled={busy}
                      onClick={() => send(`/api/v1/doctors/${d.id}`, "DELETE")}>
                      {ar.admin.common.delete}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-[28rem] max-w-[92vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editing?.mode === "availability"
                ? ar.common.weeklySchedule
                : editing?.mode === "create"
                  ? ar.admin.common.create
                  : ar.admin.common.edit}
            </SheetTitle>
          </SheetHeader>
          {editing?.mode === "availability" ? (
            <AvailabilityEditor
              doctor={editing.doctor}
              busy={busy}
              onSave={(slots) => send(`/api/v1/doctors/${editing.doctor.id}/availability`, "PUT", { slots })}
            />
          ) : editing ? (
            <DoctorForm
              key={editing.mode === "edit" ? editing.doctor.id : "new"}
              doctor={editing.mode === "edit" ? editing.doctor : undefined}
              departments={departments}
              busy={busy}
              onSubmit={(values) =>
                editing.mode === "edit"
                  ? send(`/api/v1/doctors/${editing.doctor.id}`, "PATCH", {
                      fullNameAr: values.fullNameAr,
                      title: values.title,
                      departmentId: values.departmentId,
                      bio: values.bio,
                      yearsExperience: values.yearsExperience,
                    })
                  : send("/api/v1/doctors", "POST", values)
              }
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function DoctorForm({
  doctor,
  departments,
  busy,
  onSubmit,
}: {
  doctor?: DoctorRow;
  departments: Dept[];
  busy: boolean;
  onSubmit: (v: {
    slug: string;
    fullNameAr: string;
    title: string;
    departmentId: string;
    bio: string;
    yearsExperience: number;
  }) => void;
}) {
  const [slug, setSlug] = useState(doctor?.slug ?? "");
  const [fullNameAr, setFullNameAr] = useState(doctor?.fullNameAr ?? "");
  const [title, setTitle] = useState(doctor?.title ?? "");
  const [departmentId, setDepartmentId] = useState(doctor?.departmentId ?? departments[0]?.id ?? "");
  const [bio, setBio] = useState(doctor?.bio ?? "");
  const [years, setYears] = useState(String(doctor?.yearsExperience ?? 0));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ slug, fullNameAr, title, departmentId, bio, yearsExperience: Number(years) });
      }}
      className="space-y-4"
    >
      {!doctor ? (
        <div className="space-y-2">
          <Label htmlFor="doc-slug">slug</Label>
          <Input id="doc-slug" dir="ltr" className="font-data" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="doc-name">{ar.admin.doctors.colName}</Label>
        <Input id="doc-name" value={fullNameAr} onChange={(e) => setFullNameAr(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="doc-title">{ar.doctorDetail.experienceLabel}</Label>
        <Input id="doc-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="doc-dept">{ar.admin.doctors.colDepartment}</Label>
        <select id="doc-dept" className={selectClass} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
          {departments.map((dep) => (
            <option key={dep.id} value={dep.id}>{dep.nameAr}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="doc-years">{ar.common.yearsExperience}</Label>
        <Input id="doc-years" type="number" min={0} max={70} dir="ltr" className="font-data" value={years} onChange={(e) => setYears(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="doc-bio">{ar.doctorDetail.bioTitle}</Label>
        <Textarea id="doc-bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? ar.admin.common.saving : ar.admin.common.save}
      </Button>
    </form>
  );
}

function AvailabilityEditor({
  doctor,
  busy,
  onSave,
}: {
  doctor: DoctorRow;
  busy: boolean;
  onSave: (slots: Slot[]) => void;
}) {
  // One editable window per weekday, prefilled from existing availability.
  const initial = ar.common.weekdays.map((_, day) => {
    const existing = doctor.availability.find((a) => a.dayOfWeek === day);
    return {
      day,
      enabled: Boolean(existing),
      startTime: existing?.startTime ?? "08:00",
      endTime: existing?.endTime ?? "14:00",
      slotMinutes: existing?.slotMinutes ?? 30,
    };
  });
  const [rows, setRows] = useState(initial);

  function update(day: number, patch: Partial<(typeof initial)[number]>) {
    setRows((prev) => prev.map((r) => (r.day === day ? { ...r, ...patch } : r)));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const slots: Slot[] = rows
          .filter((r) => r.enabled)
          .map((r) => ({
            dayOfWeek: r.day,
            startTime: r.startTime,
            endTime: r.endTime,
            slotMinutes: Number(r.slotMinutes),
          }));
        onSave(slots);
      }}
      className="space-y-3"
    >
      {rows.map((r) => (
        <div key={r.day} className="rounded-md border border-line p-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={r.enabled}
              onChange={(e) => update(r.day, { enabled: e.target.checked })}
              className="size-4 accent-[var(--teal)]"
            />
            <span className="font-medium text-ink">{ar.common.weekdays[r.day]}</span>
          </label>
          {r.enabled ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              <input type="time" dir="ltr" value={r.startTime} onChange={(e) => update(r.day, { startTime: e.target.value })}
                className="h-9 rounded-md border border-input bg-card px-2 font-data text-sm" />
              <input type="time" dir="ltr" value={r.endTime} onChange={(e) => update(r.day, { endTime: e.target.value })}
                className="h-9 rounded-md border border-input bg-card px-2 font-data text-sm" />
              <input type="number" dir="ltr" min={5} max={120} step={5} value={r.slotMinutes}
                onChange={(e) => update(r.day, { slotMinutes: Number(e.target.value) })}
                className="h-9 rounded-md border border-input bg-card px-2 font-data text-sm" />
            </div>
          ) : null}
        </div>
      ))}
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? ar.admin.common.saving : ar.admin.common.save}
      </Button>
    </form>
  );
}
