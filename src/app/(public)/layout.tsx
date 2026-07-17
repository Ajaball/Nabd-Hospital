import { SiteHeader } from "@/components/nabd/SiteHeader";
import { SiteFooter } from "@/components/nabd/SiteFooter";

/** Shared chrome for every public page: header, content, footer. */
export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
