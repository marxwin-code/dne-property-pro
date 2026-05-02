import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**"
      }
    ],
    // Legacy/hostinger setups still reference `domains`; Unsplash must load for listing previews.
    domains: ["images.unsplash.com"]
  },
  turbopack: {
    root: process.cwd()
  }
};

export default nextConfig;
