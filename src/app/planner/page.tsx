import type { Metadata } from 'next';
import PlannerPageClient from './PlannerPageClient';

export const metadata: Metadata = {
  title: 'Trip Planner — Jogjagem',
  description: 'Rencanakan perjalanan wisata ke Yogyakarta dengan AI. Pilih destinasi, atur jadwal, dan dapatkan rekomendasi terbaik.',
  openGraph: {
    title: 'Trip Planner — Jogjagem',
    description: 'Rencanakan perjalanan wisata ke Yogyakarta dengan AI.',
    type: 'website',
  },
};

export default function PlannerPage() {
  return <PlannerPageClient />;
}
