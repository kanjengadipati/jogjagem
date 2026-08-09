'use client';

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import idMessages from '@/messages/id.json';
import enMessages from '@/messages/en.json';
import { setApiLocale } from '@/lib/api';
import { categoryToSlug, slugToCategory } from '@/lib/category-slugs';

type Locale = 'id' | 'en';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const messages: Record<Locale, Record<string, any>> = { id: idMessages, en: enMessages };

function getNestedValue(obj: Record<string, any>, path: string): string | undefined {
  const keys = path.split('.');
  let current: any = obj;
  for (const key of keys) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[key];
  }
  return typeof current === 'string' ? current : undefined;
}

function localizeCategoryRoute(path: string, locale: Locale) {
  const parts = path.split('/').filter(Boolean);
  if (parts.length !== 2 || parts[0] !== 'destinations') return path;

  const category = slugToCategory(parts[1]);
  if (!category) return path;

  return `/destinations/${categoryToSlug(category, locale)}`;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: React.ReactNode;
  locale: Locale;
}

export function LocaleProvider({ children, locale }: LocaleProviderProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setApiLocale(locale);
  }, [locale]);

  const setLocale = useCallback((newLocale: Locale) => {
    setApiLocale(newLocale);
    try {
      // Always write the cookie so the middleware never falls back to
      // Accept-Language detection (which is now disabled). Setting it
      // explicitly on both id→en and en→id keeps state consistent.
      localStorage.setItem('locale', newLocale);
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    } catch { /* ignore */ }

    const basePath = pathname.startsWith('/en/') ? pathname.slice(3) : pathname === '/en' ? '/' : pathname;
    const localizedPath = localizeCategoryRoute(basePath, newLocale);
    let targetPath: string;

    if (newLocale === 'en') {
      if (pathname.startsWith('/en')) {
        targetPath = localizedPath === '/' ? '/en' : `/en${localizedPath}`;
      } else {
        targetPath = localizedPath === '/' ? '/en' : `/en${localizedPath}`;
      }
    } else {
      if (pathname === '/en' || pathname === '/en/') {
        targetPath = '/';
      } else if (pathname.startsWith('/en/')) {
        targetPath = localizedPath;
      } else {
        targetPath = localizedPath;
      }
    }

    router.push(targetPath);
    router.refresh();
  }, [router, pathname]);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    let value = getNestedValue(messages[locale], key) ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
      }
    }
    return value;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used within LocaleProvider');
  return context;
}
