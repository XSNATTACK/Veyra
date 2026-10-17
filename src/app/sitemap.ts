import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { projects } from "@/content/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const now = new Date();
  const routes = ["", "/work", "/services", "/studio", "/contact", "/privacy", "/terms"].map((r) => ({
    url: `${base}${r || "/"}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: r === "" ? 1 : 0.7,
  }));
  const work = projects.map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));
  return [...routes, ...work];
}
