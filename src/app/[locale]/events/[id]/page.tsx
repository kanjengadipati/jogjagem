import type { Metadata } from 'next';
import EventDetailPageClient from './EventDetailPageClient';
import { EventJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jogjagem.com';

interface EventData {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  image_url: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  max_attendees: number;
  ticket_price: string;
  organizer: string;
  highlights: string[];
  badge?: string;
  badges?: string[];
}

async function fetchEvent(id: string): Promise<EventData | null> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';
    const res = await fetch(`${API_BASE}/events/${id}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data || null;
  } catch {
    return null;
  }
}

type PageProps = { params: Promise<{ id: string; locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const event = await fetchEvent(id);

  if (!event) {
    return {
      title: 'Event Tidak Ditemukan',
      description: 'Event yang Anda cari tidak ditemukan di Jogjagem.',
      robots: { index: false },
    };
  }

  const title = `${event.title} — Events & Festivals Jogjagem`;
  const description = event.description
    ? (event.description.length > 160 ? event.description.slice(0, 157) + '...' : event.description)
    : `Informasi lengkap event ${event.title} di Yogyakarta.`;

  const ogImage = event.image_url || '/og.png';
  const pageUrl = locale === 'en' ? `${SITE_URL}/en/events/${id}` : `${SITE_URL}/events/${id}`;

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      locale: locale === 'en' ? 'en_US' : 'id_ID',
      url: pageUrl,
      siteName: 'Jogjagem',
      title,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/events/${id}`,
        en: `${SITE_URL}/en/events/${id}`,
      },
    },
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const event = await fetchEvent(id);

  return (
    <>
      {event && (
        <>
          <EventJsonLd
            name={event.title}
            description={event.description}
            image={event.image_url}
            url={`${SITE_URL}/events/${id}`}
            startDate={event.start_date}
            endDate={event.end_date}
            location={event.location}
            latitude={event.latitude}
            longitude={event.longitude}
            offers={event.ticket_price ? {
              price: event.ticket_price,
              priceCurrency: 'IDR',
              availability: 'https://schema.org/InStock',
            } : undefined}
          />
          <BreadcrumbJsonLd
            items={[
              { name: 'Beranda', url: SITE_URL },
              { name: 'Events & Festivals', url: `${SITE_URL}/events` },
              { name: event.title, url: `${SITE_URL}/events/${id}` },
            ]}
          />
        </>
      )}
      <EventDetailPageClient id={id} event={event} />
    </>
  );
}
