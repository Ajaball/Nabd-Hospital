import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DepartmentIcon } from "@/components/nabd/DepartmentIcon";
import type { Department } from "@prisma/client";

/**
 * A wayfinding directory tile (CLAUDE.md §4 — clinical signage, directional).
 * The whole card is the link into the department; the arrow points along the
 * reading direction (inline-start under RTL).
 */
export function DepartmentCard({ department }: { department: Department }) {
  return (
    <Link
      href={`/departments/${department.slug}`}
      className="group flex h-full flex-col gap-4 rounded-lg border border-line bg-card p-6 transition-colors hover:border-teal focus-visible:border-teal"
    >
      <div className="flex items-center justify-between">
        <span className="flex size-12 items-center justify-center rounded-md bg-mint text-teal">
          <DepartmentIcon name={department.icon} />
        </span>
        <ArrowLeft
          className="size-5 text-line transition-colors group-hover:text-teal"
          aria-hidden="true"
        />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-semibold text-ink">{department.nameAr}</h3>
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-ink">
          {department.descriptionAr}
        </p>
      </div>
    </Link>
  );
}
