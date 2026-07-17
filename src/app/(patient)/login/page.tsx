import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthShell } from "@/components/nabd/AuthShell";
import { LoginForm } from "@/components/nabd/LoginForm";
import { auth } from "@/lib/auth";
import { ar } from "@/content/ar";
import { safeCallbackUrl } from "@/lib/utils";

export const metadata: Metadata = {
  title: ar.metadata.login.title,
  description: ar.metadata.login.description,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;
  const target = safeCallbackUrl(callbackUrl, "/my-appointments");

  // Already signed in → send them where they belong.
  const session = await auth();
  if (session?.user) {
    redirect(session.user.role === "ADMIN" ? "/dashboard" : target);
  }

  return (
    <AuthShell
      title={ar.auth.login.title}
      subtitle={ar.auth.login.subtitle}
      footer={
        <>
          {ar.auth.login.noAccount}{" "}
          <Link
            href="/register"
            className="font-medium text-teal transition-colors hover:brightness-90"
          >
            {ar.auth.login.registerCta}
          </Link>
        </>
      }
    >
      <LoginForm callbackUrl={target} />
    </AuthShell>
  );
}
