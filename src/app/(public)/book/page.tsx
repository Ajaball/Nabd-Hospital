import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { BookingStepper, type BookingStep } from "@/components/nabd/BookingStepper";
import { BookingDateTime } from "@/components/nabd/BookingDateTime";
import { DepartmentIcon } from "@/components/nabd/DepartmentIcon";
import { auth } from "@/lib/auth";
import { getDepartments, getDoctors, getDoctorBySlug } from "@/lib/services/public";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.book.title,
  description: ar.metadata.book.description,
};

type SearchParams = Promise<{
  step?: string;
  dept?: string;
  doctor?: string;
  date?: string;
  slot?: string;
}>;

export default async function BookPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const departments = await getDepartments();
  const department = sp.dept
    ? departments.find((d) => d.slug === sp.dept)
    : undefined;

  // Resolve the doctor only when it belongs to the chosen department.
  const doctor =
    department && sp.doctor ? await getDoctorBySlug(sp.doctor) : null;
  const doctorValid = Boolean(
    doctor && doctor.department.slug === department?.slug,
  );

  let current: BookingStep = "department";
  if (department && doctorValid) current = "datetime";
  else if (department) current = "doctor";

  const session = await auth();
  const isAuthenticated = session?.user?.role === "PATIENT";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="mb-8">
        <PulseTrace variant="rule" className="mb-6" />
        <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink sm:text-[2.75rem]">
          {ar.booking.title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-muted-ink">
          {ar.booking.lead}
        </p>
      </header>

      <div className="mb-10 overflow-x-auto">
        <BookingStepper current={current} />
      </div>

      {/* Step 1: department */}
      {current === "department" ? (
        <section>
          <h2 className="mb-4 text-lg font-semibold text-ink">
            {ar.booking.chooseDepartment}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((d) => (
              <Link
                key={d.id}
                href={`/book?step=doctor&dept=${d.slug}`}
                className="group flex items-center gap-4 rounded-lg border border-line bg-card p-5 transition-colors hover:border-teal"
              >
                <span className="flex size-11 items-center justify-center rounded-md bg-mint text-teal">
                  <DepartmentIcon name={d.icon} className="size-5" />
                </span>
                <span className="font-semibold text-ink group-hover:text-teal">
                  {d.nameAr}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Step 2: doctor */}
      {current === "doctor" && department ? (
        <DoctorStep departmentSlug={department.slug} departmentNameAr={department.nameAr} />
      ) : null}

      {/* Step 3: date + slot */}
      {current === "datetime" && department && doctor ? (
        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-ink">
                {doctor.fullNameAr}
              </h2>
              <p className="text-sm text-muted-ink">
                {doctor.title} · {department.nameAr}
              </p>
            </div>
            <Link
              href={`/book?step=doctor&dept=${department.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-teal transition-colors hover:brightness-90"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              {ar.booking.changeDoctor}
            </Link>
          </div>
          <BookingDateTime
            doctorId={doctor.id}
            doctorSlug={doctor.slug}
            doctorNameAr={doctor.fullNameAr}
            doctorTitle={doctor.title}
            departmentNameAr={department.nameAr}
            deptSlug={department.slug}
            initialDate={sp.date}
            initialSlot={sp.slot}
            isAuthenticated={isAuthenticated}
          />
        </section>
      ) : null}
    </div>
  );
}

async function DoctorStep({
  departmentSlug,
  departmentNameAr,
}: {
  departmentSlug: string;
  departmentNameAr: string;
}) {
  const doctors = await getDoctors(departmentSlug);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ink">
          {ar.booking.chooseDoctor} · {departmentNameAr}
        </h2>
        <Link
          href="/book"
          className="inline-flex items-center gap-1 text-sm font-medium text-teal transition-colors hover:brightness-90"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {ar.booking.changeDepartment}
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doctors.map((doc) => (
          <Link
            key={doc.id}
            href={`/book?step=datetime&dept=${departmentSlug}&doctor=${doc.slug}`}
            className="group flex h-full flex-col gap-1 rounded-lg border border-line bg-card p-5 transition-colors hover:border-teal"
          >
            <span className="font-semibold text-ink group-hover:text-teal">
              {doc.fullNameAr}
            </span>
            <span className="text-sm text-muted-ink">{doc.title}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
