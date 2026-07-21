import type { Metadata } from 'next';
import ProfilePageClient from './ProfilePageClient';

export const metadata: Metadata = {
  title: 'Profil — Jogjagem',
  description: 'Kelola profil, lihat riwayat, simpanan, dan ulasan perjalanan Anda di Yogyakarta.',
  openGraph: {
    title: 'Profil — Jogjagem',
    description: 'Kelola profil dan lihat aktivitas perjalanan Anda di Yogyakarta.',
    type: 'website',
  },
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}
