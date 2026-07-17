import type { Metadata } from "next";
import Link from "next/link";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SectionHeading } from "@/components/nabd/SectionHeading";
import { DoctorCard } from "@/components/nabd/DoctorCard";
import { getActiveDepartments, getDoctors } from "@/lib/queries";
import { cn } from "@/lib/utils";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.doctors.title,
  description: ar.metadata.doctors.description,
};

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ dept?: string }>;
}) {
  const { dept } = await searchParams;
  const [departments, doctors] = await Promise.all([
    getActiveDepartments(),
    getDoctors(dept),
  ]);

  // Guard: an unknown ?dept still renders "all" rather than an empty page.
  const activeDept = departments.some((d) => d.slug === dept) ? dept : undefined;

  const chips = [
    { slug: undefined, label: ar.common.all },
    ...departments.map((d) => ({ slug: d.slug, label: d.nameAr })),
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading as="h1" title={ar.doctors.title} lead={ar.doctors.lead} />
      <PulseTrace variant="rule" className="my-10" />

      <div>
        <h2 className="sr-only">{ar.doctors.filterLabel}</h2>
        <ul className="flex flex-wrap gap-2">
          {chips.map((chip) => {
            const isActive = chip.slug === activeDept;
            return (
              <li key={chip.slug ?? "all"}>
                <Link
                  href={chip.slug ? `/doctors?dept=${chip.slug}` : "/doctors"}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal",
                    isActive
                      ? "border-teal bg-teal text-paper"
                      : "border-line bg-card text-ink hover:border-teal hover:text-teal",
                  )}
                >
                  {chip.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doc) => (
          <DoctorCard
            key={doc.id}
            slug={doc.slug}
            fullNameAr={doc.fullNameAr}
            title={doc.title}
            departmentNameAr={doc.department.nameAr}
            yearsExperience={doc.yearsExperience}
            isAcceptingPatients={doc.isAcceptingPatients}
          />
        ))}
      </div>
    </main>
  );
}
