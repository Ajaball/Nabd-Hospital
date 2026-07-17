"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  contactSchema,
  type ContactFormValues,
  type ContactInput,
} from "@/lib/validation/contact";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ar } from "@/content/ar";

export function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  const form = useForm<ContactFormValues, unknown, ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      subject: "",
      body: "",
      website: "",
    },
  });

  function onSubmit(values: ContactInput) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/v1/contact-messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        if (!res.ok) throw new Error("request failed");
        toast.success(ar.contact.success);
        form.reset();
        setDone(true);
      } catch {
        toast.error(ar.contact.error);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {done ? (
          <p
            role="status"
            className="rounded-md border border-teal/30 bg-mint px-3 py-2 text-sm font-medium text-teal"
          >
            {ar.contact.success}
          </p>
        ) : null}

        {/* Honeypot: visually hidden, off the tab order, ignored by humans. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...form.register("website")}
          />
        </div>

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.contact.fields.fullName}</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{ar.contact.fields.email}</FormLabel>
                <FormControl>
                  <Input type="email" dir="ltr" className="text-start" autoComplete="email" {...field} />
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
                <FormLabel>{ar.contact.fields.phone}</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    dir="ltr"
                    className="text-start"
                    autoComplete="tel"
                    placeholder={ar.auth.fields.phonePlaceholder}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.contact.fields.subject}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="body"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{ar.contact.fields.body}</FormLabel>
              <FormControl>
                <Textarea
                  rows={5}
                  placeholder={ar.contact.fields.bodyPlaceholder}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? ar.contact.submitting : ar.contact.submit}
        </Button>
      </form>
    </Form>
  );
}
