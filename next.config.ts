import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dynamic app with authentication and database - cannot use static export
  // Will deploy to Vercel or similar platform that supports SSR
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
};

export default nextConfig;
