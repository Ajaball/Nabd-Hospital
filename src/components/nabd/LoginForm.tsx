"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { ar } from "@/content/ar";

/**
 * Patient credentials login. Validates with the shared Zod schema, signs in via
 * Auth.js without a full-page redirect, then routes to the callbackUrl (or the
 * patient portal) and refreshes so Server Components see the new session.
 */
export function LoginForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    const result = await signIn("credentials", { ...values, redirect: false });
    if (!result || result.error) {
      setFormError(ar.auth.errors.credentials);
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">{ar.auth.login.emailLabel}</Label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          className="text-start font-data"
          autoComplete="email"
          {...register("email")}
          aria-invalid={errors.email ? true : undefined}
        />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{ar.auth.login.passwordLabel}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          aria-invalid={errors.password ? true : undefined}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : null}
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-md border-s-[3px] border-s-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? ar.auth.login.submitting : ar.auth.login.submit}
      </Button>
    </form>
  );
}
