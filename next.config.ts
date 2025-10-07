import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'], // Google profile pictures
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: process.env.NEXT_PUBLIC_HOST || 'localhost',
        port: process.env.NEXT_PUBLIC_PORT || '',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_HOST || 'localhost',
        pathname: '/uploads/**',
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
