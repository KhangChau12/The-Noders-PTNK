/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/education/data-science-module-1',
        destination: '/education/ds-and-ai-01',
        permanent: true,
      },
      {
        source: '/education/data-science-module-1/:path*',
        destination: '/education/ds-and-ai-01/:path*',
        permanent: true,
      },
    ]
  },
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