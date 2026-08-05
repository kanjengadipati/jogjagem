import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DestinationsPageClient from '@/app/[locale]/destinations/DestinationsPageClient';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { toSlug } from '@/lib/slug';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';
const API_BASE  = process.env.NEXT_PUBLIC_API_BASE  || 'http://localhost:8081';

// Maps URL slug → canonical region name stored in destinations.sub_region
const REGION_META: Record<string, {
  dbName: string;   // value stored in sub_region column
  id: string;       // display name Indonesian
  en: string;       // display name English
  descId: string;
  descEn: string;
}> = {
  'kota-yogyakarta': {
    dbName: 'Yogyakarta',
    id: 'Kota Yogyakarta',
    en: 'Yogyakarta City',
    descId: 'Temukan destinasi wisata terbaik di Kota Yogyakarta — pusat budaya, kuliner, dan sejarah Jogja.',
    descEn: 'Discover the best tourist destinations in Yogyakarta City — the cultural, culinary, and historical heart of Jogja.',
  },
  sleman: {
    dbName: 'Sleman',
    id: 'Sleman',
    en: 'Sleman',
    descId: 'Jelajahi destinasi wisata di Sleman — dari Candi Prambanan hingga lereng Gunung Merapi.',
    descEn: 'Explore tourist destinations in Sleman — from Prambanan Temple to the slopes of Mount Merapi.',
  },
  bantul: {
    dbName: 'Bantul',
    id: 'Bantul',
    en: 'Bantul',
    descId: 'Temukan destinasi wisata di Bantul — pantai Parangtritis, kerajinan perak Kotagede, dan lebih banyak lagi.',
    descEn: 'Discover destinations in Bantul — Parangtritis beach, Kotagede silver craft, and much more.',
  },
  'kulon-progo': {
    dbName: 'Kulon Progo',
    id: 'Kulon Progo',
    en: 'Kulon Progo',
    descId: 'Wisata alam dan budaya di Kulon Progo — perbukitan Menoreh, air terjun, dan desa wisata.',
    descEn: 'Nature and cultural tourism in Kulon Progo — Menoreh hills, waterfalls, and cultural villages.',
  },
  gunungkidul: {
    dbName: 'Gunungkidul',
    id: 'Gunungkidul',
    en: 'Gunungkidul',
    descId: 'Wisata Gunungkidul — pantai karst memukau, gua tersembunyi, dan bentang alam yang unik.',
    descEn: 'Gunungkidul tourism — stunning karst beaches, hidden caves, and unique landscapes.',
  },
  'near-yogyakarta': {
    dbName: 'Near Yogyakarta',
    id: 'Dekat Yogyakarta',
    en: 'Near Yogyakarta',
    descId: 'Destinasi wisata di sekitar Yogyakarta — Borobudur, Magelang, dan tempat menarik di luar DIY.',
    descEn: 'Destinations near Yogyakarta — Borobudur, Magelang, and attractions just outside DIY province.',
  },
};

type PageProps = { params: Promise<{ region: string; locale: string }> };

// Fetch a lightweight list of destinations for JSON-LD ItemList (SSR only)
async function fetchRegionDestinations(dbName: string, locale: string) {
  try {
    const res = await fetch(`${API_BASE}/locations/${encodeURIComponent(
      Object.entries(REGION_META).find(([, v]) => v.dbName === dbName)?.[0] ?? ''
    )}`, {
      headers: { 'Accept-Language': locale },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body = await res.json();
    return (body?.data?.destinations ?? []) as Array<{ id: string; name: string }>;
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  return Object.keys(REGION_META).flatMap((region) => [
    { locale: 'id', region },
    { locale: 'en', region },
  ]);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { region, locale } = await params;
  const isEn = locale === 'en';
  const meta = REGION_META[region];
  if (!meta) return { title: 'Region Not Found', robots: { index: false, follow: false } };

  const title = isEn
    ? `${meta.en} Destinations — Best Places to Visit | Jogjagem`
    : `Wisata ${meta.id} — Destinasi Terbaik | Jogjagem`;
  const description = isEn ? meta.descEn : meta.descId;
  const pageUrl = isEn
    ? `${SITE_URL}/en/location/${region}`
    : `${SITE_URL}/location/${region}`;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', url: pageUrl },
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/location/${region}`,
        en: `${SITE_URL}/en/location/${region}`,
      },
    },
  };
}

export default async function LocationPage({ params }: PageProps) {
  const { region, locale } = await params;
  const isEn = locale === 'en';
  const meta = REGION_META[region];
  if (!meta) notFound();

  const destinations = await fetchRegionDestinations(meta.dbName, locale);
  const regionName = isEn ? meta.en : meta.id;
  const pageUrl = isEn
    ? `${SITE_URL}/en/location/${region}`
    : `${SITE_URL}/location/${region}`;

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: SITE_URL },
          { name: isEn ? 'Destinations' : 'Destinasi', url: `${SITE_URL}/${locale === 'en' ? 'en/' : ''}destinations` },
          { name: regionName, url: pageUrl },
        ]}
      />
      {destinations.length > 0 && (
        <ItemListJsonLd
          pageName={isEn ? `${meta.en} Tourist Destinations` : `Destinasi Wisata ${meta.id}`}
          pageUrl={pageUrl}
          description={isEn ? meta.descEn : meta.descId}
          items={destinations.slice(0, 20).map((d, i) => ({
            position: i + 1,
            name: d.name,
            url: `${SITE_URL}${locale === 'en' ? '/en' : ''}/destinations/${toSlug(d.name)}`,
          }))}
        />
      )}
      {/* Reuse DestinationsPageClient with region pre-filter — same UI, same components */}
      <DestinationsPageClient initialRegion={meta.dbName} />
    </>
  );
}
