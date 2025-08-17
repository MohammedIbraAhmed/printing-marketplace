import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@/components', '@/lib'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.R2_CUSTOM_DOMAIN || 'placeholder.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
}

export default nextConfig
