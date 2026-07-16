import type { Metadata } from "next";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { ar } from "@/content/ar";
import { AdminLoginForm } from "./AdminLoginForm";

export const metadata: Metadata = {
  title: ar.metadata.adminLogin.title,
  description: ar.metadata.adminLogin.description,
};

/**
 * Admin login. Visually distinct from the patient login — a dark clinical page
 * with a solid teal header band on the card, and no "create account" link.
 * Staff accounts are created by seeding/administration, never self-service.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const t = ar.auth.adminLogin;

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-ink px-6 py-16">
      <section className="w-full max-w-md overflow-hidden rounded-lg border border-line bg-card shadow-clinical">
        <header className="bg-teal px-8 pb-6 pt-7">
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-paper">{t.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-paper/80">{t.subtitle}</p>
        </header>
        <div className="px-8 pb-8 pt-6">
          <PulseTrace variant="rule" className="mb-6" />
          <AdminLoginForm callbackUrl={callbackUrl} />
        </div>
      </section>
    </main>
  );
}
