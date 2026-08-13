import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    // Legacy seed data had "&" slugified into literal "andamp" (HTML entity
    // `&amp;` leaked into the slug). Slugs were corrected in the DB; keep the
    // old URLs resolving to the corrected ones.
    const andampToAnd: Array<[string, string]> = [
      ['borobudur-andamp-prambanan-water-color-heritage-exhibition', 'borobudur-and-prambanan-water-color-heritage-exhibition'],
      ['festival-gamelan-andamp-langen-cerita', 'festival-gamelan-and-langen-cerita'],
      ['mahakarya-borobudur-hair-style-andamp-fashion', 'mahakarya-borobudur-hair-style-and-fashion'],
      ['prambanan-festival-2017-music-art-andamp-culinary', 'prambanan-festival-2017-music-art-and-culinary'],
      ['prambanan-music-art-andamp-culture', 'prambanan-music-art-and-culture'],
      ['ratu-boko-yoga-andamp-meditation-day', 'ratu-boko-yoga-and-meditation-day'],
      ['safe-andamp-healthy-yoga-di-candi-prambanan', 'safe-and-healthy-yoga-di-candi-prambanan'],
      ['sounds-of-borobudur-cultural-andamp-music-camp', 'sounds-of-borobudur-cultural-and-music-camp'],
      ['meditation-andamp-yoga', 'meditation-and-yoga'],
      ['samadha-pranic-healing-andamp-meditation', 'samadha-pranic-healing-and-meditation'],
    ];
    const andampRedirects = andampToAnd.flatMap(([from, to]) => [
      { source: `/events/${from}`, destination: `/events/${to}`, permanent: true },
      { source: `/:locale(en|id)/events/${from}`, destination: `/:locale/events/${to}`, permanent: true },
      { source: `/destinations/${from}`, destination: `/destinations/${to}`, permanent: true },
      { source: `/:locale(en|id)/destinations/${from}`, destination: `/:locale/destinations/${to}`, permanent: true },
    ]);

    return [
      ...andampRedirects,
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
