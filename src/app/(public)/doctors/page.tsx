import type { Metadata } from "next";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { DoctorCard } from "@/components/nabd/DoctorCard";
import { DepartmentFilter } from "@/components/nabd/DepartmentFilter";
import { getDepartments, getDoctors } from "@/lib/services/public";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.doctors.title,
  description: ar.metadata.doctors.description,
};

type SearchParams = { searchParams: Promise<{ dept?: string }> };

export default async function DoctorsPage({ searchParams }: SearchParams) {
  const { dept } = await searchParams;
  const [departments, doctors] = await Promise.all([
    getDepartments(),
    getDoctors(dept),
  ]);

  // Only treat the filter as active when the slug is a real department.
  const activeSlug = departments.some((d) => d.slug === dept) ? dept : undefined;
  const isFiltered = Boolean(activeSlug);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <PulseTrace variant="rule" className="mb-6" />
        <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink sm:text-[2.75rem]">
          {ar.doctors.title}
        </h1>
        <p className="mt-4 text-lg leading-loose text-muted-ink">
          {ar.doctors.lead}
        </p>
      </header>

      <div className="mt-8">
        <DepartmentFilter departments={departments} activeSlug={activeSlug} />
      </div>

      {doctors.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      ) : (
        <p className="mt-8 rounded-lg border border-line bg-card p-8 text-center text-muted-ink">
          {isFiltered ? ar.doctors.emptyFiltered : ar.doctors.empty}
        </p>
      )}
    </div>
  );
}
