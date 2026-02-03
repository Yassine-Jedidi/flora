import type { NextConfig } from "next";

import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.65",
    "192.168.1.*", // Allow all devices on local network
  ],
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200], // Optimized for most mobile/desktop screens
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Small thumbnails/icons
    qualities: [50, 60, 70, 75],
    formats: ["image/webp"],
    minimumCacheTTL: 3600, // Increase cache TTL to 1 hour
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "img.utfs.io",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "graph.facebook.com",
      },
      {
        protocol: "https",
        hostname: "platform-lookaside.fbsbx.com",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
