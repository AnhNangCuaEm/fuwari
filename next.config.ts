import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'], // Google profile pictures
  },
};

export default withNextIntl(nextConfig);
