import Link from "next/link";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SectionHeading } from "@/components/nabd/SectionHeading";
import { DepartmentCard } from "@/components/nabd/DepartmentCard";
import { DoctorCard } from "@/components/nabd/DoctorCard";
import { NewsCard } from "@/components/nabd/NewsCard";
import { Button } from "@/components/ui/button";
import {
  getDepartmentsWithDoctorCount,
  getFeaturedDoctors,
  getLatestNews,
} from "@/lib/queries";
import { ar } from "@/content/ar";

export default async function HomePage() {
  const [departments, doctors, news] = await Promise.all([
    getDepartmentsWithDoctorCount(),
    getFeaturedDoctors(3),
    getLatestNews(3),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-4 pt-16 sm:px-6 sm:pt-24">
        <PulseTrace
          variant="hero"
          label={ar.site.name}
          className="mx-auto mb-10 h-24 max-w-2xl sm:h-28"
        />
        <h1 className="text-center text-3xl font-bold tracking-[-0.01em] text-ink sm:text-4xl">
          {ar.home.heroTitle}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-loose text-muted-ink sm:text-lg">
          {ar.home.heroLead}
        </p>
        <div className="mt-8 flex justify-center">
          <Button asChild size="lg">
            <Link href="/book">{ar.actions.bookAppointment}</Link>
          </Button>
        </div>
      </section>

      {/* Departments board */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PulseTrace variant="rule" className="mb-10" />
        <SectionHeading
          title={ar.home.departmentsTitle}
          lead={ar.home.departmentsLead}
        />
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>

      {/* Featured doctors */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PulseTrace variant="rule" className="mb-10" />
        <div className="flex items-end justify-between gap-4">
          <SectionHeading title={ar.home.doctorsTitle} lead={ar.home.doctorsLead} />
          <Button asChild variant="ghost" size="sm" className="hidden shrink-0 sm:inline-flex">
            <Link href="/doctors">{ar.common.viewAll}</Link>
          </Button>
        </div>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {doctors.map((d) => (
            <DoctorCard
              key={d.id}
              slug={d.slug}
              fullNameAr={d.fullNameAr}
              title={d.title}
              departmentNameAr={d.department.nameAr}
              yearsExperience={d.yearsExperience}
              isAcceptingPatients={d.isAcceptingPatients}
            />
          ))}
        </div>
      </section>

      {/* Latest news */}
      {news.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <PulseTrace variant="rule" className="mb-10" />
          <SectionHeading title={ar.home.newsTitle} lead={ar.home.newsLead} />
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <NewsCard
                key={n.id}
                titleAr={n.titleAr}
                excerptAr={n.excerptAr}
                publishedAt={n.publishedAt}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Closing CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <PulseTrace variant="rule" className="mb-10" />
        <div className="rounded-lg border border-line bg-mint/40 px-6 py-12 text-center">
          <h2 className="text-xl font-bold tracking-[-0.01em] text-ink sm:text-2xl">
            {ar.home.ctaTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-loose text-muted-ink">
            {ar.home.ctaLead}
          </p>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg">
              <Link href="/book">{ar.actions.bookAppointment}</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
