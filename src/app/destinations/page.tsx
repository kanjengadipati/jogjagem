import type { Metadata } from 'next';
import DestinationsPageClient from './DestinationsPageClient';

export const metadata: Metadata = {
  title: 'Destinasi Wisata — Jogjagem',
  description: 'Jelajahi 100+ destinasi wisata terkurasi di Yogyakarta. Temukan Candi Prambanan, Malioboro, Pantai Parangtritis, hidden gems, dan rekomendasi perjalanan terbaik.',
  openGraph: {
    title: 'Destinasi Wisata — Jogjagem',
    description: 'Jelajahi 100+ destinasi wisata terkurasi di Yogyakarta.',
    type: 'website',
  },
};

export default function DestinationsPage() {
  return <DestinationsPageClient />;
}
