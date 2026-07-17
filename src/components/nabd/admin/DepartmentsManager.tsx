"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";

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
import { DepartmentIcon } from "@/components/nabd/DepartmentIcon";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

export type DeptRow = {
  id: string;
  slug: string;
  nameAr: string;
  descriptionAr: string;
  icon: string;
  isActive: boolean;
  doctorCount: number;
};

type Editing =
  | { mode: "create" }
  | { mode: "edit"; dept: DeptRow }
  | null;

export function DepartmentsManager({ departments }: { departments: DeptRow[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Editing>(null);
  const [busy, setBusy] = useState(false);

  async function send(url: string, method: string, body: unknown) {
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        toast.success(ar.toasts.departmentUpdated);
        setEditing(null);
        router.refresh();
      } else {
        toast.error(ar.toasts.genericError);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing({ mode: "create" })}>
          {ar.admin.common.create}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line bg-mint/40">
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.departments.colName}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.departments.colDoctors}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.departments.colOrder}</th>
              <th className="px-4 py-3 text-start font-semibold text-ink">{ar.admin.departments.colActive}</th>
              <th className="px-4 py-3 text-end font-semibold text-ink">{ar.admin.common.actions}</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d, i) => (
              <tr key={d.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex size-8 items-center justify-center rounded-md bg-mint text-teal">
                      <DepartmentIcon name={d.icon} className="size-4" />
                    </span>
                    <span className="font-medium text-ink">{d.nameAr}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-data text-muted-ink">{d.doctorCount}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label={ar.admin.departments.moveUp}
                      disabled={busy || i === 0}
                      onClick={() => send(`/api/v1/departments/${d.id}`, "PATCH", { move: "up" })}
                      className="rounded border border-line p-1 text-muted-ink hover:text-teal disabled:opacity-40"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={ar.admin.departments.moveDown}
                      disabled={busy || i === departments.length - 1}
                      onClick={() => send(`/api/v1/departments/${d.id}`, "PATCH", { move: "down" })}
                      className="rounded border border-line p-1 text-muted-ink hover:text-teal disabled:opacity-40"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-sm border-s-[3px] px-2 py-0.5 text-xs font-medium",
                      d.isActive
                        ? "border-s-st-confirmed bg-st-confirmed/8 text-st-confirmed"
                        : "border-s-st-completed bg-st-completed/8 text-st-completed",
                    )}
                  >
                    {d.isActive ? ar.admin.departments.active : ar.admin.departments.inactive}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2.5 text-xs"
                      disabled={busy}
                      onClick={() =>
                        send(`/api/v1/departments/${d.id}`, "PATCH", { isActive: !d.isActive })
                      }
                    >
                      {d.isActive ? ar.admin.departments.deactivate : ar.admin.departments.activate}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs"
                      onClick={() => setEditing({ mode: "edit", dept: d })}
                    >
                      {ar.admin.common.edit}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <SheetContent className="w-96 max-w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editing?.mode === "create" ? ar.admin.common.create : ar.admin.common.edit}
            </SheetTitle>
          </SheetHeader>
          {editing ? (
            <DeptForm
              key={editing.mode === "edit" ? editing.dept.id : "new"}
              dept={editing.mode === "edit" ? editing.dept : undefined}
              busy={busy}
              onSubmit={(values) =>
                editing.mode === "edit"
                  ? send(`/api/v1/departments/${editing.dept.id}`, "PATCH", {
                      nameAr: values.nameAr,
                      descriptionAr: values.descriptionAr,
                      icon: values.icon,
                    })
                  : send("/api/v1/departments", "POST", values)
              }
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function DeptForm({
  dept,
  busy,
  onSubmit,
}: {
  dept?: DeptRow;
  busy: boolean;
  onSubmit: (v: { slug: string; nameAr: string; descriptionAr: string; icon: string }) => void;
}) {
  const [nameAr, setNameAr] = useState(dept?.nameAr ?? "");
  const [descriptionAr, setDescriptionAr] = useState(dept?.descriptionAr ?? "");
  const [icon, setIcon] = useState(dept?.icon ?? "stethoscope");
  const [slug, setSlug] = useState(dept?.slug ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ slug, nameAr, descriptionAr, icon });
      }}
      className="space-y-4"
    >
      {!dept ? (
        <div className="space-y-2">
          <Label htmlFor="slug">slug</Label>
          <Input id="slug" dir="ltr" className="font-data" value={slug} onChange={(e) => setSlug(e.target.value)} required />
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="nameAr">{ar.admin.departments.colName}</Label>
        <Input id="nameAr" value={nameAr} onChange={(e) => setNameAr(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">icon (lucide)</Label>
        <Input id="icon" dir="ltr" className="font-data" value={icon} onChange={(e) => setIcon(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desc">{ar.departmentDetail.aboutTitle}</Label>
        <Textarea id="desc" rows={4} value={descriptionAr} onChange={(e) => setDescriptionAr(e.target.value)} required />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy ? ar.admin.common.saving : ar.admin.common.save}
      </Button>
    </form>
  );
}
