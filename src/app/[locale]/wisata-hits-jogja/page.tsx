import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchTrendingHitsDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import WisataHitsJogjaClient from './WisataHitsJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Top 10 Trending & Hits Tourist Attractions in Yogyakarta (2026)'
    : '10 Tempat Wisata Hits Jogja Paling Viral & Trending (2026)';

  const description = isEn
    ? 'Discover the top 10 trending destinations in Yogyakarta right now. From viral outdoor spots to aesthetic travel highlights.'
    : 'Rekomendasi 10 tempat wisata hits Jogja paling viral dan trending saat ini. Spot instagramable, alam indah, dan destinasi paling banyak dicari wisatawan.';

  const keywords = isEn
    ? 'wisata hits jogja, trending yogyakarta destinations, top 10 places in jogja, wisata viral jogja, wisata kekinian jogja'
    : 'wisata hits jogja, wisata viral jogja, tempat wisata hits jogja, wisata kekinian jogja, 10 wisata hits jogja 2026';

  const pageUrl = isEn
    ? `${SITE_URL}/en/wisata-hits-jogja`
    : `${SITE_URL}/wisata-hits-jogja`;

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
        id: `${SITE_URL}/wisata-hits-jogja`,
        en: `${SITE_URL}/en/wisata-hits-jogja`,
      },
    },
  };
}

export default async function WisataHitsJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchTrendingHitsDestinations(locale, 10);

  const pageUrl = isEn
    ? `${SITE_URL}/en/wisata-hits-jogja`
    : `${SITE_URL}/wisata-hits-jogja`;

  const pageName = isEn
    ? 'Top 10 Trending Attractions in Yogyakarta'
    : '10 Tempat Wisata Hits Jogja Paling Viral';

  const description = isEn
    ? 'Top 10 curated trending destinations in Yogyakarta.'
    : 'Daftar 10 destinasi tempat wisata paling hits dan viral di Yogyakarta.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Trending Hits' : 'Wisata Hits Jogja', url: pageUrl },
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
      <WisataHitsJogjaClient destinations={destinations} locale={locale} />
    </>
  );
}
