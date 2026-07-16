import Link from "next/link";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SectionHeading } from "@/components/nabd/SectionHeading";
import { DepartmentCard } from "@/components/nabd/DepartmentCard";
import { DoctorCard } from "@/components/nabd/DoctorCard";
import { NewsCard } from "@/components/nabd/NewsCard";
import { buttonVariants } from "@/components/ui/button";
import {
  getDepartments,
  getFeaturedDoctors,
  getLatestNews,
} from "@/lib/services/public";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [departments, doctors, news] = await Promise.all([
    getDepartments(),
    getFeaturedDoctors(3),
    getLatestNews(3),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center py-16 text-center sm:py-24">
        <PulseTrace
          variant="hero"
          label={ar.site.name}
          className="mb-10 h-24 w-full max-w-xl"
        />
        <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink sm:text-[2.75rem]">
          {ar.home.heroTitle}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-loose text-muted-ink sm:text-lg">
          {ar.home.heroLead}
        </p>
        <Link
          href="/book"
          className={cn(buttonVariants({ variant: "default", size: "lg" }), "mt-9")}
        >
          {ar.actions.bookAppointment}
        </Link>
      </section>

      {/* Departments — wayfinding directory board */}
      <section className="py-10">
        <SectionHeading
          title={ar.home.deptsTitle}
          lead={ar.home.deptsLead}
          action={{ href: "/departments", label: ar.actions.viewAllDepartments }}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department) => (
            <DepartmentCard key={department.id} department={department} />
          ))}
        </div>
      </section>

      {/* Featured doctors */}
      <section className="py-10">
        <SectionHeading
          title={ar.home.doctorsTitle}
          lead={ar.home.doctorsLead}
          action={{ href: "/doctors", label: ar.actions.viewAllDoctors }}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      </section>

      {/* Latest news */}
      {news.length > 0 ? (
        <section className="py-10">
          <SectionHeading title={ar.home.newsTitle} lead={ar.home.newsLead} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
