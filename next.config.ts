import type { NextConfig } from "next";

// GitHub Pages: static export served from https://eeman1113.github.io/xero/
// NEXT_PUBLIC_BASE_PATH is "/xero" in the Pages workflow and empty for local dev.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  turbopack: { root: __dirname },
};

export default nextConfig;
