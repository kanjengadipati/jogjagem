import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { DESTINATION_REDIRECTS } from './lib/destination-redirects';

export default async function middleware(request: NextRequest) {
  // Redirect renamed destination slugs BEFORE i18n locale handling so the old
  // URLs (still linked externally / by Google) 301 to the canonical replacement.
  const pathname = request.nextUrl.pathname;
  if (pathname.startsWith('/destinations/') || pathname.startsWith('/en/destinations/')) {
    const normalized = pathname.replace(/\/+$/, '');
    const target = DESTINATION_REDIRECTS[normalized];
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      return NextResponse.redirect(url, 301);
    }
  }

  return createMiddleware(routing)(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - API routes (/api/*)
    // - Static files (/assets/*, /images/*, /favicon*, etc.)
    // - Next.js internal paths (/_next/*)
    // - Common manifest files (manifest.webmanifest, sitemap.xml, robots.txt)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
