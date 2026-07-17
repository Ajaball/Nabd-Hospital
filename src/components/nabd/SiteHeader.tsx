import Link from "next/link";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/nabd/Logo";
import { NavLinks, type NavItem } from "@/components/nabd/NavLinks";
import { MobileNav } from "@/components/nabd/MobileNav";
import { SignOutButton } from "@/components/nabd/auth/SignOutButton";
import { ar } from "@/content/ar";

const NAV_ITEMS: NavItem[] = [
  { href: "/departments", label: ar.nav.departments },
  { href: "/doctors", label: ar.nav.doctors },
  { href: "/about", label: ar.nav.about },
  { href: "/faq", label: ar.nav.faq },
  { href: "/contact", label: ar.nav.contact },
];

/**
 * Sticky site header with RTL navigation, a booking CTA, and an auth-aware
 * link (login / my-appointments / dashboard). Server component so it can read
 * the session directly; the mobile sheet is a client island.
 */
export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role;

  const authLink =
    role === "ADMIN"
      ? { href: "/dashboard", label: ar.nav.dashboard }
      : role === "PATIENT"
        ? { href: "/my-appointments", label: ar.nav.myAppointments }
        : { href: "/login", label: ar.nav.login };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Logo />
          <nav aria-label={ar.nav.primary} className="hidden md:block">
            <NavLinks items={NAV_ITEMS} />
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href={authLink.href}>{authLink.label}</Link>
            </Button>
            {session ? <SignOutButton /> : null}
            <Button asChild size="sm">
              <Link href="/book">{ar.actions.bookAppointment}</Link>
            </Button>
          </div>
          <MobileNav
            items={NAV_ITEMS}
            authLink={authLink}
            signOut={session ? <SignOutButton /> : null}
          />
        </div>
      </div>
    </header>
  );
}
