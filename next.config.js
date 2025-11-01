/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    // Temporarily ignore build errors
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore eslint during build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig