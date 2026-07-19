import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
  turbopack: {
    root: path.join(__dirname, '..'),
  },
};
export default nextConfig;
