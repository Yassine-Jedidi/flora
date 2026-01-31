import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.65",
    "192.168.1.*", // Allow all devices on local network
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "img.utfs.io",
      },
    ],
  },
};

export default nextConfig;
