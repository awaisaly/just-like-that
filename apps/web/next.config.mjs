import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@jlt/ui', '@jlt/shared'],
  outputFileTracingRoot: path.join(__dirname, '../..'),
  experimental: {
    optimizePackageImports: ['@jlt/ui', 'date-fns'],
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/guides/paying-for-flights-in-instalments',
        destination: '/contact',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
