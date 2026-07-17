import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "مستشفى نبض";

/**
 * Brand Open Graph card. Shapes only (no custom-font text — Satori can't load
 * our woff2), so it renders reliably: the paper field, the ECG trace in --pulse,
 * and the teal wordmark block. The social card's title/description come from the
 * page metadata.
 */
export default function OgImage() {
  // A single ECG complex as an SVG polyline, tiled across the width.
  const ecg =
    "M0,315 L260,315 L285,290 L310,315 L360,315 L372,345 L392,150 L412,430 L428,315 L470,315 " +
    "L500,270 L540,315 L600,315";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#F4F6F5",
          padding: 64,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#0E5A52",
              display: "flex",
            }}
          />
          <div
            style={{
              width: 320,
              height: 40,
              borderRadius: 6,
              background: "#0E5A52",
              display: "flex",
            }}
          />
        </div>

        <svg width="1072" height="630" viewBox="0 0 1072 630" style={{ marginTop: -80 }}>
          <polyline
            points={ecg
              .replace(/[ML]/g, " ")
              .trim()
              .split(/\s+/)
              .map((p) => p.replace(",", " "))
              .join(" ")}
            fill="none"
            stroke="#FF4D3D"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div
          style={{
            display: "flex",
            gap: 12,
          }}
        >
          <div style={{ width: 180, height: 20, borderRadius: 4, background: "#DCEDE9" }} />
          <div style={{ width: 120, height: 20, borderRadius: 4, background: "#DCEDE9" }} />
        </div>
      </div>
    ),
    { ...size },
  );
}
