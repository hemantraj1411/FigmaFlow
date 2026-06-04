/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
    ],
    // Add allowed qualities
    qualities: [75, 100],
    // Allow unoptimized for production
    unoptimized: process.env.NODE_ENV === 'production',
  },
  // Output configuration for Vercel
  output: 'standalone',
  // Ignore TypeScript errors during build (temporary)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Ignore ESLint errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;