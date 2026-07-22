import type { Metadata } from 'next';
import MapPageClient from './MapPageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = isEn ? 'Interactive Map — Jogjagem' : 'Peta Interaktif — Jogjagem';
  const description = isEn
    ? 'Find tourist destinations in Yogyakarta through an interactive map. Search by category, rating, and distance.'
    : 'Temukan destinasi wisata di Yogyakarta melalui peta interaktif. Cari berdasarkan kategori, rating, dan jarak.';

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

export default function MapPage() {
  return <MapPageClient />;
}
