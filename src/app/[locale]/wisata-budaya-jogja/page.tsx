import type { Metadata } from 'next';
import { BreadcrumbJsonLd, ItemListJsonLd } from '@/components/JsonLd';
import { fetchCulturalDestinations } from '@/lib/server-destinations';
import { toSlug } from '@/lib/slug';
import WisataBudayaJogjaClient from './WisataBudayaJogjaClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? 'Cultural & Historical Destinations in Yogyakarta (2026)'
    : 'Tempat Wisata Budaya & Sejarah di Jogja Terpopuler (2026)';

  const description = isEn
    ? 'Explore Yogyakarta’s top cultural, royal, and historical destinations. Discover ancient temples, Kraton, museums, and historical stories.'
    : 'Daftar tempat wisata budaya dan bersejarah di Jogja dengan nilai budaya tinggi. Kraton, Candi Prambanan, Ratu Boko, Taman Sari, dan museum bersejarah.';

  const keywords = isEn
    ? 'wisata budaya jogja, heritage yogyakarta, candi prambanan, keraton jogja, sejarah yogyakarta, museum jogja'
    : 'wisata budaya jogja, wisata sejarah jogja, tempat berbudaya jogja, keraton yogyakarta, candi jogja 2026';

  const pageUrl = isEn
    ? `${SITE_URL}/en/wisata-budaya-jogja`
    : `${SITE_URL}/wisata-budaya-jogja`;

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
        id: `${SITE_URL}/wisata-budaya-jogja`,
        en: `${SITE_URL}/en/wisata-budaya-jogja`,
      },
    },
  };
}

export default async function WisataBudayaJogjaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === 'en';

  const destinations = await fetchCulturalDestinations(locale);

  const pageUrl = isEn
    ? `${SITE_URL}/en/wisata-budaya-jogja`
    : `${SITE_URL}/wisata-budaya-jogja`;

  const pageName = isEn
    ? 'Cultural & Historical Attractions in Yogyakarta'
    : 'Wisata Budaya & Sejarah Jogja';

  const description = isEn
    ? 'Curated heritage and cultural spots in Yogyakarta.'
    : 'Daftar destinasi bernilai budaya dan sejarah tinggi di Jogja.';

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: SITE_URL },
          { name: isEn ? 'Culture' : 'Wisata Budaya', url: pageUrl },
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
      <WisataBudayaJogjaClient destinations={destinations} locale={locale} />
    </>
  );
}
