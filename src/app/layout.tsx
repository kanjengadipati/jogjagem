import type { Metadata } from 'next';
import { Manrope, Inter, JetBrains_Mono, DM_Serif_Display } from 'next/font/google';
import './globals.css';
import { WebsiteJsonLd } from '@/components/JsonLd';
import I18nProvider from '@/contexts/I18nProvider';
import { Analytics } from '@vercel/analytics/next';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-manrope-family',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter-family',
  display: 'optional',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono-family',
  display: 'optional',
});

const dmSerifDisplay = DM_Serif_Display({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal', 'italic'],
  variable: '--font-display-family',
  display: 'optional',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jogjagem.com';
const SITE_NAME = 'Jogjagem';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

const FALLBACK = {
  title: 'Jogjagem — Jelajahi Yogyakarta Lebih Dalam',
  description: 'Temukan destinasi wisata terbaik di Yogyakarta. Panduan lengkap Candi Prambanan, Malioboro, Pantai Parangtritis, Gunung Merapi, hidden gems, dan 100+ destinasi lainnya.',
  keywords: 'wisata Yogyakarta, jogja, travel guide Yogyakarta, destinasi wisata jogja, Candi Prambanan, Malioboro, Pantai Parangtritis, Gunung Merapi, paket wisata jogja, hidden gems Yogyakarta',
  ogImage: '/og.png',
  twitterHandle: '@jogjagem',
};

async function fetchSiteConfig(): Promise<Record<string, string>> {
  try {
    const res = await fetch(`${API_BASE}/config/seo`, { next: { revalidate: 3600 } });
    if (!res.ok) return {};
    const body = await res.json();
    return body?.data || {};
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const config = await fetchSiteConfig();

  const title = config.site_title || FALLBACK.title;
  const description = config.site_description || FALLBACK.description;
  const keywords = config.site_keywords || FALLBACK.keywords;
  const ogImage = config.og_default_image || FALLBACK.ogImage;
  const twitterHandle = config.twitter_handle || FALLBACK.twitterHandle;

  const keywordList = keywords.split(',').map(k => k.trim()).filter(Boolean);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${SITE_NAME}`,
    },
    description,
    keywords: keywordList,
    authors: [{ name: SITE_NAME }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: 'id_ID',
      alternateLocale: 'en_US',
      url: SITE_URL,
      siteName: SITE_NAME,
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: twitterHandle,
    },
    icons: {
      icon: '/favicon-gold.png',
      apple: '/logo-gold-new.png',
    },
    alternates: {
      canonical: SITE_URL,
      languages: {
        id: SITE_URL,
        en: `${SITE_URL}/en`,
      },
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${manrope.variable} ${inter.variable} ${jetbrainsMono.variable} ${dmSerifDisplay.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <meta name="theme-color" content="#1a1533" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="alternate" href={SITE_URL} hrefLang="id" />
        <link rel="alternate" href={`${SITE_URL}/en`} hrefLang="en" />
        <link rel="alternate" href={SITE_URL} hrefLang="x-default" />
        <WebsiteJsonLd />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
        <Analytics />
      </body>
    </html>
  );
}
