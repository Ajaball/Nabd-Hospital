import { ar } from "@/content/ar";

/** The primary navigation, shared by the desktop header and the mobile sheet. */
export const NAV_LINKS: ReadonlyArray<{ href: string; label: string }> = [
  { href: "/", label: ar.nav.home },
  { href: "/about", label: ar.nav.about },
  { href: "/departments", label: ar.nav.departments },
  { href: "/doctors", label: ar.nav.doctors },
  { href: "/faq", label: ar.nav.faq },
  { href: "/contact", label: ar.nav.contact },
];
