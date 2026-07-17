import type { Metadata } from "next";
import { sansArabic, mono } from "./fonts";
import { Toaster } from "@/components/nabd/Toaster";
import { ar } from "@/content/ar";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://nabd-hospital.example"),
  title: {
    default: ar.metadata.home.title,
    template: `%s | ${ar.site.name}`,
  },
  description: ar.metadata.home.description,
  applicationName: ar.site.name,
  openGraph: {
    title: ar.metadata.home.title,
    description: ar.metadata.home.description,
    siteName: ar.site.name,
    locale: "ar_SA",
    type: "website",
  },
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
