"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Gender } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerSchema, type RegisterInput } from "@/lib/validation/auth";
import { ar } from "@/content/ar";
import { cn } from "@/lib/utils";

/**
 * Patient registration. Posts to the REST endpoint, and on success signs the
 * new patient in and forwards them into the app. Field errors come from the
 * shared Zod schema; server conflicts (e.g. a taken email) surface inline.
 */
export function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      nationalId: "",
      dateOfBirth: "",
      password: "",
    },
  });

  const gender = watch("gender");

  async function onSubmit(values: RegisterInput) {
    setFormError(null);
    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.status === 409) {
      setFormError(ar.auth.errors.emailTaken);
      return;
    }
    if (!res.ok) {
      setFormError(ar.auth.errors.generic);
      return;
    }

    // Auto sign-in after a successful registration.
    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      redirect: false,
    });
    if (!result || result.error) {
      // Account created but auto-login failed — send them to the login page.
      router.push("/login");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  const genderOptions = [
    { value: Gender.MALE, label: ar.auth.register.genderMale },
    { value: Gender.FEMALE, label: ar.auth.register.genderFemale },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="fullName">{ar.auth.register.fields.fullName}</Label>
        <Input
          id="fullName"
          autoComplete="name"
          placeholder={ar.auth.register.placeholders.fullName}
          {...register("fullName")}
          aria-invalid={errors.fullName ? true : undefined}
        />
        {errors.fullName ? (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{ar.auth.register.fields.email}</Label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          className="text-start font-data"
          autoComplete="email"
          placeholder={ar.auth.register.placeholders.email}
          {...register("email")}
          aria-invalid={errors.email ? true : undefined}
        />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">{ar.auth.register.fields.phone}</Label>
          <Input
            id="phone"
            inputMode="tel"
            dir="ltr"
            className="text-start font-data"
            autoComplete="tel"
            placeholder={ar.auth.register.placeholders.phone}
            {...register("phone")}
            aria-invalid={errors.phone ? true : undefined}
          />
          {errors.phone ? (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationalId">{ar.auth.register.fields.nationalId}</Label>
          <Input
            id="nationalId"
            inputMode="numeric"
            dir="ltr"
            className="text-start font-data"
            placeholder={ar.auth.register.placeholders.nationalId}
            {...register("nationalId")}
            aria-invalid={errors.nationalId ? true : undefined}
          />
          {errors.nationalId ? (
            <p className="text-xs text-destructive">{errors.nationalId.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">{ar.auth.register.fields.dateOfBirth}</Label>
        <Input
          id="dateOfBirth"
          type="date"
          dir="ltr"
          className="text-start font-data"
          {...register("dateOfBirth")}
          aria-invalid={errors.dateOfBirth ? true : undefined}
        />
        {errors.dateOfBirth ? (
          <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>
        ) : null}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-ink">
          {ar.auth.register.fields.gender}
        </legend>
        <div className="grid grid-cols-2 gap-3">
          {genderOptions.map((option) => {
            const active = gender === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  setValue("gender", option.value, { shouldValidate: true })
                }
                aria-pressed={active}
                className={cn(
                  "rounded-md border px-4 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-teal bg-mint text-teal"
                    : "border-line bg-card text-ink hover:border-teal",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {errors.gender ? (
          <p className="text-xs text-destructive">{errors.gender.message}</p>
        ) : null}
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor="password">{ar.auth.register.fields.password}</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder={ar.auth.register.placeholders.password}
          {...register("password")}
          aria-invalid={errors.password ? true : undefined}
        />
        {errors.password ? (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        ) : (
          <p className="text-xs text-muted-ink">{ar.auth.register.passwordHint}</p>
        )}
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
        {isSubmitting ? ar.auth.register.submitting : ar.auth.register.submit}
      </Button>
    </form>
  );
}
