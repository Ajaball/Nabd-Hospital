"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSchema,
  type RegisterFormValues,
  type RegisterInput,
} from "@/lib/validation/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

// Fields the server may report back so we can attach the error to the input.
const FIELD_NAMES: (keyof RegisterFormValues)[] = [
  "fullName",
  "email",
  "password",
  "phone",
  "nationalId",
  "dateOfBirth",
  "gender",
];

export function RegisterForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<RegisterFormValues, unknown, RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      nationalId: "",
      dateOfBirth: "",
      gender: "",
    },
  });

  function onSubmit(values: RegisterInput) {
    setFormError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });

        if (res.status === 201) {
          router.push("/login?registered=1");
          return;
        }

        const payload = await res.json().catch(() => null);
        const code: string | undefined = payload?.error?.code;

        if (code === "EMAIL_TAKEN") {
          form.setError("email", { message: ar.auth.register.emailTaken });
          return;
        }
        if (code === "NATIONAL_ID_TAKEN") {
          form.setError("nationalId", { message: ar.auth.register.nationalIdTaken });
          return;
        }
        if (code === "VALIDATION_ERROR" && payload?.error?.fields) {
          const fields = payload.error.fields as Record<string, string[]>;
          for (const name of FIELD_NAMES) {
            const messages = fields[name];
            if (messages?.length) form.setError(name, { message: messages[0] });
          }
          return;
        }

        setFormError(ar.auth.register.genericError);
      } catch {
        setFormError(ar.auth.register.genericError);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {formError ? (
          <p
            role="alert"
            className="rounded-md border border-st-cancelled/30 bg-st-cancelled/5 px-3 py-2 text-sm font-medium text-st-cancelled"
          >
            {formError}
          </p>
        ) : null}

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.auth.fields.fullName}</FormLabel>
              <FormControl>
                <Input
                  autoComplete="name"
                  placeholder={ar.auth.fields.fullNamePlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.auth.fields.email}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  dir="ltr"
                  className="text-start"
                  placeholder={ar.auth.fields.emailPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.auth.fields.password}</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder={ar.auth.fields.passwordPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.auth.fields.phone}</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  className="text-start"
                  placeholder={ar.auth.fields.phonePlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nationalId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.auth.fields.nationalId}</FormLabel>
              <FormControl>
                <Input
                  inputMode="numeric"
                  dir="ltr"
                  className="text-start font-data"
                  placeholder={ar.auth.fields.nationalIdPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ar.auth.fields.dateOfBirth}</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    dir="ltr"
                    className="text-start font-data"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ar.auth.fields.gender}</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-11 w-full rounded-md border border-input bg-card px-3 py-2 text-base text-ink focus-visible:border-teal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-st-cancelled"
                  >
                    <option value="" disabled>
                      {ar.auth.fields.gender}
                    </option>
                    <option value="MALE">{ar.auth.gender.male}</option>
                    <option value="FEMALE">{ar.auth.gender.female}</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? ar.auth.register.submitting : ar.auth.register.submit}
        </Button>

        <p className="text-center text-sm text-muted-ink">
          {ar.auth.register.haveAccount}{" "}
          <Link href="/login" className="font-medium text-teal hover:underline">
            {ar.auth.register.loginLink}
          </Link>
        </p>
      </form>
    </Form>
  );
}
