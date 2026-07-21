import type { Metadata } from 'next';
import MapPageClient from './MapPageClient';

export const metadata: Metadata = {
  title: 'Peta Interaktif — Jogjagem',
  description: 'Temukan destinasi wisata di Yogyakarta melalui peta interaktif. Cari berdasarkan kategori, rating, dan jarak.',
  openGraph: {
    title: 'Peta Interaktif — Jogjagem',
    description: 'Temukan destinasi wisata di Yogyakarta melalui peta interaktif.',
    type: 'website',
  },
};

export default function MapPage() {
  return <MapPageClient />;
}
