import type { Metadata } from "next";
import { AuthShell } from "@/components/nabd/auth/AuthShell";
import { LoginForm } from "@/components/nabd/auth/LoginForm";
import { safeCallbackUrl } from "@/lib/callback-url";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.login.title,
  description: ar.metadata.login.description,
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const callbackUrl = safeCallbackUrl(sp.callbackUrl, "/my-appointments");
  const registered = sp.registered === "1";

  return (
    <AuthShell title={ar.auth.login.title} lead={ar.auth.login.lead}>
      {registered ? (
        <p
          role="status"
          className="mb-5 rounded-md border border-teal/30 bg-mint px-3 py-2 text-sm font-medium text-teal"
        >
          {ar.auth.register.success}
        </p>
      ) : null}
      <LoginForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
