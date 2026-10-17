import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0B",
          color: "#F4F2ED",
          padding: "64px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 4, color: "#A7A5A0" }}>
          <span>INDEPENDENT DIGITAL STUDIO</span>
          <span>2026</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>VEYRA®</div>
          <div style={{ fontSize: 32, color: "#A7A5A0", marginTop: 12 }}>Digital products, built with intent.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 3, color: "#6E6D6A" }}>
          <span>DESIGN / DEVELOPMENT / PRODUCT</span>
          <span style={{ color: "#FF4D00" }}>●</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
