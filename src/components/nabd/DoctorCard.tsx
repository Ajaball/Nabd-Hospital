import Link from "next/link";
import { UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { ar } from "@/content/ar";

type Props = {
  slug: string;
  fullNameAr: string;
  title: string;
  departmentNameAr: string;
  yearsExperience: number;
  isAcceptingPatients: boolean;
};

export function DoctorCard({
  slug,
  fullNameAr,
  title,
  departmentNameAr,
  yearsExperience,
  isAcceptingPatients,
}: Props) {
  return (
    <Link
      href={`/doctors/${slug}`}
      className="group flex h-full flex-col rounded-lg border border-line bg-card p-6 transition-colors hover:border-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      <div className="flex items-start gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-mint text-teal">
          <UserRound className="size-6" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-ink group-hover:text-teal">
            {fullNameAr}
          </h3>
          <p className="text-sm text-muted-ink">{title}</p>
        </div>
      </div>

      <dl className="mt-4 flex flex-1 flex-col gap-1.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-ink">{ar.doctors.inDepartment}</dt>
          <dd className="font-medium text-ink">{departmentNameAr}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-ink">{ar.doctors.experience}</dt>
          <dd className="text-ink">
            <span className="font-data tabular-nums">{yearsExperience}</span>{" "}
            {ar.common.yearsExperienceSuffix}
          </dd>
        </div>
      </dl>

      <span
        className={cn(
          "mt-4 inline-flex w-fit items-center rounded-sm border-s-[3px] px-2 py-0.5 text-xs font-medium",
          isAcceptingPatients
            ? "border-s-st-confirmed bg-st-confirmed/8 text-st-confirmed"
            : "border-s-st-completed bg-st-completed/8 text-st-completed",
        )}
      >
        {isAcceptingPatients ? ar.doctors.accepting : ar.doctors.notAccepting}
      </span>
    </Link>
  );
}
