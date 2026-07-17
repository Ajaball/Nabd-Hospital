"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * App-wide toast surface (Phase 6). Styled with the Nabd tokens via CSS
 * variables so success/error toasts read as clinical, not decorative. Direction
 * is inherited from <html dir="rtl">.
 */
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      className="toaster group"
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-ink group-[.toaster]:border-line group-[.toaster]:shadow-clinical group-[.toaster]:rounded-md",
          description: "group-[.toast]:text-muted-ink",
          actionButton: "group-[.toast]:bg-teal group-[.toast]:text-paper",
          cancelButton: "group-[.toast]:bg-mint group-[.toast]:text-ink",
          success: "group-[.toaster]:border-teal/40",
          error: "group-[.toaster]:border-st-cancelled/40",
        },
      }}
      style={
        {
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--ink)",
          "--normal-border": "var(--line)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}

export { Toaster };
