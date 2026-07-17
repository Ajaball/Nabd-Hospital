import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "مستشفى نبض";

/**
 * Open Graph image. Brand graphic only — the pulse ECG trace on teal, no text
 * (avoids embedding an Arabic font in the edge image renderer).
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e5a52",
        }}
      >
        <svg width="760" height="320" viewBox="0 0 400 160">
          <polyline
            points="10,80 120,80 140,80 152,55 165,105 178,20 192,120 205,80 230,80 400,80"
            fill="none"
            stroke="#ff4d3d"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div
          style={{
            marginTop: 40,
            width: 220,
            height: 6,
            background: "#dcede9",
            borderRadius: 3,
          }}
        />
      </div>
    ),
    size,
  );
}
