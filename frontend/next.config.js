/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['localhost', 'figmaflow.onrender.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove swcMinify - it's enabled by default in Next.js 14+
  // Add these for better Vercel compatibility
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  reactStrictMode: true,
}

module.exports = nextConfig