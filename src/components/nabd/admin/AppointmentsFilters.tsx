"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppointmentStatus } from "@prisma/client";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ar } from "@/content/ar";

const STATUSES = Object.values(AppointmentStatus);

const selectClass =
  "h-10 rounded-md border border-input bg-card px-3 text-sm text-ink focus-visible:border-teal focus-visible:outline-none";

export function AppointmentsFilters({
  departments,
  current,
}: {
  departments: { slug: string; nameAr: string }[];
  current: { status?: string; dept?: string; q?: string };
}) {
  const router = useRouter();
  const [q, setQ] = useState(current.q ?? "");

  function navigate(patch: Record<string, string>) {
    const sp = new URLSearchParams();
    const next = { status: current.status, dept: current.dept, q: current.q, ...patch };
    for (const [k, v] of Object.entries(next)) if (v) sp.set(k, v);
    sp.delete("page");
    router.push(`/dashboard/appointments?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate({ q });
        }}
        className="relative min-w-56 flex-1"
      >
        <Search
          className="pointer-events-none absolute inset-inline-start-3 top-1/2 size-4 -translate-y-1/2 text-muted-ink"
          aria-hidden="true"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={ar.admin.appointments.searchPlaceholder}
          className="ps-9"
          aria-label={ar.admin.common.search}
        />
      </form>

      <select
        value={current.status ?? ""}
        onChange={(e) => navigate({ status: e.target.value })}
        className={selectClass}
        aria-label={ar.admin.common.status}
      >
        <option value="">{ar.admin.common.status}: {ar.admin.common.all}</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {ar.statuses[s]}
          </option>
        ))}
      </select>

      <select
        value={current.dept ?? ""}
        onChange={(e) => navigate({ dept: e.target.value })}
        className={selectClass}
        aria-label={ar.admin.common.department}
      >
        <option value="">{ar.admin.common.department}: {ar.admin.common.all}</option>
        {departments.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.nameAr}
          </option>
        ))}
      </select>
    </div>
  );
}
