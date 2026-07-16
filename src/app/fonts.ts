import localFont from "next/font/local";

/**
 * Self-hosted fonts (CLAUDE.md §2.3). The woff2 files are IBM Plex Sans Arabic
 * (arabic + latin subsets merged per weight) and IBM Plex Mono (latin only),
 * extracted at build-setup time from the upstream font packages. We never use
 * next/font/google and never fall back to a system Arabic face.
 */

export const sansArabic = localFont({
  src: [
    { path: "./fonts/ibm-plex-sans-arabic-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/ibm-plex-sans-arabic-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-plex-sans",
  display: "swap",
  preload: true,
  // Metric-matched fallback keeps layout stable before the Arabic face loads.
  adjustFontFallback: false,
  fallback: ["system-ui", "sans-serif"],
});

export const mono = localFont({
  src: [
    { path: "./fonts/ibm-plex-mono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/ibm-plex-mono-500.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  preload: true,
  adjustFontFallback: false,
  fallback: ["ui-monospace", "monospace"],
});
