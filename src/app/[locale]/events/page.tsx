import type { Metadata } from 'next';
import EventsPageClient from '@/components/EventsPageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = isEn ? 'Events & Festivals — Jogjagem' : 'Events & Festivals — Jogjagem';
  const description = isEn
    ? 'Find interesting events and festivals in Yogyakarta. Cultural shows, seasonal highlights, and local celebrations.'
    : 'Temukan acara dan festival menarik di Yogyakarta. Cultural shows, seasonal highlights, dan perayaan lokal.';

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

export default function EventsPage() {
  return <EventsPageClient />;
}
