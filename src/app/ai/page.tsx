import type { Metadata } from 'next';
import AIPageClient from './AIPageClient';

export const metadata: Metadata = {
  title: 'Asisten AI — Jogjagem',
  description: 'Tanya AI untuk rekomendasi wisata di Yogyakarta. Dapatkan saran perjalanan, rekomendasi destinasi, dan tips liburan.',
  openGraph: {
    title: 'Asisten AI — Jogjagem',
    description: 'Tanya AI untuk rekomendasi wisata di Yogyakarta.',
    type: 'website',
  },
};

export default function AIPage() {
  return <AIPageClient />;
}
