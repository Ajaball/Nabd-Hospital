import type { Metadata } from "next";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SectionHeading } from "@/components/nabd/SectionHeading";
import { DepartmentCard } from "@/components/nabd/DepartmentCard";
import { getDepartmentsWithDoctorCount } from "@/lib/queries";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.departments.title,
  description: ar.metadata.departments.description,
};

export default async function DepartmentsPage() {
  const departments = await getDepartmentsWithDoctorCount();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading as="h1" title={ar.departments.title} lead={ar.departments.lead} />
      <PulseTrace variant="rule" className="my-10" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {departments.map((d) => (
          <DepartmentCard
            key={d.id}
            slug={d.slug}
            nameAr={d.nameAr}
            descriptionAr={d.descriptionAr}
            icon={d.icon}
            doctorCount={d._count.doctors}
          />
        ))}
      </div>
    </main>
  );
}
