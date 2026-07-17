import type { Metadata } from "next";
import { AuthShell } from "@/components/nabd/auth/AuthShell";
import { LoginForm } from "@/components/nabd/auth/LoginForm";
import { safeCallbackUrl } from "@/lib/callback-url";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.adminLogin.title,
  description: ar.metadata.adminLogin.description,
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const callbackUrl = safeCallbackUrl(sp.callbackUrl, "/dashboard");

  return (
    <AuthShell
      tone="admin"
      title={ar.auth.adminLogin.title}
      lead={ar.auth.adminLogin.lead}
    >
      {/* No register link — staff accounts are provisioned, not self-served. */}
      <LoginForm callbackUrl={callbackUrl} variant="admin" />
    </AuthShell>
  );
}
