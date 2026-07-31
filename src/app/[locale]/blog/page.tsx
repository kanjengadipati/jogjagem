import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import BlogListClient from './BlogListClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Blog & Travel Guides — Jogjagem'
    : 'Blog & Panduan Wisata — Jogjagem';
  const description = isEn
    ? 'Discover travel guides, itineraries, local food recommendations, and hidden gems in Yogyakarta. Practical tips for your next Jogja trip.'
    : 'Temukan panduan wisata, itinerary, rekomendasi kuliner, dan hidden gems di Yogyakarta. Tips praktis untuk perjalananmu ke Jogja berikutnya.';

  const pageUrl = isEn ? `${SITE_URL}/en/blog` : `${SITE_URL}/blog`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: pageUrl,
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/blog`,
        en: `${SITE_URL}/en/blog`,
      },
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'blog' });

  return (
    <BlogListClient
      locale={locale}
      messages={{
        title: t('title'),
        subtitle: t('subtitle'),
        all_articles: t('all_articles'),
        read_more: t('read_more'),
        min_read: t('min_read'),
        by: t('by'),
        loading: t('loading'),
        empty: t('empty'),
        search_placeholder: t('search_placeholder'),
        cat_panduan: t('cat_panduan'),
        cat_itinerary: t('cat_itinerary'),
        cat_kuliner: t('cat_kuliner'),
        cat_budaya: t('cat_budaya'),
        cat_alam: t('cat_alam'),
        cat_tips: t('cat_tips'),
        cat_lainnya: t('cat_lainnya'),
      }}
    />
  );
}