import type { Metadata } from "next";
import { MapPin, Phone, Siren, Mail, Clock } from "lucide-react";

import { PulseTrace } from "@/components/nabd/PulseTrace";
import { ContactForm } from "@/components/nabd/ContactForm";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.contact.title,
  description: ar.metadata.contact.description,
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-2xl">
        <PulseTrace variant="rule" className="mb-6" />
        <h1 className="text-3xl font-bold tracking-[-0.01em] text-ink sm:text-[2.75rem]">
          {ar.contact.title}
        </h1>
        <p className="mt-4 text-lg leading-loose text-muted-ink">
          {ar.contact.lead}
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        {/* Contact details */}
        <aside className="space-y-6">
          <h2 className="text-xl font-bold tracking-[-0.01em] text-ink">
            {ar.contact.infoTitle}
          </h2>
          <ul className="space-y-5">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-ink">
                  {ar.contact.addressLabel}
                </div>
                <div className="text-sm leading-relaxed text-muted-ink">
                  {ar.site.addressLine}
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-ink">
                  {ar.contact.phoneLabel}
                </div>
                <a
                  href={`tel:${ar.site.phone}`}
                  dir="ltr"
                  className="font-data text-sm text-muted-ink transition-colors hover:text-teal"
                >
                  {ar.site.phoneDisplay}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Siren className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-ink">
                  {ar.contact.emergencyLabel}
                </div>
                <a
                  href={`tel:${ar.site.emergencyPhone}`}
                  dir="ltr"
                  className="font-data text-sm text-muted-ink transition-colors hover:text-teal"
                >
                  {ar.site.emergencyPhone}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-ink">
                  {ar.contact.emailLabel}
                </div>
                <a
                  href={`mailto:${ar.site.email}`}
                  dir="ltr"
                  className="font-data text-sm text-muted-ink transition-colors hover:text-teal"
                >
                  {ar.site.email}
                </a>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-teal" aria-hidden="true" />
              <div>
                <div className="text-sm font-medium text-ink">
                  {ar.contact.hoursLabel}
                </div>
                <div className="space-y-0.5 text-sm leading-relaxed text-muted-ink">
                  <p>{ar.site.hoursWeekdays}</p>
                  <p>{ar.site.hoursWeekend}</p>
                  <p>{ar.site.hoursEmergency}</p>
                </div>
              </div>
            </li>
          </ul>
        </aside>

        {/* Form */}
        <div>
          <h2 className="mb-4 text-xl font-bold tracking-[-0.01em] text-ink">
            {ar.contact.formTitle}
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
