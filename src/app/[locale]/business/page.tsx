import type { Metadata } from 'next';
import BusinessPageClient from './BusinessPageClient';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const path = isEn ? '/en/business' : '/business';
  const pageUrl = `${SITE_URL}${path}`;

  const title = isEn
    ? 'Grow Your Business in Jogja'
    : 'Kelola & Kembangkan Bisnis Anda di Jogja';
  const description = isEn
    ? 'Claim your business listing, get verified, and reach more travelers with the Jogjagem business platform for culinary, accommodation, destination, and local craft owners in Jogja.'
    : 'Platform terpadu untuk pemilik usaha kuliner, akomodasi, destinasi, dan kerajinan lokal — claim, promosi, dan kelola reputasi bisnis Anda di Jogja.';

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/business`,
        'x-default': `${SITE_URL}/business`,
        en: `${SITE_URL}/en/business`,
      },
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      siteName: 'Jogjagem',
      images: [{ url: `${SITE_URL}/merapi.png`, width: 1200, height: 630, alt: title }],
      locale: isEn ? 'en_US' : 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/merapi.png`],
    },
  };
}

export default function BusinessPage() {
  return <BusinessPageClient />;
}
