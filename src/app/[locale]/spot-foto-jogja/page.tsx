import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchPhotoSpotDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import SpotFotoJogjaClient from './SpotFotoJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Most Instagrammable & Unique Photo Spots in Yogyakarta (2026) | Jogjagem'
    : 'Spot Foto Unik & Instagramable di Jogja Terbaru (2026) | Jogjagem';

  const description = isEn
    ? 'Discover the most aesthetic, unique, and picture-perfect photo spots in Yogyakarta for your travel content and feed.'
    : 'Rekomendasi spot foto paling unik, estetik, dan instagramable di Jogja. Cocok untuk foto OOTD, kenangan liburan, dan feeds sosial media.';

  const keywords = isEn
    ? 'spot foto jogja, instagrammable yogyakarta, aesthetic photo spots jogja, tempat foto bagus di jogja, spot foto unik'
    : 'spot foto jogja, spot foto unik jogja, wisata instagramable jogja, tempat foto bagus jogja, spot foto kekinian jogja 2026';

  const pageUrl = isEn
    ? `${SITE_URL}/en/spot-foto-jogja`
    : `${SITE_URL}/spot-foto-jogja`;

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
        id: `${SITE_URL}/spot-foto-jogja`,
        en: `${SITE_URL}/en/spot-foto-jogja`,
      },
    },
  };
}

export default async function SpotFotoJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchPhotoSpotDestinations(locale);

  const pageUrl = isEn
    ? `${SITE_URL}/en/spot-foto-jogja`
    : `${SITE_URL}/spot-foto-jogja`;

  const pageName = isEn
    ? 'Unique Photo Spots in Yogyakarta'
    : 'Spot Foto Unik di Jogja';

  const description = isEn
    ? 'The most photogenic places to visit in Yogyakarta.'
    : 'Kumpulan destinasi spot foto unik dan paling estetik di Yogyakarta.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Photo Spots' : 'Spot Foto Jogja', url: pageUrl },
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
      <SpotFotoJogjaClient destinations={destinations} locale={locale} />
    </>
  );
}
