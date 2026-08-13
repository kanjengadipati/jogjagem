import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchNatureDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import WisataAlamJogjaClient from './WisataAlamJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Best Nature Spots & Outdoor Attractions Near Yogyakarta (2026)'
    : 'Wisata Alam Dekat Jogja Terpopuler & Paling Asri (2026)';

  const description = isEn
    ? 'Explore top nature destinations around Yogyakarta: lush hills, waterfalls, beaches, and pine forests for refreshing outdoor trips.'
    : 'Rekomendasi tempat wisata alam dekat Jogja yang asri dan menenangkan. Dari bukit, curug, goa, hingga pantai eksotis di Gunungkidul & Sleman.';

  const keywords = isEn
    ? 'wisata alam jogja, nature spots yogyakarta, outdoor places jogja, hutan pinus jogja, air terjun jogja, pantai gunungkidul'
    : 'wisata alam jogja, wisata alam dekat jogja, wisata alam sleman, wisata alam gunungkidul, curug jogja, bukit jogja 2026';

  const pageUrl = isEn
    ? `${SITE_URL}/en/wisata-alam-jogja`
    : `${SITE_URL}/wisata-alam-jogja`;

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
        id: `${SITE_URL}/wisata-alam-jogja`,
        en: `${SITE_URL}/en/wisata-alam-jogja`,
      },
    },
  };
}

export default async function WisataAlamJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchNatureDestinations(locale);

  const pageUrl = isEn
    ? `${SITE_URL}/en/wisata-alam-jogja`
    : `${SITE_URL}/wisata-alam-jogja`;

  const pageName = isEn
    ? 'Best Nature Attractions Near Yogyakarta'
    : 'Wisata Alam Dekat Jogja';

  const description = isEn
    ? 'Curated list of serene nature destinations around Yogyakarta.'
    : 'Daftar destinasi wisata alam terbaik dan terasri di sekitar Jogja.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Nature Spots' : 'Wisata Alam', url: pageUrl },
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
      <WisataAlamJogjaClient destinations={destinations} locale={locale} />
    </>
  );
}
