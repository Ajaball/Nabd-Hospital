import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/nabd/AuthShell";
import { ar } from "@/content/ar";
import { PatientLoginForm } from "./PatientLoginForm";

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
  const t = ar.auth.login;

  return (
    <AuthShell
      title={t.title}
      subtitle={t.subtitle}
      footer={
        <>
          {t.noAccount}{" "}
          <Link href="/register" className="font-medium text-teal hover:brightness-90">
            {t.registerCta}
          </Link>
        </>
      }
    >
      <PatientLoginForm callbackUrl={callbackUrl} />
    </AuthShell>
  );
}
