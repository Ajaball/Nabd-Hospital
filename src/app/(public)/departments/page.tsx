import type { Metadata } from "next";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { DepartmentCard } from "@/components/nabd/DepartmentCard";
import { getDepartments } from "@/lib/services/public";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.departments.title,
  description: ar.metadata.departments.description,
};

export default async function DepartmentsPage() {
  const departments = await getDepartments();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <PulseTrace variant="rule" className="mb-6" />
        <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink sm:text-[2.75rem]">
          {ar.departments.title}
        </h1>
        <p className="mt-4 text-lg leading-loose text-muted-ink">
          {ar.departments.lead}
        </p>
      </header>

      {departments.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))}
        </div>
      ) : (
        <p className="mt-10 rounded-lg border border-line bg-card p-8 text-center text-muted-ink">
          {ar.departments.empty}
        </p>
      )}
    </div>
  );
}
