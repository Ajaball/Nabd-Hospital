import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { DepartmentIcon } from "@/components/nabd/DepartmentIcon";
import { DoctorCard } from "@/components/nabd/DoctorCard";
import { buttonVariants } from "@/components/ui/button";
import {
  getDepartmentBySlug,
  getDoctorsByDepartment,
} from "@/lib/services/public";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);
  if (!department) return {};
  return {
    title: department.nameAr,
    description: ar.build.departmentMetaDescription(department.nameAr),
  };
}

export default async function DepartmentDetailPage({ params }: Params) {
  const { slug } = await params;
  const department = await getDepartmentBySlug(slug);
  if (!department) notFound();

  const doctors = await getDoctorsByDepartment(department.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <Link
        href="/departments"
        className="inline-flex items-center gap-1 text-sm font-medium text-teal transition-colors hover:brightness-90"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {ar.actions.backToDepartments}
      </Link>

      <header className="mt-6">
        <PulseTrace variant="rule" className="mb-6" />
        <div className="flex items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-mint text-teal">
            <DepartmentIcon name={department.icon} className="size-7" />
          </span>
          <div>
            <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink sm:text-[2.75rem]">
              {department.nameAr}
            </h1>
          </div>
        </div>
        <p className="mt-5 max-w-3xl text-lg leading-loose text-ink/85">
          {department.descriptionAr}
        </p>
        <Link
          href={`/book?dept=${department.slug}`}
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "mt-6")}
        >
          {ar.departmentDetail.bookCta}
        </Link>
      </header>

      <section className="mt-14">
        <PulseTrace variant="rule" className="mb-6" />
        <h2 className="text-xl font-bold tracking-[-0.01em] text-ink sm:text-2xl">
          {ar.build.doctorsInDepartment(department.nameAr)}
        </h2>

        {doctors.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} showDepartment={false} />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-lg border border-line bg-card p-8 text-center text-muted-ink">
            {ar.departmentDetail.doctorsEmpty}
          </p>
        )}
      </section>
    </div>
  );
}
