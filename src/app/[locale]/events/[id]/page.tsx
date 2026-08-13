import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventDetailPageClient from './EventDetailPageClient';
import { EventJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

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

async function fetchEvent(id: string, locale: string): Promise<EventData | null> {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';
    const res = await fetch(`${API_BASE}/events/${id}`, {
      headers: { 'Accept-Language': locale === 'en' ? 'en' : 'id' },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data || null;
  } catch {
    return null;
  }
}

type PageProps = { params: Promise<{ id: string; locale: string }> };

/** Returns an absolute OG image URL, proxying external images through our domain. */
function resolveOgImage(imageUrl: string | null | undefined): string {
  const fallback = `${SITE_URL}/og.png`;
  if (!imageUrl) return fallback;
  // Already on our domain — use as-is
  if (imageUrl.startsWith(SITE_URL) || imageUrl.startsWith('/')) {
    return imageUrl.startsWith('/') ? `${SITE_URL}${imageUrl}` : imageUrl;
  }
  // External image — proxy it so Google can crawl it from our domain
  return `${SITE_URL}/api/og-proxy?url=${encodeURIComponent(imageUrl)}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, locale } = await params;
  const isEn = locale === 'en';

  try {
    const event = await fetchEvent(id, locale);

    if (!event) {
      return {
        title: isEn ? 'Event Not Found' : 'Event Tidak Ditemukan',
        description: isEn
          ? 'The event you are looking for was not found on Jogjagem.'
          : 'Event yang Anda cari tidak ditemukan di Jogjagem.',
        robots: { index: false, follow: false },
      };
    }

    const title = `${event.title} — Events & Festivals`;
    const description = event.description
      ? (event.description.length > 160 ? event.description.slice(0, 157) + '...' : event.description)
      : `Informasi lengkap event ${event.title} di Yogyakarta.`;

    const ogImage = resolveOgImage(event.image_url);
    const pageUrl = isEn ? `${SITE_URL}/en/events/${id}` : `${SITE_URL}/events/${id}`;

    return {
      title,
      description,
      openGraph: {
        type: 'article',
        locale: isEn ? 'en_US' : 'id_ID',
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
          'x-default': `${SITE_URL}/events/${id}`,
          en: `${SITE_URL}/en/events/${id}`,
        },
      },
    };
  } catch (err) {
    console.error(`[events/${id}] generateMetadata failed:`, err);
    return {
      title: isEn ? 'Event in Yogyakarta' : 'Event di Yogyakarta',
      description: isEn
        ? 'Discover events and festivals in Yogyakarta.'
        : 'Temukan event dan festival terbaru di Yogyakarta.',
    };
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id, locale } = await params;
  const isEn = locale === 'en';
  const event = await fetchEvent(id, locale);

  return (
    <>
      {event && (
        <>
          <EventJsonLd
            name={event.title}
            description={event.description}
            image={event.image_url}
            url={isEn ? `${SITE_URL}/en/events/${id}` : `${SITE_URL}/events/${id}`}
            startDate={event.start_date}
            endDate={event.end_date}
            location={event.location}
            latitude={event.latitude}
            longitude={event.longitude}
            organizer={event.organizer}
            offers={event.ticket_price ? {
              price: event.ticket_price,
              priceCurrency: 'IDR',
            } : undefined}
          />
          <BreadcrumbJsonLd
            items={[
              { name: isEn ? 'Home' : 'Beranda', url: isEn ? `${SITE_URL}/en` : SITE_URL },
              { name: 'Events & Festivals', url: isEn ? `${SITE_URL}/en/events` : `${SITE_URL}/events` },
              { name: event.title, url: isEn ? `${SITE_URL}/en/events/${id}` : `${SITE_URL}/events/${id}` },
            ]}
          />
        </>
      )}
      <EventDetailPageClient id={id} event={event} />
    </>
  );
}
