import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { SectionHeading } from "@/components/nabd/SectionHeading";
import { ContactForm } from "@/components/nabd/ContactForm";
import { ar } from "@/content/ar";

export const metadata: Metadata = {
  title: ar.metadata.contact.title,
  description: ar.metadata.contact.description,
};

export default function ContactPage() {
  const info = [
    { icon: MapPin, label: ar.contact.addressLabel, value: ar.footer.address, dir: undefined },
    { icon: Phone, label: ar.contact.phoneLabel, value: ar.footer.phone, dir: "ltr" as const },
    { icon: Mail, label: ar.contact.emailLabel, value: ar.footer.email, dir: "ltr" as const },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <SectionHeading as="h1" title={ar.contact.title} lead={ar.contact.lead} />
      <PulseTrace variant="rule" className="my-10" />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-lg font-bold tracking-[-0.01em] text-ink">
            {ar.contact.infoTitle}
          </h2>
          <ul className="mt-6 space-y-5">
            {info.map((item) => (
              <li key={item.label} className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-mint text-teal">
                  <item.icon className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm text-muted-ink">{item.label}</p>
                  <p
                    dir={item.dir}
                    className={item.dir === "ltr" ? "font-data text-ink" : "text-ink"}
                  >
                    {item.value}
                  </p>
                </div>
              </li>
            ))}
            <li className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-mint text-teal">
                <Clock className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm text-muted-ink">{ar.contact.hoursLabel}</p>
                <p className="text-ink">{ar.footer.hoursClinics}</p>
                <p className="text-ink">{ar.footer.hoursEmergency}</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-line bg-card p-6 sm:p-8">
          <h2 className="mb-6 text-lg font-bold tracking-[-0.01em] text-ink">
            {ar.contact.formTitle}
          </h2>
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
