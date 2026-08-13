import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchCulinaryDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import KulinerJogjaClient from './KulinerJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Must-Try Local Culinary & Foods in Yogyakarta (2026)'
    : 'Kuliner Lokal Jogja Wajib Dicoba (2026) - Rekomendasi Terenak';

  const description = isEn
    ? 'Comprehensive guide to the best local culinary, legendary food stalls, and traditional Yogyakarta dishes you cannot miss.'
    : 'Daftar kuliner lokal khas Jogja yang paling enak dan legendaris. Dari gudeg, soto, bakpia hingga angkringan tersembunyi.';

  const keywords = isEn
    ? 'kuliner jogja, local food yogyakarta, gudeg jogja, best food in yogyakarta, makanan khas jogja, kuliner malam jogja'
    : 'kuliner jogja, kuliner lokal jogja, tempat makan jogja, makanan khas jogja, gudeg legendaris, kuliner malam jogja 2026';

  const pageUrl = isEn
    ? `${SITE_URL}/en/kuliner-jogja`
    : `${SITE_URL}/kuliner-jogja`;

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
        id: `${SITE_URL}/kuliner-jogja`,
        en: `${SITE_URL}/en/kuliner-jogja`,
      },
    },
  };
}

export default async function KulinerJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchCulinaryDestinations(locale);

  const pageUrl = isEn
    ? `${SITE_URL}/en/kuliner-jogja`
    : `${SITE_URL}/kuliner-jogja`;

  const pageName = isEn
    ? 'Must-Try Local Culinary in Yogyakarta'
    : 'Kuliner Lokal Jogja Wajib Dicoba';

  const description = isEn
    ? 'Top local food stalls and culinary experiences in Yogyakarta.'
    : 'Rekomendasi kuliner lokal terbaik dan legendaris di Jogja.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Local Culinary' : 'Kuliner Jogja', url: pageUrl },
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
      <KulinerJogjaClient destinations={destinations} locale={locale} />
    </>
  );
}
