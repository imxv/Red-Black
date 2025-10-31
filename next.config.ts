import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "freeimage.host",
      },
      {
        protocol: "https",
        hostname: "iili.io",
      },
    ],
  },
};

export default nextConfig;
