import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { projects } from "@/content/projects";

/** Date the marketing pages last changed — bump when page copy changes. */
const SITE_CONTENT_DATE = new Date("2026-10-17");

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const routes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: SITE_CONTENT_DATE, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/work`, lastModified: SITE_CONTENT_DATE, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/services`, lastModified: SITE_CONTENT_DATE, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/studio`, lastModified: SITE_CONTENT_DATE, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: SITE_CONTENT_DATE, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/privacy`, lastModified: SITE_CONTENT_DATE, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, lastModified: SITE_CONTENT_DATE, changeFrequency: "yearly", priority: 0.2 },
  ];
  const work: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/work/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "monthly",
    priority: 0.8,
    ...(p.heroImage ? { images: [`${base}${p.heroImage}`] } : {}),
  }));
  return [...routes, ...work];
}
