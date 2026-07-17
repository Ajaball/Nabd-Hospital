import Link from "next/link";
import { MapPin, Phone, Clock, Mail } from "lucide-react";

import { SiteWordmark } from "@/components/nabd/SiteWordmark";
import { PulseTrace } from "@/components/nabd/PulseTrace";
import { NAV_LINKS } from "@/components/nabd/nav-links";
import { ar } from "@/content/ar";

/** The public site footer: identity, quick links, and contact details. */
export function SiteFooter() {
  const year = ar.site.foundedYear; // fixed founding year; not "now"

  return (
    <footer className="mt-20 border-t border-line bg-card">
      <PulseTrace variant="rule" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <SiteWordmark />
          <p className="max-w-sm text-sm leading-relaxed text-muted-ink">
            {ar.footer.blurb}
          </p>
        </div>

        <nav aria-label={ar.footer.quickLinksTitle} className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">
            {ar.footer.quickLinksTitle}
          </h2>
          <ul className="space-y-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-ink transition-colors hover:text-teal"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-ink">
            {ar.footer.contactTitle}
          </h2>
          <ul className="space-y-3 text-sm text-muted-ink">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
              <span>{ar.site.addressLine}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-teal" aria-hidden="true" />
              <a
                href={`tel:${ar.site.phone}`}
                dir="ltr"
                className="font-data transition-colors hover:text-teal"
              >
                {ar.site.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-teal" aria-hidden="true" />
              <a
                href={`mailto:${ar.site.email}`}
                dir="ltr"
                className="font-data transition-colors hover:text-teal"
              >
                {ar.site.email}
              </a>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden="true" />
              <span>{ar.site.hoursWeekdays}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-muted-ink sm:px-6">
          <span className="font-data">© {year}</span> — {ar.footer.rights}
        </div>
      </div>
    </footer>
  );
}
