import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchMalioboroDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import WisataSekitarMalioboroClient from './WisataSekitarMalioboroClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Best Attractions & Things to Do Around Malioboro Yogyakarta (2026)'
    : 'Tempat Wisata Sekitar Malioboro Jogja Terdekat & Paling Hits (2026)';

  const description = isEn
    ? 'Discover popular tourist attractions near Malioboro Yogyakarta: Kraton Palace, Taman Sari, Benteng Vredeburg, Beringharjo Market, and Titik Nol.'
    : 'Daftar tempat wisata sekitar Malioboro Jogja yang wajib dikunjungi. Wisata sejarah, budaya, belanja, dan kuliner terdekat yang bisa dijangkau dengan jalan kaki atau sebentar saja.';

  const keywords = isEn
    ? 'wisata sekitar malioboro, malioboro yogyakarta, things to do near malioboro, malioboro attractions, kraton jogja, titik nol km'
    : 'wisata sekitar malioboro, tempat wisata dekat malioboro, wisata malioboro jogja, wisata malioboro jalan kaki, malioboro 2026';

  const pageUrl = isEn
    ? `${SITE_URL}/en/wisata-sekitar-malioboro`
    : `${SITE_URL}/wisata-sekitar-malioboro`;

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
        id: `${SITE_URL}/wisata-sekitar-malioboro`,
        en: `${SITE_URL}/en/wisata-sekitar-malioboro`,
      },
    },
  };
}

export default async function WisataSekitarMalioboroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchMalioboroDestinations(locale);

  const pageUrl = isEn
    ? `${SITE_URL}/en/wisata-sekitar-malioboro`
    : `${SITE_URL}/wisata-sekitar-malioboro`;

  const pageName = isEn
    ? 'Tourist Attractions Around Malioboro'
    : 'Tempat Wisata Sekitar Malioboro Jogja';

  const description = isEn
    ? 'Popular places to visit near Malioboro Street in Yogyakarta.'
    : 'Rekomendasi destinasi wisata terbaik di sekitar kawasan Malioboro.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Around Malioboro' : 'Wisata Sekitar Malioboro', url: pageUrl },
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
      <WisataSekitarMalioboroClient destinations={destinations} locale={locale} />
    </>
  );
}
