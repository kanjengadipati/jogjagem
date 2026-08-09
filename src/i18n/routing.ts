import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['id', 'en'],
  defaultLocale: 'id',
  localePrefix: 'as-needed',
  // Disable Accept-Language header detection. Indonesian is the default;
  // English is only served when the URL has an /en/ prefix OR the user
  // explicitly switched via the LanguageSwitcher (which sets the NEXT_LOCALE cookie).
  localeDetection: false,
  // Do not let the middleware write a NEXT_LOCALE cookie on every request.
  // Without this, every SSR response gets set-cookie which forces Next.js to
  // emit cache-control: no-store — making the page uncacheable and preventing
  // Google from indexing it. The LanguageSwitcher writes the cookie explicitly
  // via document.cookie when the user actually switches language, so locale
  // persistence still works correctly for real users.
  localeCookie: false,
});
