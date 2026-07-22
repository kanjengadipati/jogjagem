import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - API routes (/api/*)
    // - Static files (/assets/*, /images/*, /favicon*, etc.)
    // - Next.js internal paths (/_next/*)
    // - Common manifest files (manifest.webmanifest, sitemap.xml, robots.txt)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ]
};
