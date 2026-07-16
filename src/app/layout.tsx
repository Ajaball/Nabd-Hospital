import type { Metadata } from "next";
import { sansArabic, mono } from "./fonts";
import { ar } from "@/content/ar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: ar.metadata.home.title,
    template: `%s | ${ar.site.name}`,
  },
  description: ar.metadata.home.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${sansArabic.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
