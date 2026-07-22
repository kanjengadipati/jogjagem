import type { Metadata } from 'next';
import DestinationsPageClient from './DestinationsPageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = isEn ? 'Tourist Destinations — Jogjagem' : 'Destinasi Wisata — Jogjagem';
  const description = isEn
    ? 'Explore 100+ curated tourist destinations in Yogyakarta. Discover Prambanan Temple, Malioboro, Parangtritis Beach, hidden gems, and travel recommendations.'
    : 'Jelajahi 100+ destinasi wisata terkurasi di Yogyakarta. Temukan Candi Prambanan, Malioboro, Pantai Parangtritis, hidden gems, dan rekomendasi perjalanan terbaik.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default function DestinationsPage() {
  return <DestinationsPageClient />;
}
