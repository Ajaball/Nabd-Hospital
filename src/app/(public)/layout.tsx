import { SiteHeader } from "@/components/nabd/SiteHeader";
import { SiteFooter } from "@/components/nabd/SiteFooter";

/**
 * Chrome for every public page (CLAUDE.md §6): the RTL site header and footer.
 * Auth screens live in their own route groups and deliberately skip this shell.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
