/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/Sopranostampi',
  assetPrefix: '/Sopranostampi/',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
};

module.exports = nextConfig;
