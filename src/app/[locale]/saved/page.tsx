import type { Metadata } from 'next';
import SavedPageClient from './SavedPageClient';

export const metadata: Metadata = {
  title: 'Simpanan',
  description: 'Lihat destinasi wisata yang Anda simpan di Yogyakarta.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Simpanan',
    description: 'Lihat destinasi wisata yang Anda simpan di Yogyakarta.',
    type: 'website',
  },
};

export default function SavedPage() {
  return <SavedPageClient />;
}
