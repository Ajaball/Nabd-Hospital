import type { Metadata } from "next";
import { AuthShell } from "@/components/nabd/auth/AuthShell";
import { RegisterForm } from "@/components/nabd/auth/RegisterForm";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.register.title,
  description: ar.metadata.register.description,
};

export default function RegisterPage() {
  return (
    <AuthShell title={ar.auth.register.title} lead={ar.auth.register.lead}>
      <RegisterForm />
    </AuthShell>
  );
}
