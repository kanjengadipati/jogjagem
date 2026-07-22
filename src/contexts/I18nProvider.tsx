'use client';

import { LocaleProvider } from './LocaleContext';

export default function I18nProvider({ children, locale }: { children: React.ReactNode; locale: 'id' | 'en' }) {
  return <LocaleProvider locale={locale}>{children}</LocaleProvider>;
}
