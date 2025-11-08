import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Generate a static export so Cloudflare Workers can serve the prebuilt assets.
  output: "export",
};

export default nextConfig;
