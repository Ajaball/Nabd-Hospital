import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { DeptIcon } from "@/components/nabd/DeptIcon";
import { ar } from "@/content/ar";

type Props = {
  slug: string;
  nameAr: string;
  descriptionAr: string;
  icon: string;
  doctorCount?: number;
};

/**
 * A department as a wayfinding tile — the directory-board language of hospital
 * signage (CLAUDE.md §4). The whole card is the link; the chevron points to the
 * inline-start (leftward in RTL) to signal "go".
 */
export function DepartmentCard({ slug, nameAr, descriptionAr, icon, doctorCount }: Props) {
  return (
    <Link
      href={`/departments/${slug}`}
      className="group flex h-full flex-col rounded-lg border border-line bg-card p-6 transition-[transform,box-shadow,border-color] duration-300 ease-out hover:-translate-y-1 hover:border-teal hover:shadow-clinical focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal"
    >
      <div className="flex items-center justify-between">
        <span className="flex size-12 items-center justify-center rounded-md bg-mint text-teal">
          <DeptIcon name={icon} />
        </span>
        <ChevronLeft className="size-5 text-muted-ink transition-transform group-hover:-translate-x-1 group-hover:text-teal" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-ink">{nameAr}</h3>
      <p className="mt-2 flex-1 text-sm leading-loose text-muted-ink">{descriptionAr}</p>
      {typeof doctorCount === "number" ? (
        <p className="mt-4 text-xs text-muted-ink">
          <span className="font-data tabular-nums">{doctorCount}</span>{" "}
          {ar.common.doctorsCountSuffix}
        </p>
      ) : null}
    </Link>
  );
}
