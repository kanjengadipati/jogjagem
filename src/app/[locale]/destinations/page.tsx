import type { Metadata } from 'next';
import DestinationsPageClient from './DestinationsPageClient';
import { ItemListJsonLd } from '@/components/JsonLd';
import { fetchAllDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

const ITEMLIST_LIMIT = 30;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = isEn ? 'Tourist Destinations' : 'Destinasi Wisata';
  const description = isEn
    ? 'Explore 100+ curated tourist destinations in Yogyakarta. Discover Prambanan Temple, Malioboro, Parangtritis Beach, hidden gems, and travel recommendations.'
    : 'Jelajahi 100+ destinasi wisata terkurasi di Yogyakarta. Temukan Candi Prambanan, Malioboro, Pantai Parangtritis, hidden gems, dan rekomendasi perjalanan terbaik.';

  const pageUrl = isEn ? `${SITE_URL}/en/destinations` : `${SITE_URL}/destinations`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: pageUrl,
      siteName: 'Jogjagem',
      locale: isEn ? 'en_US' : 'id_ID',
      images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/og.png`],
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/destinations`,
        'x-default': `${SITE_URL}/destinations`,
        en: `${SITE_URL}/en/destinations`,
      },
    },
  };
}

export default async function DestinationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const initialDestinations = await fetchAllDestinations(locale);
  const pageUrl = isEn ? `${SITE_URL}/en/destinations` : `${SITE_URL}/destinations`;

  return (
    <>
      {initialDestinations.length > 0 && (
        <ItemListJsonLd
          pageName={isEn ? 'All Tourist Destinations in Yogyakarta' : 'Semua Destinasi Wisata di Yogyakarta'}
          pageUrl={pageUrl}
          description={
            isEn
              ? 'A complete collection of tourist destinations in Yogyakarta.'
              : 'Kumpulan lengkap destinasi wisata di Yogyakarta.'
          }
          items={initialDestinations.slice(0, ITEMLIST_LIMIT).map((d, i) => ({
            position: i + 1,
            name: d.name,
            url: `${SITE_URL}${isEn ? '/en' : ''}/destinations/${toSlug(d.name)}`,
          }))}
        />
      )}
      <DestinationsPageClient initialDestinations={initialDestinations} />
    </>
  );
}
