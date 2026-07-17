import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { AdminLoginForm } from "@/components/nabd/AdminLoginForm";
import { SiteWordmark } from "@/components/nabd/SiteWordmark";
import { auth } from "@/lib/auth";
import { ar } from "@/content/ar";
import { safeCallbackUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: ar.metadata.adminLogin.title,
  description: ar.metadata.adminLogin.description,
};

/**
 * Admin login — deliberately distinct from the patient login (a staff lockup,
 * no register link) per CLAUDE.md §Phase 2. The ADMIN gate is enforced by the
 * middleware; an already-signed-in admin is forwarded straight in.
 */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const target = safeCallbackUrl(callbackUrl, "/dashboard");

  const session = await auth();
  if (session?.user?.role === "ADMIN") {
    redirect(target);
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      <header className="border-b border-paper/10 px-4 py-5 sm:px-6">
        <SiteWordmark className="text-paper [&_span]:text-paper" />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-3 text-paper">
            <span className="flex size-11 items-center justify-center rounded-md bg-teal">
              <ShieldCheck className="size-6" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-[-0.01em]">
                {ar.auth.adminLogin.title}
              </h1>
              <p className="text-sm text-paper/70">{ar.auth.adminLogin.subtitle}</p>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-card p-6 shadow-clinical sm:p-8">
            <AdminLoginForm callbackUrl={target} />
          </div>
        </div>
      </div>
    </div>
  );
}
