import type { NextConfig } from "next";
import path, { join } from "path";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "10gb",
    },
  },
  transpilePackages: ["@lib/shared/src/*"],

  turbopack: {
    root: path.join(__dirname, ".."),
  },
};
export default nextConfig;
