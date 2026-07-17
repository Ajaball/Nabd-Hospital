"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;

const selectClass =
  "h-10 rounded-md border border-input bg-card px-3 text-sm text-ink focus-visible:border-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal";

/**
 * URL-driven filters for the appointments table (PHASES §5: filtering via URL
 * search params, not client state). Changing a select or submitting the search
 * navigates with updated params and resets to page 1.
 */
export function AppointmentFilters({
  departments,
  doctors,
}: {
  departments: { slug: string; nameAr: string }[];
  doctors: { id: string; fullNameAr: string }[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    sp.delete("page");
    router.push(`/dashboard/appointments?${sp.toString()}`);
  }

  const hasFilters =
    params.get("status") || params.get("dept") || params.get("doctor") || params.get("q");

  return (
    <div className="flex flex-wrap items-center gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ q });
        }}
        className="flex items-center gap-2"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-muted-ink" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={ar.dash.appointments.searchPlaceholder}
            className="w-56 ps-9"
          />
        </div>
        <Button type="submit" variant="outline" size="sm">
          {ar.dash.common.search}
        </Button>
      </form>

      <select
        aria-label={ar.dash.appointments.filterStatus}
        value={params.get("status") ?? ""}
        onChange={(e) => update({ status: e.target.value })}
        className={selectClass}
      >
        <option value="">{ar.dash.appointments.filterStatus}</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {ar.status[s]}
          </option>
        ))}
      </select>

      <select
        aria-label={ar.dash.appointments.filterDepartment}
        value={params.get("dept") ?? ""}
        onChange={(e) => update({ dept: e.target.value })}
        className={selectClass}
      >
        <option value="">{ar.dash.appointments.filterDepartment}</option>
        {departments.map((d) => (
          <option key={d.slug} value={d.slug}>
            {d.nameAr}
          </option>
        ))}
      </select>

      <select
        aria-label={ar.dash.appointments.filterDoctor}
        value={params.get("doctor") ?? ""}
        onChange={(e) => update({ doctor: e.target.value })}
        className={selectClass}
      >
        <option value="">{ar.dash.appointments.filterDoctor}</option>
        {doctors.map((d) => (
          <option key={d.id} value={d.id}>
            {d.fullNameAr}
          </option>
        ))}
      </select>

      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/appointments")}
        >
          <X className="size-4" />
          {ar.dash.common.clearFilters}
        </Button>
      ) : null}
    </div>
  );
}
