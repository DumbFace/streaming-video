import type { NextConfig } from "next";
import path, { join } from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  devIndicators: false,

  transpilePackages: ["@lib/shared/src/*"],

  turbopack: {
    root: path.join(__dirname, ".."),
  },
};
export default nextConfig;
