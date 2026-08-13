import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchAllDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import WisataJogjaClient from './WisataJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

// How many destinations to feature in the listicle. Keep this modest —
// the API already returns destinations sorted trending > hidden_gem > rating,
// so the top slice is the "most popular" set without needing new backend work.
const FEATURED_COUNT = 30;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? `${FEATURED_COUNT}+ Most Popular Tourist Attractions in Yogyakarta (2026)`
    : `${FEATURED_COUNT}+ Tempat Wisata Jogja Paling Populer (2026)`;

  const description = isEn
    ? 'A curated list of the most popular places to visit in Yogyakarta right now — from iconic temples and beaches to trending hidden gems. Updated regularly.'
    : 'Daftar tempat wisata Jogja paling populer saat ini — mulai dari candi dan pantai ikonik hingga hidden gem yang lagi trending. Diperbarui berkala.';

  const keywords = isEn
    ? 'tourist attractions yogyakarta, things to do in jogja, best places to visit yogyakarta, popular yogyakarta destinations 2026'
    : 'tempat wisata jogja, wisata jogja terpopuler, destinasi wisata yogyakarta, tempat wisata jogja 2026, wisata jogja terbaru';

  const pageUrl = isEn ? `${SITE_URL}/en/wisata-jogja` : `${SITE_URL}/wisata-jogja`;

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
        id: `${SITE_URL}/wisata-jogja`,
        'x-default': `${SITE_URL}/wisata-jogja`,
        en: `${SITE_URL}/en/wisata-jogja`,
      },
    },
  };
}

export default async function WisataJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const all = await fetchAllDestinations(locale);
  const eligible = all.filter((d) => d.category?.toLowerCase() !== 'culinary');
  const featured = eligible.slice(0, FEATURED_COUNT);

  const pageUrl = isEn ? `${SITE_URL}/en/wisata-jogja` : `${SITE_URL}/wisata-jogja`;
  const pageName = isEn
    ? `${FEATURED_COUNT}+ Most Popular Tourist Attractions in Yogyakarta`
    : `${FEATURED_COUNT}+ Tempat Wisata Jogja Paling Populer`;
  const description = isEn
    ? 'A curated list of the most popular places to visit in Yogyakarta right now.'
    : 'Daftar tempat wisata Jogja paling populer saat ini.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Popular Destinations' : 'Wisata Jogja', url: pageUrl },
        ]}
      />
      {featured.length > 0 && (
        <ItemListJsonLd
          pageName={pageName}
          pageUrl={pageUrl}
          description={description}
          items={featured.map((d, i) => ({
            position: i + 1,
            name: d.name,
            url: `${SITE_URL}${isEn ? '/en' : ''}/destinations/${toSlug(d.name)}`,
          }))}
        />
      )}
      <WisataJogjaClient destinations={featured} locale={locale} />
    </>
  );
}
