import Link from "next/link";
import type { Department } from "@prisma/client";

import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/**
 * The department filter for the doctors board. State lives in the URL search
 * param `dept` (CLAUDE.md §Phase 3 — "URL search param, not client state"), so
 * each option is a plain link and the active one is derived from the request.
 */
export function DepartmentFilter({
  departments,
  activeSlug,
}: {
  departments: Department[];
  activeSlug?: string;
}) {
  const options = [
    { slug: undefined, nameAr: ar.doctors.filterAll },
    ...departments.map((d) => ({ slug: d.slug, nameAr: d.nameAr })),
  ];

  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label={ar.doctors.filterLabel}
    >
      {options.map((option) => {
        const active = option.slug === activeSlug;
        return (
          <Link
            key={option.slug ?? "all"}
            href={option.slug ? `/doctors?dept=${option.slug}` : "/doctors"}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "border-teal bg-teal text-paper"
                : "border-line bg-card text-ink hover:border-teal hover:text-teal",
            )}
          >
            {option.nameAr}
          </Link>
        );
      })}
    </div>
  );
}
