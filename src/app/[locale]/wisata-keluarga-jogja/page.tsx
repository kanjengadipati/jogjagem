import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchFamilyDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import WisataKeluargaJogjaClient from './WisataKeluargaJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Best Family-Friendly Attractions in Yogyakarta (2026)'
    : 'Wisata Seru Bareng Keluarga di Jogja (2026) - Ramah Anak';

  const description = isEn
    ? 'Explore top family-friendly places to visit in Yogyakarta: educational parks, kid-friendly nature, theme parks, and cultural sites.'
    : 'Daftar destinasi wisata keluarga terbaik di Jogja yang nyaman dan seru untuk anak-anak hingga orang tua. Taman rekreasi, tempat edukasi, dan pantai aman.';

  const keywords = isEn
    ? 'wisata keluarga jogja, family trip yogyakarta, kid friendly places jogja, tempat wisata anak jogja, liburan keluarga jogja'
    : 'wisata keluarga jogja, wisata anak jogja, tempat ramah keluarga jogja, liburan keluarga jogja 2026, taman rekreasi jogja';

  const pageUrl = isEn
    ? `${SITE_URL}/en/wisata-keluarga-jogja`
    : `${SITE_URL}/wisata-keluarga-jogja`;

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
        id: `${SITE_URL}/wisata-keluarga-jogja`,
        'x-default': `${SITE_URL}/wisata-keluarga-jogja`,
        en: `${SITE_URL}/en/wisata-keluarga-jogja`,
      },
    },
  };
}

export default async function WisataKeluargaJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchFamilyDestinations(locale);

  const pageUrl = isEn
    ? `${SITE_URL}/en/wisata-keluarga-jogja`
    : `${SITE_URL}/wisata-keluarga-jogja`;

  const pageName = isEn
    ? 'Best Family Attractions in Yogyakarta'
    : 'Wisata Seru Bareng Keluarga di Jogja';

  const description = isEn
    ? 'Top family-friendly destinations in Yogyakarta.'
    : 'Rekomendasi destinasi wisata ramah anak dan keluarga di Yogyakarta.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Family Attractions' : 'Wisata Keluarga', url: pageUrl },
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
      <WisataKeluargaJogjaClient destinations={destinations} locale={locale} />
    </>
  );
}
