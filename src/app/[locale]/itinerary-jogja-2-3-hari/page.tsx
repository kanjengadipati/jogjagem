import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchItineraryDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import ItineraryJogjaClient from './ItineraryJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Ideal 2–3 Days Yogyakarta Travel Itinerary & Guide (2026)'
    : 'Itinerary 2–3 Hari di Jogja: Panduan Rute Liburan Seru (2026)';

  const description = isEn
    ? 'The ultimate 2 to 3-day travel itinerary for Yogyakarta. Step-by-step route covering Kraton, Malioboro, Borobudur/Prambanan, nature, and food.'
    : 'Panduan itinerary liburan 2-3 hari di Jogja paling efisien dan seru. Rute lengkap meliputi wisata budaya, spot sunset, wisata alam, dan kuliner khas.';

  const keywords = isEn
    ? 'itinerary jogja 3 hari, 3 day yogyakarta itinerary, 2 days in jogja, rute liburan jogja, panduan wisatain jogja'
    : 'itinerary jogja, itinerary 2 hari jogja, itinerary 3 hari jogja, rute wisata jogja 2-3 hari, panduan liburan jogja 2026';

  const pageUrl = isEn
    ? `${SITE_URL}/en/itinerary-jogja-2-3-hari`
    : `${SITE_URL}/itinerary-jogja-2-3-hari`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url: pageUrl,
      siteName: 'Jogjagem',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/itinerary-jogja-2-3-hari`,
        en: `${SITE_URL}/en/itinerary-jogja-2-3-hari`,
      },
    },
  };
}

export default async function ItineraryJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchItineraryDestinations(locale);

  const pageUrl = isEn
    ? `${SITE_URL}/en/itinerary-jogja-2-3-hari`
    : `${SITE_URL}/itinerary-jogja-2-3-hari`;

  const pageName = isEn
    ? '2-3 Day Yogyakarta Travel Itinerary'
    : 'Itinerary 2-3 Hari di Jogja';

  const description = isEn
    ? 'Step-by-step itinerary guide for 2 to 3 days trip to Yogyakarta.'
    : 'Rencana rute perjalanan liburan 2-3 hari terbaik di Yogyakarta.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? '2-3 Day Itinerary' : 'Itinerary 2-3 Hari', url: pageUrl },
        ]}
      />
      {destinations.length > 0 && (
        <ItemListJsonLd
          pageName={pageName}
          pageUrl={pageUrl}
          description={description}
          items={destinations.map((d, i) => ({
            position: i + 1,
            name: d.name,
            url: `${SITE_URL}${isEn ? '/en' : ''}/destinations/${toSlug(d.name)}`,
          }))}
        />
      )}
      <ItineraryJogjaClient destinations={destinations} locale={locale} />
    </>
  );
}
