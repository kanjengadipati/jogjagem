import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchExoticBeachDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import PantaiEksotisJogjaClient from './PantaiEksotisJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Exotic Beaches & Hidden Coastal Gems in Yogyakarta / Gunungkidul (2026)'
    : 'Wisata Pantai Eksotis Jogja & Gunungkidul Hidden Gem (2026)';

  const description = isEn
    ? 'Comprehensive travel guide to the most exotic beaches, white sand bays, and hidden coastal gems in Gunungkidul, Yogyakarta.'
    : 'Daftar pantai eksotis dan hidden gem di Jogja & Gunungkidul. Pantai pasir putih tersembunyi, tebing karang megah, dan spot laut terindah.';

  const keywords = isEn
    ? 'pantai eksotis jogja, exotic beaches yogyakarta, pantai gunungkidul, hidden gem beaches jogja, pantai pasir putih jogja'
    : 'pantai eksotis jogja, wisata pantai gunungkidul, pantai hidden gem jogja, pantai pasir putih gunungkidul, wisata pantai jogja 2026';

  const pageUrl = isEn
    ? `${SITE_URL}/en/pantai-eksotis-jogja`
    : `${SITE_URL}/pantai-eksotis-jogja`;

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
        id: `${SITE_URL}/pantai-eksotis-jogja`,
        en: `${SITE_URL}/en/pantai-eksotis-jogja`,
      },
    },
  };
}

export default async function PantaiEksotisJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchExoticBeachDestinations(locale, 20);

  const pageUrl = isEn
    ? `${SITE_URL}/en/pantai-eksotis-jogja`
    : `${SITE_URL}/pantai-eksotis-jogja`;

  const pageName = isEn
    ? 'Exotic & Hidden Beaches in Yogyakarta'
    : 'Wisata Pantai Eksotis & Hidden Gem di Jogja';

  const description = isEn
    ? 'Best exotic white sand beaches in Gunungkidul and Yogyakarta.'
    : 'Daftar pantai paling eksotis dan hidden gem terbaik di Gunungkidul & Yogyakarta.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Exotic Beaches' : 'Pantai Eksotis Jogja', url: pageUrl },
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
      <PantaiEksotisJogjaClient destinations={destinations} locale={locale} />
    </>
  );
}
