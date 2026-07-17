"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerFormSchema,
  type RegisterFormInput,
} from "@/lib/validation/auth";
import { patientLoginAction } from "@/lib/actions/auth";
import {
  FormError,
  FormField,
  SubmitButton,
  inputClass,
} from "@/components/nabd/FormField";
import { ar } from "@/content/ar";

const t = ar.auth.register;

// Fields the API can attach errors to (mirrors the register Zod schema).
type ApiField = keyof Omit<RegisterFormInput, "confirmPassword">;
const API_FIELDS: readonly ApiField[] = [
  "fullName",
  "email",
  "phone",
  "nationalId",
  "dateOfBirth",
  "gender",
  "password",
];

export function RegisterForm() {
  const [formError, setFormError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      nationalId: "",
      dateOfBirth: "",
      gender: undefined,
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: RegisterFormInput) {
    setFormError(undefined);
    startTransition(async () => {
      const { confirmPassword: _confirm, ...payload } = values;
      void _confirm;

      const response = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Registration succeeded — sign the new patient in and redirect.
        const result = await patientLoginAction({
          email: payload.email,
          password: payload.password,
        });
        if (result?.error) setFormError(result.error);
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
        fieldErrors?: Partial<Record<ApiField, string[]>>;
      } | null;

      let matched = false;
      for (const field of API_FIELDS) {
        const message = data?.fieldErrors?.[field]?.[0];
        if (message) {
          setError(field, { message });
          matched = true;
        }
      }
      if (!matched) setFormError(data?.error ?? t.errors.generic);
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <FormError message={formError} />

      <FormField
        label={t.fullNameLabel}
        htmlFor="fullName"
        error={errors.fullName?.message}
      >
        <input
          id="fullName"
          type="text"
          autoComplete="name"
          aria-invalid={errors.fullName ? true : undefined}
          className={inputClass}
          {...register("fullName")}
        />
      </FormField>

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
        label={t.phoneLabel}
        htmlFor="phone"
        hint={t.phoneHint}
        error={errors.phone?.message}
      >
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          aria-invalid={errors.phone ? true : undefined}
          className={inputClass}
          {...register("phone")}
        />
      </FormField>

      <FormField
        label={t.nationalIdLabel}
        htmlFor="nationalId"
        error={errors.nationalId?.message}
      >
        <input
          id="nationalId"
          type="text"
          inputMode="numeric"
          dir="ltr"
          aria-invalid={errors.nationalId ? true : undefined}
          className={inputClass}
          {...register("nationalId")}
        />
      </FormField>

      <FormField
        label={t.dateOfBirthLabel}
        htmlFor="dateOfBirth"
        error={errors.dateOfBirth?.message}
      >
        <input
          id="dateOfBirth"
          type="date"
          dir="ltr"
          aria-invalid={errors.dateOfBirth ? true : undefined}
          className={inputClass}
          {...register("dateOfBirth")}
        />
      </FormField>

      <FormField
        label={t.genderLabel}
        htmlFor="gender"
        error={errors.gender?.message}
      >
        <select
          id="gender"
          defaultValue=""
          aria-invalid={errors.gender ? true : undefined}
          className={inputClass}
          {...register("gender")}
        >
          <option value="" disabled>
            {t.genderPlaceholder}
          </option>
          <option value="MALE">{ar.auth.genderOptions.MALE}</option>
          <option value="FEMALE">{ar.auth.genderOptions.FEMALE}</option>
        </select>
      </FormField>

      <FormField
        label={t.passwordLabel}
        htmlFor="password"
        hint={t.passwordHint}
        error={errors.password?.message}
      >
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.password ? true : undefined}
          className={inputClass}
          {...register("password")}
        />
      </FormField>

      <FormField
        label={t.confirmPasswordLabel}
        htmlFor="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={errors.confirmPassword ? true : undefined}
          className={inputClass}
          {...register("confirmPassword")}
        />
      </FormField>

      <SubmitButton pending={isPending}>
        {isPending ? ar.common.submitting : t.submit}
      </SubmitButton>
    </form>
  );
}
