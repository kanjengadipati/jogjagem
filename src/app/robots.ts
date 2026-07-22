import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jogjagem.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/profile', '/saved'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
