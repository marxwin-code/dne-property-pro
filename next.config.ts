import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["pdf-parse", "exceljs"],
  outputFileTracingIncludes: {
    "/api/invoice-extract": ["./lib/invoice-templates/**/*"]
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**"
      }
    ],
    domains: ["images.unsplash.com", "source.unsplash.com"]
  },
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
