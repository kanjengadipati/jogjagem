import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['id', 'en'],
  defaultLocale: 'id',
  localePrefix: 'as-needed',
  // Disable Accept-Language header detection. Indonesian is the default;
  // English is only served when the URL has an /en/ prefix OR the user
  // explicitly switched via the LanguageSwitcher (which sets the NEXT_LOCALE cookie).
  localeDetection: false,
});
