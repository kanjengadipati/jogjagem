import type { Metadata } from 'next';
import PlannerPageClient from './PlannerPageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = isEn ? 'AI Trip Planner — Jogjagem' : 'Trip Planner — Jogjagem';
  const description = isEn
    ? 'Plan your trip to Yogyakarta with AI. Select destinations, manage schedules, and get the best recommendations.'
    : 'Rencanakan perjalanan wisata ke Yogyakarta dengan AI. Pilih destinasi, atur jadwal, dan dapatkan rekomendasi terbaik.';

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

export default function PlannerPage() {
  return <PlannerPageClient />;
}
