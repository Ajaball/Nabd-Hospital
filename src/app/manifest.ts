import type { MetadataRoute } from "next";

import { ar } from "@/content/ar";

/** Web app manifest basics (CLAUDE.md §Phase 6). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ar.site.name,
    short_name: ar.site.name,
    description: ar.metadata.home.description,
    start_url: "/",
    display: "standalone",
    dir: "rtl",
    lang: "ar",
    background_color: "#f4f6f5",
    theme_color: "#0e5a52",
    icons: [
      { src: "/icon", sizes: "32x32", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
