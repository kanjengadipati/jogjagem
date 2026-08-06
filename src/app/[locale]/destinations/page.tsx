import type { Metadata } from 'next';
import DestinationsPageClient from './DestinationsPageClient';
import { fetchAllDestinations } from '@/lib/server-destinations';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = isEn ? 'Tourist Destinations — Jogjagem' : 'Destinasi Wisata — Jogjagem';
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
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/destinations`,
        en: `${SITE_URL}/en/destinations`,
      },
    },
  };
}

export default async function DestinationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const initialDestinations = await fetchAllDestinations(locale);
  return <DestinationsPageClient initialDestinations={initialDestinations} />;
}
