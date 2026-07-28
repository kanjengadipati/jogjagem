'use client';

import { LocaleProvider } from './LocaleContext';
import { AuthProvider } from './AuthContext';
import { LocationProvider } from './LocationContext';

export default function I18nProvider({ children, locale }: { children: React.ReactNode; locale: 'id' | 'en' }) {
  return (
    <LocaleProvider locale={locale}>
      <AuthProvider>
        <LocationProvider>
          {children}
        </LocationProvider>
      </AuthProvider>
    </LocaleProvider>
  );
}
