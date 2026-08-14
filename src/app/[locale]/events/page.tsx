import type { Metadata } from 'next';
import EventsPageClient from '@/components/EventsPageClient';
import { ItemListJsonLd } from '@/components/JsonLd';
import { fetchAllEvents } from '@/lib/server-events';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

const ITEMLIST_LIMIT = 30;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = 'Events & Festivals';
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
      siteName: 'Jogjagem',
      locale: isEn ? 'en_US' : 'id_ID',
      images: [{ url: `${SITE_URL}/og.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/og.png`],
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/events`,
        'x-default': `${SITE_URL}/events`,
        en: `${SITE_URL}/en/events`,
      },
    },
  };
}

export default async function EventsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const events = await fetchAllEvents(locale);
  const pageUrl = isEn ? `${SITE_URL}/en/events` : `${SITE_URL}/events`;

  return (
    <>
      {events.length > 0 && (
        <ItemListJsonLd
          pageName={isEn ? 'Events & Festivals in Yogyakarta' : 'Acara & Festival di Yogyakarta'}
          pageUrl={pageUrl}
          description={
            isEn
              ? 'A complete collection of events and festivals in Yogyakarta.'
              : 'Kumpulan lengkap acara dan festival di Yogyakarta.'
          }
          items={events.slice(0, ITEMLIST_LIMIT).map((evt, i) => ({
            position: i + 1,
            name: evt.title,
            url: `${SITE_URL}${isEn ? '/en' : ''}/events/${evt.id}`,
          }))}
        />
      )}
      <EventsPageClient />
    </>
  );
}
