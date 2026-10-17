import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Drop the framework fingerprint header.
  poweredByHeader: false,
  images: {
    // Serve modern formats first; the platform negotiates AVIF/WebP per browser.
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    // Pin the project root so Turbopack doesn't walk up to C:\Users\bimar
    // (build warning: ignored package-lock.json in the home directory).
    root: process.cwd(),
  },
};

export default nextConfig;
