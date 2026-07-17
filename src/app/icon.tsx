import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon: the pulse ECG mark on teal. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e5a52",
        }}
      >
        <svg width="26" height="26" viewBox="0 0 100 60">
          <polyline
            points="4,30 26,30 34,14 44,46 52,24 62,30 96,30"
            fill="none"
            stroke="#ff4d3d"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    size,
  );
}
