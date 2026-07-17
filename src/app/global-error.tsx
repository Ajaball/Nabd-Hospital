"use client";

import { ar } from "@/content/ar";

/**
 * Last-resort boundary — only fires if the root layout itself throws, so it
 * must render its own <html>/<body>. Styled inline against the Nabd palette;
 * this is the one place a system-font fallback is tolerated (the real fonts
 * live in the root layout that failed to render).
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          background: "#F4F6F5",
          color: "#10201F",
          fontFamily: "system-ui, sans-serif",
          margin: 0,
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#10201F" }}>
            {ar.pages.error.title}
          </h1>
          <p style={{ marginTop: "0.75rem", color: "#4b5f5c", lineHeight: 1.75 }}>
            {ar.pages.error.lead}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              background: "#0E5A52",
              color: "#F4F6F5",
              border: "none",
              borderRadius: "8px",
              padding: "0.6rem 1.5rem",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            {ar.pages.error.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
