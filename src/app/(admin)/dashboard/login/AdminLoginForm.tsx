"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { adminLoginAction } from "@/lib/actions/auth";
import {
  FormError,
  FormField,
  SubmitButton,
  inputClass,
} from "@/components/nabd/FormField";
import { ar } from "@/content/ar";

const t = ar.auth.adminLogin;

export function AdminLoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [formError, setFormError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    setFormError(undefined);
    startTransition(async () => {
      const result = await adminLoginAction(values, callbackUrl);
      if (result?.error) setFormError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormError message={formError} />

      <FormField label={t.emailLabel} htmlFor="email" error={errors.email?.message}>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          dir="ltr"
          aria-invalid={errors.email ? true : undefined}
          className={inputClass}
          {...register("email")}
        />
      </FormField>

      <FormField
        label={t.passwordLabel}
        htmlFor="password"
        error={errors.password?.message}
      >
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          className={inputClass}
          {...register("password")}
        />
      </FormField>

      <SubmitButton pending={isPending}>
        {isPending ? ar.common.submitting : t.submit}
      </SubmitButton>
    </form>
  );
}
