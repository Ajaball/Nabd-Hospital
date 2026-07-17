"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Eye } from "lucide-react";
import type { AppointmentStatus, Gender } from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { StatusBadge } from "@/components/nabd/StatusBadge";
import { formatISODate, formatTime } from "@/lib/datetime";
import { ar } from "@/content/ar";

export type PatientAppt = {
  id: string;
  startsAt: string;
  doctorNameAr: string;
  departmentNameAr: string;
  status: AppointmentStatus;
};

export type PatientRow = {
  id: string;
  fileNumber: string;
  fullName: string;
  phone: string;
  gender: Gender;
  appointments: PatientAppt[];
};

export function PatientsManager({ patients }: { patients: PatientRow[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [active, setActive] = useState<PatientRow | null>(null);

  function search() {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    router.push(`/dashboard/patients${sp.toString() ? `?${sp}` : ""}`);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
        {ar.dash.patients.title}
      </h1>
      <p className="mt-1 text-muted-ink">{ar.dash.patients.lead}</p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="mt-6 flex items-center gap-2"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-ink" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ar.dash.patients.searchPlaceholder}
            className="w-64 ps-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          {ar.dash.common.search}
        </Button>
      </form>

      <div className="mt-4 rounded-lg border border-line bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{ar.dash.patients.columns.fileNumber}</TableHead>
              <TableHead>{ar.dash.patients.columns.name}</TableHead>
              <TableHead>{ar.dash.patients.columns.phone}</TableHead>
              <TableHead>{ar.dash.patients.columns.gender}</TableHead>
              <TableHead>{ar.dash.patients.columns.appointments}</TableHead>
              <TableHead className="text-end">{ar.dash.common.actions}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-ink">
                  {ar.dash.patients.empty}
                </TableCell>
              </TableRow>
            ) : (
              patients.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-data tabular-nums">{p.fileNumber}</TableCell>
                  <TableCell className="text-ink">{p.fullName}</TableCell>
                  <TableCell className="font-data tabular-nums" dir="ltr">
                    {p.phone}
                  </TableCell>
                  <TableCell>{ar.auth.gender[p.gender === "MALE" ? "male" : "female"]}</TableCell>
                  <TableCell className="font-data tabular-nums">
                    {p.appointments.length}
                  </TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActive(p)}
                      aria-label={ar.dash.patients.historyTitle}
                    >
                      <Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Sheet open={active !== null} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent side="end" className="w-full max-w-lg overflow-y-auto">
          {active ? (
            <>
              <SheetHeader>
                <SheetTitle>{active.fullName}</SheetTitle>
                <SheetDescription>
                  {ar.dash.patients.columns.fileNumber}:{" "}
                  <span className="font-data">{active.fileNumber}</span>
                </SheetDescription>
              </SheetHeader>
              <h3 className="mt-4 text-sm font-semibold text-ink">
                {ar.dash.patients.historyTitle}
              </h3>
              {active.appointments.length === 0 ? (
                <p className="mt-2 text-sm text-muted-ink">{ar.dash.patients.noHistory}</p>
              ) : (
                <ul className="mt-2 divide-y divide-line">
                  {active.appointments.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="font-data text-sm tabular-nums text-ink">
                          {formatISODate(new Date(a.startsAt))} {formatTime(new Date(a.startsAt))}
                        </p>
                        <p className="text-sm text-muted-ink">
                          {a.doctorNameAr} — {a.departmentNameAr}
                        </p>
                      </div>
                      <StatusBadge status={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
