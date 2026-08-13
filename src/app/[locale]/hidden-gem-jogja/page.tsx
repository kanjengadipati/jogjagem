import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchHiddenGemDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import HiddenGemJogjaClient from './HiddenGemJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? "This Week's Hidden Gems in Yogyakarta"
    : 'Hidden Gem Jogja Pilihan Minggu Ini';

  const description = isEn
    ? 'A handpicked selection of up to 15 hidden gems in Yogyakarta, refreshed every week. Secret spots, quiet retreats, and off-the-beaten-path destinations you won\'t find in the usual travel guides.'
    : 'Pilihan hingga 15 hidden gem Jogja yang dipilih ulang setiap minggu. Destinasi tersembunyi, spot sepi, dan tempat healing yang belum banyak diketahui — dipilih ulang tiap pekan.';

  const keywords = isEn
    ? 'hidden gems yogyakarta, hidden gem jogja, secret spots jogja, off the beaten path yogyakarta, quiet places jogja, healing spots yogyakarta'
    : 'hidden gem jogja, hidden gems yogyakarta, destinasi tersembunyi jogja, wisata sepi jogja, spot tersembunyi yogyakarta, tempat healing jogja';

  const pageUrl = isEn
    ? `${SITE_URL}/en/hidden-gem-jogja`
    : `${SITE_URL}/hidden-gem-jogja`;

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
        id: `${SITE_URL}/hidden-gem-jogja`,
        'x-default': `${SITE_URL}/hidden-gem-jogja`,
        en: `${SITE_URL}/en/hidden-gem-jogja`,
      },
    },
  };
}

export default async function HiddenGemJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchHiddenGemDestinations(locale);

  const pageUrl = isEn
    ? `${SITE_URL}/en/hidden-gem-jogja`
    : `${SITE_URL}/hidden-gem-jogja`;

  const pageName = isEn
    ? "This Week's Hidden Gems in Yogyakarta"
    : 'Hidden Gem Jogja Pilihan Minggu Ini';

  const description = isEn
    ? 'Up to 15 curated hidden gems in Yogyakarta, refreshed every week.'
    : 'Pilihan hingga 15 hidden gem Jogja yang dikurasi setiap minggu.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Hidden Gems' : 'Hidden Gem Jogja', url: pageUrl },
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
      <HiddenGemJogjaClient destinations={destinations} locale={locale} />
    </>
  );
}
