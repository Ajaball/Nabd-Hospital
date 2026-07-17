"use client";

import { sansArabic, mono } from "./fonts";
import { ar } from "@/content/ar";
import "./globals.css";

/**
 * Catches errors thrown in the root layout itself. It replaces the entire
 * document, so it renders its own <html>/<body> (CLAUDE.md §Phase 6).
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl" className={`${sansArabic.variable} ${mono.variable}`}>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1 className="text-2xl font-bold tracking-[-0.01em] text-ink">
            {ar.system.errorTitle}
          </h1>
          <p className="mt-3 max-w-md text-muted-ink">{ar.system.errorBody}</p>
          <button
            onClick={reset}
            className="mt-8 rounded-md bg-teal px-6 py-2.5 text-sm font-semibold text-paper"
          >
            {ar.system.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
