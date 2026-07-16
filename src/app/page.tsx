import Link from "next/link";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { ar } from "@/content/ar";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <PulseTrace
        variant="hero"
        label={ar.site.name}
        className="mx-auto mb-10 h-28 max-w-xl"
      />

      <h1 className="text-center text-3xl font-bold tracking-[-0.01em] text-ink">
        {ar.home.heroTitle}
      </h1>

      <p className="mx-auto mt-5 max-w-xl text-center text-base leading-loose text-muted-ink">
        {ar.home.heroLead}
      </p>

      <div className="mt-9 flex justify-center">
        <Link
          href="/book"
          className="inline-flex items-center justify-center rounded-md bg-teal px-6 py-3 text-base font-semibold text-paper transition-[filter] duration-150 hover:brightness-95"
        >
          {ar.actions.bookAppointment}
        </Link>
      </div>

      <PulseTrace variant="rule" className="mt-16" />
    </main>
  );
}
