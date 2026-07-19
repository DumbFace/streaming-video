import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  output: 'standalone',
  devIndicators: false,
  allowedDevOrigins: ['streaming-dev.dumbface.org'],
  turbopack: {
    root: path.join(__dirname, '..'),
  },
};
export default nextConfig;
