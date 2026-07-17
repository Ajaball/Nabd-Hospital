import { SiteHeader } from "@/components/nabd/SiteHeader";
import { SiteFooter } from "@/components/nabd/SiteFooter";

/** Patient-area chrome — the same header and footer as the public site. */
export default function PatientLayout({
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
