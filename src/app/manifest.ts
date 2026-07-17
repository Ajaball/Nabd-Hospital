import type { MetadataRoute } from "next";
import { ar } from "@/content/ar";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: ar.site.name,
    short_name: ar.site.name,
    description: ar.metadata.home.description,
    start_url: "/",
    display: "standalone",
    lang: "ar",
    dir: "rtl",
    background_color: "#F4F6F5",
    theme_color: "#0E5A52",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
