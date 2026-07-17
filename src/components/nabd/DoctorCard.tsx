import Link from "next/link";
import type { Doctor, Department } from "@prisma/client";

import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

type DoctorWithDepartment = Doctor & { department: Department };

/**
 * A staff-board card. Shows the doctor's name, title, department, experience,
 * and whether they are taking new patients. Experience is data → IBM Plex Mono.
 */
export function DoctorCard({
  doctor,
  showDepartment = true,
}: {
  doctor: DoctorWithDepartment;
  showDepartment?: boolean;
}) {
  return (
    <Link
      href={`/doctors/${doctor.slug}`}
      className="group flex h-full flex-col gap-3 rounded-lg border border-line bg-card p-6 transition-colors hover:border-teal focus-visible:border-teal"
    >
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-ink group-hover:text-teal">
          {doctor.fullNameAr}
        </h3>
        <p className="text-sm text-muted-ink">
          {doctor.title}
          {showDepartment ? ` · ${doctor.department.nameAr}` : ""}
        </p>
      </div>

      <p className="mt-auto flex items-baseline gap-1.5 text-sm text-muted-ink">
        <span className="font-data text-base font-medium text-ink">
          {doctor.yearsExperience}
        </span>
        {ar.common.yearsExperience}
      </p>

      <span
        className={cn(
          "inline-flex w-fit items-center rounded-sm border-s-[3px] bg-mint/60 py-0.5 pe-2 ps-2 text-xs font-medium",
          doctor.isAcceptingPatients
            ? "border-s-st-confirmed text-st-confirmed"
            : "border-s-st-completed text-st-completed",
        )}
      >
        {doctor.isAcceptingPatients ? ar.common.accepting : ar.common.notAccepting}
      </span>
    </Link>
  );
}
