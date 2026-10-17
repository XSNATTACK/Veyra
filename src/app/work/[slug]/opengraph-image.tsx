import { ImageResponse } from "next/og";
import { getProject } from "@/content/projects";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProject(slug);
  const title = p?.title ?? "Project";
  const meta = p ? `${p.index} — ${p.category} / ${p.year}` : "VEYRA";
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
          <span>VEYRA® — SELECTED WORK</span>
          <span>{meta}</span>
        </div>
        <div style={{ display: "flex", fontSize: 100, fontWeight: 800, letterSpacing: -3, textTransform: "uppercase" }}>{title}</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, letterSpacing: 3, color: "#6E6D6A" }}>
          <span>{p?.summary ?? ""}</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
