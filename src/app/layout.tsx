import type { Metadata, Viewport } from "next";
import { sansArabic, mono } from "./fonts";
import { Toaster } from "@/components/ui/sonner";
import { ar } from "@/content/ar";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: ar.metadata.home.title,
    template: `%s | ${ar.site.name}`,
  },
  description: ar.metadata.home.description,
  applicationName: ar.site.name,
  appleWebApp: { capable: true, title: ar.site.name, statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: ar.site.name,
    title: ar.metadata.home.title,
    description: ar.metadata.home.description,
  },
  twitter: {
    card: "summary_large_image",
    title: ar.metadata.home.title,
    description: ar.metadata.home.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#0E5A52",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${sansArabic.variable} ${mono.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
