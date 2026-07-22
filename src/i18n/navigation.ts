'use client';

import { useRouter as useNextRouter, usePathname as useNextPathname } from 'next/navigation';
import { useLocale } from '@/contexts/LocaleContext';

export function useRouter() {
  const router = useNextRouter();
  const { locale } = useLocale();

  const localizePath = (href: string) => {
    if (!href || typeof href !== 'string' || !href.startsWith('/')) return href;
    if (locale === 'en') {
      if (href.startsWith('/en/') || href === '/en') return href;
      return href === '/' ? '/en' : `/en${href}`;
    } else {
      if (href === '/en' || href === '/en/') return '/';
      if (href.startsWith('/en/')) return href.slice(3);
    }
    return href;
  };

  return {
    ...router,
    push: (href: string, options?: any) => {
      router.push(localizePath(href), options);
    },
    replace: (href: string, options?: any) => {
      router.replace(localizePath(href), options);
    },
    prefetch: (href: string, options?: any) => {
      router.prefetch(localizePath(href), options);
    },
  };
}

export function usePathname() {
  const pathname = useNextPathname();
  if (pathname.startsWith('/en/')) {
    return pathname.slice(3);
  }
  if (pathname === '/en') {
    return '/';
  }
  return pathname;
}
