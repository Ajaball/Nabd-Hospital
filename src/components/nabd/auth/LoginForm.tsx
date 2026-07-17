"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { authenticate } from "@/lib/actions/auth";
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

type Props = {
  callbackUrl: string;
  /** "patient" shows the register link; "admin" hides it (staff-only portal). */
  variant?: "patient" | "admin";
};

export function LoginForm({ callbackUrl, variant = "patient" }: Props) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  function onSubmit(values: LoginInput) {
    setFormError(null);
    startTransition(async () => {
      const result = await authenticate(values, callbackUrl);
      // A successful sign-in never returns (it redirects); reaching here means
      // an error was surfaced.
      if (result?.error) setFormError(result.error);
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
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending
            ? ar.auth.login.submitting
            : variant === "admin"
              ? ar.auth.adminLogin.submit
              : ar.auth.login.submit}
        </Button>

        {variant === "patient" ? (
          <p className="text-center text-sm text-muted-ink">
            {ar.auth.login.noAccount}{" "}
            <Link href="/register" className="font-medium text-teal hover:underline">
              {ar.auth.login.registerLink}
            </Link>
          </p>
        ) : null}
      </form>
    </Form>
  );
}
