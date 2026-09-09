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
    // Serve modern formats where the browser supports them.
    formats: ['image/avif', 'image/webp'],
    // Optimized images are immutable for a given URL — cache them for 31 days
    // instead of the 60s default so repeat visits skip re-optimization.
    minimumCacheTTL: 60 * 60 * 24 * 31,
  },
  // Strip console.* (except warn/error) from the production client bundle.
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? { exclude: ['error', 'warn'] }
        : false,
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