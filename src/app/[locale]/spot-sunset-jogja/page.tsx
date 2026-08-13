import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchSunsetDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import SpotSunsetJogjaClient from './SpotSunsetJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Best Sunset Spots & Golden Hour Views in Yogyakarta (2026)'
    : 'Tempat Melihat Sunset di Jogja Paling Indah & Romantis (2026)';

  const description = isEn
    ? 'Guide to the best sunset spots in Yogyakarta: beaches, hills, heritage sites, and cliffside cafes for an unforgettable golden hour.'
    : 'Rekomendasi spot sunset terbaik dan paling romantis di Jogja. Pantai Parangtritis, Candi Ratu Boko, Bukit Paralayang, hingga tebing pantai Gunungkidul.';

  const keywords = isEn
    ? 'spot sunset jogja, sunset yogyakarta, sunset viewing spots jogja, bukit paralayang sunset, ratu boko sunset'
    : 'spot sunset jogja, sunset jogja, tempat melihat sunset jogja, bukit sunset jogja, pantai sunset jogja 2026';

  const pageUrl = isEn
    ? `${SITE_URL}/en/spot-sunset-jogja`
    : `${SITE_URL}/spot-sunset-jogja`;

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
        id: `${SITE_URL}/spot-sunset-jogja`,
        en: `${SITE_URL}/en/spot-sunset-jogja`,
      },
    },
  };
}

export default async function SpotSunsetJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchSunsetDestinations(locale);

  const pageUrl = isEn
    ? `${SITE_URL}/en/spot-sunset-jogja`
    : `${SITE_URL}/spot-sunset-jogja`;

  const pageName = isEn
    ? 'Best Sunset Viewpoints in Yogyakarta'
    : 'Spot Tempat Melihat Sunset Terbaik di Jogja';

  const description = isEn
    ? 'Top spots to watch the sunset in Yogyakarta.'
    : 'Daftar spot terbaik melihat pemandangan sunset memukau di Yogyakarta.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Sunset Spots' : 'Spot Sunset', url: pageUrl },
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
      <SpotSunsetJogjaClient destinations={destinations} locale={locale} />
    </>
  );
}
