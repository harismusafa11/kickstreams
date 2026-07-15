import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "streamfree.top",
      },
      {
        protocol: "https",
        hostname: "**.espncdn.com",
      },
      {
        protocol: "https",
        hostname: "**.espn.com",
      },
    ],
  },
};

export default nextConfig;
