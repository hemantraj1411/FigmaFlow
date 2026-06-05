/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Add this to fix the quality warning
    qualities: [75, 100],
  },
  output: 'standalone',
}

module.exports = nextConfig