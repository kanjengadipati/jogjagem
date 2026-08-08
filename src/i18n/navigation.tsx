'use client';

import NextLink from 'next/link';
import { useRouter as useNextRouter, usePathname as useNextPathname } from 'next/navigation';
import { useLocale } from '@/contexts/LocaleContext';
import { ComponentProps } from 'react';

const applyLocale = (href: string, locale: string) => {
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

export function useRouter() {
  const router = useNextRouter();
  const { locale } = useLocale();

  return {
    ...router,
    push: (href: string, options?: any) => {
      router.push(applyLocale(href, locale), options);
    },
    replace: (href: string, options?: any) => {
      router.replace(applyLocale(href, locale), options);
    },
    prefetch: (href: string, options?: any) => {
      router.prefetch(applyLocale(href, locale), options);
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

export function Link({ href, ...props }: { href: string } & ComponentProps<typeof NextLink>) {
  const { locale } = useLocale();
  return <NextLink href={applyLocale(href, locale)} {...props} />;
}
