"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppointmentStatus, Gender } from "@prisma/client";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatusBadge } from "@/components/nabd/StatusBadge";
import { ar } from "@/content/ar";
import { formatDate, formatTime } from "@/lib/datetime";

export type PatientRow = {
  id: string;
  fileNumber: string;
  fullName: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string;
  count: number;
  history: {
    id: string;
    startsAt: string;
    status: AppointmentStatus;
    doctorNameAr: string;
    departmentNameAr: string;
  }[];
};

export function PatientsTable({
  patients,
  q,
}: {
  patients: PatientRow[];
  q?: string;
}) {
  const router = useRouter();
  const [term, setTerm] = useState(q ?? "");
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = patients.find((p) => p.id === openId) ?? null;

  const genderLabel = (g: Gender) =>
    g === "MALE" ? ar.auth.register.genderMale : ar.auth.register.genderFemale;

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const sp = new URLSearchParams();
          if (term) sp.set("q", term);
          router.push(`/dashboard/patients?${sp.toString()}`);
        }}
        className="relative max-w-sm"
      >
        <Search
          className="pointer-events-none absolute inset-inline-start-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink"
          aria-hidden="true"
        />
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={ar.admin.patients.searchPlaceholder}
          className="ps-9"
          aria-label={ar.admin.common.search}
        />
      </form>

      <div className="overflow-x-auto rounded-lg border border-line bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line bg-mint/40">
              <th className="px-4 py-3 text-start font-semibold text-ink">
                {ar.admin.patients.colName}
              </th>
              <th className="px-4 py-3 text-start font-semibold text-ink">
                {ar.admin.patients.colFileNumber}
              </th>
              <th className="px-4 py-3 text-start font-semibold text-ink">
                {ar.admin.patients.colPhone}
              </th>
              <th className="px-4 py-3 text-start font-semibold text-ink">
                {ar.admin.patients.colAppointments}
              </th>
              <th className="px-4 py-3 text-end font-semibold text-ink">
                {ar.admin.common.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-mint/20">
                <td className="px-4 py-3 font-medium text-ink">{p.fullName}</td>
                <td className="px-4 py-3 font-data text-muted-ink">{p.fileNumber}</td>
                <td className="px-4 py-3 font-data text-muted-ink" dir="ltr">
                  {p.phone}
                </td>
                <td className="px-4 py-3 font-data text-ink">{p.count}</td>
                <td className="px-4 py-3 text-end">
                  <Button variant="outline" size="sm" onClick={() => setOpenId(p.id)}>
                    {ar.admin.patients.view}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 ? (
          <p className="px-5 py-10 text-center text-muted-ink">
            {ar.admin.patients.empty}
          </p>
        ) : null}
      </div>

      <Sheet open={openId !== null} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-96 max-w-[90vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{ar.admin.patients.detailTitle}</SheetTitle>
          </SheetHeader>
          {selected ? (
            <div className="space-y-5">
              <div className="space-y-1">
                <div className="text-lg font-semibold text-ink">{selected.fullName}</div>
                <div className="font-data text-sm text-muted-ink">
                  {selected.fileNumber}
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <Field label={ar.admin.patients.gender}>{genderLabel(selected.gender)}</Field>
                <Field label={ar.admin.patients.dateOfBirth} mono>
                  {formatDate(new Date(selected.dateOfBirth))}
                </Field>
              </dl>

              <div>
                <h3 className="mb-2 text-sm font-semibold text-ink">
                  {ar.admin.patients.historyTitle}
                </h3>
                {selected.history.length > 0 ? (
                  <ul className="space-y-2">
                    {selected.history.map((h) => (
                      <li
                        key={h.id}
                        className="rounded-md border border-line p-3 text-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-ink">{h.doctorNameAr}</span>
                          <StatusBadge status={h.status} />
                        </div>
                        <div className="mt-1 text-muted-ink">{h.departmentNameAr}</div>
                        <div className="mt-1 font-data text-xs text-muted-ink">
                          {formatDate(new Date(h.startsAt))} · {formatTime(new Date(h.startsAt))}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-ink">{ar.admin.patients.noHistory}</p>
                )}
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Field({
  label,
  children,
  mono,
}: {
  label: string;
  children: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="text-xs text-muted-ink">{label}</dt>
      <dd className={mono ? "font-data text-ink" : "text-ink"}>{children}</dd>
    </div>
  );
}
