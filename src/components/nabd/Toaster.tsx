"use client";

import { Toaster as Sonner } from "sonner";

/**
 * App toaster (CLAUDE.md §Phase 6). Top-center, RTL, in the clinical palette —
 * every mutation confirms with wording that matches the button that fired it.
 */
export function Toaster() {
  return (
    <Sonner
      position="top-center"
      dir="rtl"
      toastOptions={{
        style: {
          fontFamily: "var(--font-sans)",
          background: "var(--card)",
          color: "var(--ink)",
          border: "1px solid var(--line)",
          borderRadius: "8px",
          boxShadow: "var(--shadow-clinical)",
        },
      }}
    />
  );
}
