import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/nabd/AuthShell";
import { ar } from "@/content/ar";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = {
  title: ar.metadata.register.title,
  description: ar.metadata.register.description,
};

export default function RegisterPage() {
  const t = ar.auth.register;

  return (
    <AuthShell
      title={t.title}
      subtitle={t.subtitle}
      footer={
        <>
          {t.haveAccount}{" "}
          <Link href="/login" className="font-medium text-teal hover:brightness-90">
            {t.loginCta}
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
