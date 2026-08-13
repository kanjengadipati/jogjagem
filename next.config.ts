import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      { source: '/:locale(en|id)/partner', destination: '/:locale/business', permanent: true },
      { source: '/hidden-gem', destination: '/destinations/hidden-gem', permanent: true },
      { source: '/:locale(en|id)/hidden-gem', destination: '/:locale/destinations/hidden-gem', permanent: true },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/pleco/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081'}/:path*`,
      },
    ];
  },
  images: {
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'commons.wikimedia.org' },
      { protocol: 'https', hostname: 'tourismdev.id' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'www.prambanan.ac.id' },
      { protocol: 'https', hostname: 'www.prambanan.co.id' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com' },
      { protocol: 'https', hostname: 'assets.yogyakarta.go.id' },
    ],
  },
};

export default withNextIntl(nextConfig);
