import type { Metadata } from 'next';
import EventsPageClient from '@/components/EventsPageClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = isEn ? 'Events & Festivals — Jogjagem' : 'Events & Festivals — Jogjagem';
  const description = isEn
    ? 'Find interesting events and festivals in Yogyakarta. Cultural shows, seasonal highlights, and local celebrations.'
    : 'Temukan acara dan festival menarik di Yogyakarta. Cultural shows, seasonal highlights, dan perayaan lokal.';

  const pageUrl = isEn ? `${SITE_URL}/en/events` : `${SITE_URL}/events`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: pageUrl,
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/events`,
        en: `${SITE_URL}/en/events`,
      },
    },
  };
}

export default function EventsPage() {
  return <EventsPageClient />;
}