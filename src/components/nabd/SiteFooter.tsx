import Link from "next/link";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { Logo } from "@/components/nabd/Logo";
import { ar } from "@/content/ar";

const EXPLORE = [
  { href: "/departments", label: ar.nav.departments },
  { href: "/doctors", label: ar.nav.doctors },
  { href: "/about", label: ar.nav.about },
  { href: "/faq", label: ar.nav.faq },
  { href: "/contact", label: ar.nav.contact },
];

export function SiteFooter() {
  const year = "2026";
  return (
    <footer className="mt-20 border-t border-line bg-paper">
      <PulseTrace variant="rule" />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-4 max-w-md text-sm leading-loose text-muted-ink">
              {ar.footer.blurb}
            </p>
          </div>

          <nav aria-label={ar.footer.exploreTitle}>
            <h2 className="text-sm font-semibold text-ink">{ar.footer.exploreTitle}</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {EXPLORE.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-ink transition-colors hover:text-teal"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold text-ink">{ar.footer.contactTitle}</h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-ink">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                <span>{ar.footer.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-teal" aria-hidden="true" />
                <span dir="ltr" className="font-data tabular-nums">
                  {ar.footer.phone}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-teal" aria-hidden="true" />
                <span dir="ltr" className="font-data">
                  {ar.footer.email}
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
                <span>
                  {ar.footer.hoursClinics}
                  <br />
                  {ar.footer.hoursEmergency}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-1 border-t border-line pt-6 text-xs text-muted-ink">
          <p>
            © <span className="font-data">{year}</span> {ar.footer.rights}
          </p>
          <p>{ar.footer.disclaimer}</p>
        </div>
      </div>
    </footer>
  );
}
