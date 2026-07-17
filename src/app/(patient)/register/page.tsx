import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/nabd/AuthShell";
import { RegisterForm } from "@/components/nabd/RegisterForm";
import { auth } from "@/lib/auth";
import { ar } from "@/content/ar";
import { safeCallbackUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: ar.metadata.register.title,
  description: ar.metadata.register.description,
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const target = safeCallbackUrl(callbackUrl, "/my-appointments");

  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/dashboard" : target);
  }

  return (
    <AuthShell
      title={ar.auth.register.title}
      subtitle={ar.auth.register.subtitle}
      footer={
        <>
          {ar.auth.register.haveAccount}{" "}
          <Link
            href="/login"
            className="font-medium text-teal transition-colors hover:brightness-90"
          >
            {ar.auth.register.loginCta}
          </Link>
        </>
      }
    >
      <RegisterForm callbackUrl={target} />
    </AuthShell>
  );
}
