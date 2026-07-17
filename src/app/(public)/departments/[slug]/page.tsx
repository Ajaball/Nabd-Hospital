import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { DeptIcon } from "@/components/nabd/DeptIcon";
import { DoctorCard } from "@/components/nabd/DoctorCard";
import { Button } from "@/components/ui/button";
import { getDepartmentBySlug } from "@/lib/queries";
import { ar } from "@/content/ar";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);
  if (!department) return { title: ar.departments.notFound };
  return {
    title: department.nameAr,
    description: department.descriptionAr,
  };
}

export default async function DepartmentDetailPage({ params }: Params) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);
  if (!department) notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Link
        href="/departments"
        className="inline-flex items-center gap-1 text-sm text-muted-ink transition-colors hover:text-teal"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
        {ar.departments.backToDepartments}
      </Link>

      <div className="mt-6 flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-md bg-mint text-teal">
          <DeptIcon name={department.icon} className="size-7" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink sm:text-3xl">
            {department.nameAr}
          </h1>
          <p className="mt-2 max-w-2xl text-base leading-loose text-muted-ink">
            {department.descriptionAr}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <Button asChild size="lg">
          <Link href={`/book?dept=${department.slug}`}>{ar.departments.bookHere}</Link>
        </Button>
      </div>

      <PulseTrace variant="rule" className="my-10" />

      <h2 className="text-xl font-bold tracking-[-0.01em] text-ink">
        {ar.departments.doctorsHere}
      </h2>
      {department.doctors.length === 0 ? (
        <p className="mt-4 rounded-lg border border-line bg-card p-6 text-muted-ink">
          {ar.departments.noDoctors}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {department.doctors.map((doc) => (
            <DoctorCard
              key={doc.id}
              slug={doc.slug}
              fullNameAr={doc.fullNameAr}
              title={doc.title}
              departmentNameAr={department.nameAr}
              yearsExperience={doc.yearsExperience}
              isAcceptingPatients={doc.isAcceptingPatients}
            />
          ))}
        </div>
      )}
    </main>
  );
}
