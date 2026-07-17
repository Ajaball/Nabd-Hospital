"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { DeptIcon } from "@/components/nabd/DeptIcon";
import { ar } from "@/content/ar";

export type DepartmentRow = {
  id: string;
  slug: string;
  nameAr: string;
  descriptionAr: string;
  icon: string;
  isActive: boolean;
  sortOrder: number;
  doctorCount: number;
};

const ICON_CHOICES = ["stethoscope", "baby", "bone", "scan", "smile", "siren"];

type FormState = {
  slug: string;
  nameAr: string;
  descriptionAr: string;
  icon: string;
  isActive: boolean;
};

const empty: FormState = {
  slug: "",
  nameAr: "",
  descriptionAr: "",
  icon: "stethoscope",
  isActive: true,
};

export function DepartmentsManager({ departments }: { departments: DepartmentRow[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentRow | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  }
  function openEdit(d: DepartmentRow) {
    setEditing(d);
    setForm({
      slug: d.slug,
      nameAr: d.nameAr,
      descriptionAr: d.descriptionAr,
      icon: d.icon,
      isActive: d.isActive,
    });
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/v1/departments/${editing.id}` : "/api/v1/departments",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (res.ok) {
        toast.success(ar.dash.common.saved);
        setOpen(false);
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

  function patch(id: string, data: Record<string, unknown>) {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/v1/departments/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (res.ok) router.refresh();
        else toast.error(ar.dash.common.saveError);
      } catch {
        toast.error(ar.dash.common.saveError);
      }
    });
  }

  // Swap the two rows' sortOrder values (the list is ordered by sortOrder).
  function swapOrder(a: DepartmentRow, b: DepartmentRow) {
    startTransition(async () => {
      try {
        await Promise.all([
          fetch(`/api/v1/departments/${a.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: b.sortOrder }),
          }),
          fetch(`/api/v1/departments/${b.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: a.sortOrder }),
          }),
        ]);
        router.refresh();
      } catch {
        toast.error(ar.dash.common.saveError);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
            {ar.dash.departments.title}
          </h1>
          <p className="mt-1 text-muted-ink">{ar.dash.departments.lead}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              {ar.dash.departments.add}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing ? ar.dash.departments.edit : ar.dash.departments.add}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Field label={ar.dash.departments.fields.slug}>
                <Input
                  value={form.slug}
                  dir="ltr"
                  className="text-start"
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </Field>
              <Field label={ar.dash.departments.fields.nameAr}>
                <Input
                  value={form.nameAr}
                  onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                />
              </Field>
              <Field label={ar.dash.departments.fields.descriptionAr}>
                <Textarea
                  value={form.descriptionAr}
                  onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
                />
              </Field>
              <Field label={ar.dash.departments.fields.icon}>
                <select
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className="h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                >
                  {ICON_CHOICES.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                </select>
              </Field>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v === true })}
                />
                <span className="text-sm text-ink">
                  {ar.dash.departments.fields.isActive}
                </span>
              </label>
            </div>
            <DialogFooter>
              <Button onClick={save} disabled={saving}>
                {saving ? ar.dash.common.saving : ar.dash.common.save}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 rounded-lg border border-line bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ar.dash.departments.columns.name}</TableHead>
              <TableHead>{ar.dash.departments.columns.doctors}</TableHead>
              <TableHead>{ar.dash.departments.columns.status}</TableHead>
              <TableHead>{ar.dash.departments.columns.order}</TableHead>
              <TableHead className="text-end">{ar.dash.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-ink">
                  {ar.dash.departments.empty}
                </TableCell>
              </TableRow>
            ) : (
              departments.map((d, i) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex size-8 items-center justify-center rounded-md bg-mint text-teal">
                        <DeptIcon name={d.icon} className="size-4" />
                      </span>
                      <span className="font-medium text-ink">{d.nameAr}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-data tabular-nums">{d.doctorCount}</TableCell>
                  <TableCell>
                    {d.isActive ? (
                      <Badge variant="secondary">{ar.dash.departments.active}</Badge>
                    ) : (
                      <Badge variant="outline">{ar.dash.departments.inactive}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={ar.dash.departments.moveUp}
                        disabled={i === 0}
                        onClick={() => swapOrder(d, departments[i - 1])}
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={ar.dash.departments.moveDown}
                        disabled={i === departments.length - 1}
                        onClick={() => swapOrder(d, departments[i + 1])}
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          patch(d.id, { isActive: !d.isActive })
                        }
                      >
                        {d.isActive
                          ? ar.dash.departments.deactivate
                          : ar.dash.departments.activate}
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
                        url={`/api/v1/departments/${d.id}`}
                        description={ar.dash.departments.deleteBlocked}
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
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
