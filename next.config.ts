import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the project root so Turbopack doesn't walk up to C:\Users\bimar
    // (build warning: ignored package-lock.json in the home directory).
    root: process.cwd(),
  },
};

export default nextConfig;
