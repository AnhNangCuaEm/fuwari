import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'], // Google profile pictures
    remotePatterns: [
      // HTTP only for localhost development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      // HTTPS for production (when NEXT_PUBLIC_HOST is set)
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_HOST || 'localhost',
        pathname: '/uploads/**',
      },
      // Add HTTP fallback only for non-production environments
      ...(process.env.NODE_ENV !== 'production' ? [{
        protocol: 'http' as const,
        hostname: process.env.NEXT_PUBLIC_HOST || 'localhost',
        port: process.env.NEXT_PUBLIC_PORT || '',
        pathname: '/uploads/**',
      }] : []),
      // Vercel Blob Storage
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Exclude mysql2 and other Node.js modules from client-side bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
