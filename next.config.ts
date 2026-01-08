import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Transpile maplibre-gl-draw as it uses ES modules
  transpilePackages: ["maplibre-gl-draw"],
};

export default nextConfig;
