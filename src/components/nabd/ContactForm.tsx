"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  contactMessageSchema,
  type ContactMessageInput,
} from "@/lib/validation/contact";
import { ar } from "@/content/ar";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactMessageInput>({
    resolver: zodResolver(contactMessageSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      body: "",
      website: "",
    },
  });

  async function onSubmit(values: ContactMessageInput) {
    setStatus("submitting");
    try {
      const res = await fetch("/api/v1/contact-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("request failed");
      reset();
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-line bg-card p-8">
        <CheckCircle2 className="size-8 text-st-confirmed" aria-hidden="true" />
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-ink">
            {ar.contact.successTitle}
          </h3>
          <p className="text-sm leading-relaxed text-muted-ink">
            {ar.contact.successBody}
          </p>
        </div>
        <Button variant="outline" onClick={() => setStatus("idle")}>
          {ar.contact.sendAnother}
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 rounded-lg border border-line bg-card p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">{ar.contact.fields.fullName}</Label>
          <Input
            id="fullName"
            {...register("fullName")}
            placeholder={ar.contact.placeholders.fullName}
            aria-invalid={errors.fullName ? true : undefined}
          />
          {errors.fullName ? (
            <p className="text-xs text-destructive">{errors.fullName.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">{ar.contact.fields.phone}</Label>
          <Input
            id="phone"
            inputMode="tel"
            dir="ltr"
            className="text-start font-data"
            {...register("phone")}
            placeholder={ar.contact.placeholders.phone}
            aria-invalid={errors.phone ? true : undefined}
          />
          {errors.phone ? (
            <p className="text-xs text-destructive">{errors.phone.message}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{ar.contact.fields.email}</Label>
        <Input
          id="email"
          type="email"
          dir="ltr"
          className="text-start font-data"
          {...register("email")}
          placeholder={ar.contact.placeholders.email}
          aria-invalid={errors.email ? true : undefined}
        />
        {errors.email ? (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">{ar.contact.fields.subject}</Label>
        <Input
          id="subject"
          {...register("subject")}
          placeholder={ar.contact.placeholders.subject}
          aria-invalid={errors.subject ? true : undefined}
        />
        {errors.subject ? (
          <p className="text-xs text-destructive">{errors.subject.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="body">{ar.contact.fields.body}</Label>
        <Textarea
          id="body"
          rows={6}
          {...register("body")}
          placeholder={ar.contact.placeholders.body}
          aria-invalid={errors.body ? true : undefined}
        />
        {errors.body ? (
          <p className="text-xs text-destructive">{errors.body.message}</p>
        ) : null}
      </div>

      {/* Honeypot: hidden from people, tempting to bots. Must stay empty. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input
          id="website"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      {status === "error" ? (
        <p className="rounded-md border-s-[3px] border-s-destructive bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {ar.contact.errorBody}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={status === "submitting"}>
        {status === "submitting" ? ar.actions.sending : ar.actions.send}
      </Button>
    </form>
  );
}
