"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, CalendarClock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ConfirmDelete } from "@/components/nabd/dashboard/ConfirmDelete";
import { weekdayName } from "@/lib/datetime";
import { ar } from "@/content/ar";

export type AvailabilityRow = {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number;
};

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
  availability: AvailabilityRow[];
};

type Department = { id: string; nameAr: string };

const selectClass =
  "h-10 w-full rounded-md border border-input bg-card px-3 text-sm text-ink focus-visible:border-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";

type FormState = {
  slug: string;
  fullNameAr: string;
  title: string;
  departmentId: string;
  bio: string;
  yearsExperience: number;
  isAcceptingPatients: boolean;
};

export function DoctorsManager({
  doctors,
  departments,
}: {
  doctors: DoctorRow[];
  departments: Department[];
}) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [availOpen, setAvailOpen] = useState(false);
  const [editing, setEditing] = useState<DoctorRow | null>(null);
  const [availDoctor, setAvailDoctor] = useState<DoctorRow | null>(null);
  const [rows, setRows] = useState<AvailabilityRow[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<FormState>({
    slug: "",
    fullNameAr: "",
    title: "",
    departmentId: departments[0]?.id ?? "",
    bio: "",
    yearsExperience: 0,
    isAcceptingPatients: true,
  });

  function openCreate() {
    setEditing(null);
    setForm({
      slug: "",
      fullNameAr: "",
      title: "",
      departmentId: departments[0]?.id ?? "",
      bio: "",
      yearsExperience: 0,
      isAcceptingPatients: true,
    });
    setFormOpen(true);
  }
  function openEdit(d: DoctorRow) {
    setEditing(d);
    setForm({
      slug: d.slug,
      fullNameAr: d.fullNameAr,
      title: d.title,
      departmentId: d.departmentId,
      bio: d.bio,
      yearsExperience: d.yearsExperience,
      isAcceptingPatients: d.isAcceptingPatients,
    });
    setFormOpen(true);
  }
  function openAvailability(d: DoctorRow) {
    setAvailDoctor(d);
    setRows(d.availability.map((a) => ({ ...a })));
    setAvailOpen(true);
  }

  async function saveDoctor() {
    setSaving(true);
    try {
      const res = await fetch(editing ? `/api/v1/doctors/${editing.id}` : "/api/v1/doctors", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(ar.dash.common.saved);
        setFormOpen(false);
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => null);
      toast.error(json?.error?.message ?? ar.dash.common.saveError);
    } catch {
      toast.error(ar.dash.common.saveError);
    } finally {
      setSaving(false);
    }
  }

  async function saveAvailability() {
    if (!availDoctor) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/doctors/${availDoctor.id}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: rows }),
      });
      if (res.ok) {
        toast.success(ar.dash.doctors.availabilitySaved);
        setAvailOpen(false);
        router.refresh();
        return;
      }
      const json = await res.json().catch(() => null);
      toast.error(json?.error?.message ?? ar.dash.common.saveError);
    } catch {
      toast.error(ar.dash.common.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
            {ar.dash.doctors.title}
          </h1>
          <p className="mt-1 text-muted-ink">{ar.dash.doctors.lead}</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="size-4" />
          {ar.dash.doctors.add}
        </Button>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ar.dash.doctors.columns.name}</TableHead>
              <TableHead>{ar.dash.doctors.columns.title}</TableHead>
              <TableHead>{ar.dash.doctors.columns.department}</TableHead>
              <TableHead>{ar.dash.doctors.columns.experience}</TableHead>
              <TableHead>{ar.dash.doctors.columns.accepting}</TableHead>
              <TableHead className="text-end">{ar.dash.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-ink">
                  {ar.dash.doctors.empty}
                </TableCell>
              </TableRow>
            ) : (
              doctors.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium text-ink">{d.fullNameAr}</TableCell>
                  <TableCell>{d.title}</TableCell>
                  <TableCell>{d.departmentNameAr}</TableCell>
                  <TableCell className="font-data tabular-nums">
                    {d.yearsExperience}
                  </TableCell>
                  <TableCell>
                    {d.isAcceptingPatients ? (
                      <Badge variant="secondary">{ar.dash.common.yes}</Badge>
                    ) : (
                      <Badge variant="outline">{ar.dash.common.no}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={ar.dash.doctors.editAvailability}
                        onClick={() => openAvailability(d)}
                      >
                        <CalendarClock className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={ar.dash.common.edit}
                        onClick={() => openEdit(d)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <ConfirmDelete
                        url={`/api/v1/doctors/${d.id}`}
                        description={ar.dash.doctors.deleteBlocked}
                        iconOnly
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Doctor form */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? ar.dash.doctors.edit : ar.dash.doctors.add}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{ar.dash.doctors.fields.slug}</Label>
              <Input
                value={form.slug}
                dir="ltr"
                className="text-start"
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{ar.dash.doctors.fields.fullNameAr}</Label>
                <Input
                  value={form.fullNameAr}
                  onChange={(e) => setForm({ ...form, fullNameAr: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{ar.dash.doctors.fields.title}</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{ar.dash.doctors.fields.department}</Label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className={selectClass}
              >
                {departments.map((dep) => (
                  <option key={dep.id} value={dep.id}>
                    {dep.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>{ar.dash.doctors.fields.bio}</Label>
              <Textarea
                value={form.bio}
                rows={4}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 items-end gap-3">
              <div className="space-y-1.5">
                <Label>{ar.dash.doctors.fields.yearsExperience}</Label>
                <Input
                  type="number"
                  min={0}
                  max={70}
                  value={form.yearsExperience}
                  className="font-data"
                  onChange={(e) =>
                    setForm({ ...form, yearsExperience: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <label className="flex items-center gap-2 pb-2.5">
                <Checkbox
                  checked={form.isAcceptingPatients}
                  onCheckedChange={(v) =>
                    setForm({ ...form, isAcceptingPatients: v === true })
                  }
                />
                <span className="text-sm text-ink">
                  {ar.dash.doctors.fields.isAcceptingPatients}
                </span>
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveDoctor} disabled={saving}>
              {saving ? ar.dash.common.saving : ar.dash.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Availability editor */}
      <Dialog open={availOpen} onOpenChange={setAvailOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {ar.dash.doctors.availability}
              {availDoctor ? ` — ${availDoctor.fullNameAr}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-ink">{ar.doctors.availabilityNone}</p>
            ) : (
              rows.map((row, i) => (
                <div key={i} className="flex flex-wrap items-end gap-2 rounded-md border border-line p-3">
                  <div className="space-y-1">
                    <Label className="text-xs">{ar.dash.doctors.fields.dayOfWeek}</Label>
                    <select
                      value={row.dayOfWeek}
                      onChange={(e) => updateRow(rows, setRows, i, { dayOfWeek: Number(e.target.value) })}
                      className="h-9 rounded-md border border-input bg-card px-2 text-sm"
                    >
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                        <option key={day} value={day}>
                          {weekdayName(day)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{ar.dash.doctors.fields.startTime}</Label>
                    <Input
                      type="time"
                      value={row.startTime}
                      className="h-9 w-28 font-data"
                      dir="ltr"
                      onChange={(e) => updateRow(rows, setRows, i, { startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{ar.dash.doctors.fields.endTime}</Label>
                    <Input
                      type="time"
                      value={row.endTime}
                      className="h-9 w-28 font-data"
                      dir="ltr"
                      onChange={(e) => updateRow(rows, setRows, i, { endTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{ar.dash.doctors.fields.slotMinutes}</Label>
                    <Input
                      type="number"
                      min={5}
                      max={240}
                      value={row.slotMinutes}
                      className="h-9 w-20 font-data"
                      onChange={(e) =>
                        updateRow(rows, setRows, i, { slotMinutes: Number(e.target.value) || 30 })
                      }
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={ar.dash.doctors.removeRow}
                    onClick={() => setRows(rows.filter((_, j) => j !== i))}
                  >
                    <Trash2 className="size-4 text-st-cancelled" />
                  </Button>
                </div>
              ))
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setRows([
                  ...rows,
                  { dayOfWeek: 0, startTime: "08:00", endTime: "14:00", slotMinutes: 30 },
                ])
              }
            >
              <Plus className="size-4" />
              {ar.dash.doctors.addRow}
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={saveAvailability} disabled={saving}>
              {saving ? ar.dash.common.saving : ar.dash.common.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function updateRow(
  rows: AvailabilityRow[],
  setRows: (r: AvailabilityRow[]) => void,
  index: number,
  patch: Partial<AvailabilityRow>,
) {
  setRows(rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
}
