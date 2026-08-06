import type { Metadata } from 'next';
import DestinationsPageClient from '../DestinationsPageClient';
import { fetchAllDestinations } from '@/lib/server-destinations';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? '23+ Hidden Gems Yogyakarta You Must Visit 2026 | Jogjagem'
    : '23+ Hidden Gem Jogja Wajib Dikunjungi 2026 | Jogjagem';

  const description = isEn
    ? 'Explore curated hidden gems in Yogyakarta. Secret destinations, quiet spots, and healing places not yet widely known. Updated 2026.'
    : 'Jelajahi hidden gem Jogja terkurasi. Destinasi tersembunyi, spot sepi, dan tempat healing yang belum banyak diketahui di Yogyakarta. Terbaru 2026.';

  const keywords = isEn
    ? 'hidden gems yogyakarta, hidden gem jogja, secret spots jogja, off the beaten path yogyakarta, quiet places jogja, healing spots yogyakarta'
    : 'hidden gem jogja, hidden gems yogyakarta, destinasi tersembunyi jogja, wisata sepi jogja, spot tersembunyi yogyakarta, tempat healing jogja';

  const pageUrl = isEn ? `${SITE_URL}/en/destinations/hidden-gem` : `${SITE_URL}/destinations/hidden-gem`;

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
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/destinations/hidden-gem`,
        en: `${SITE_URL}/en/destinations/hidden-gem`,
      },
    },
  };
}

export default async function HiddenGemPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const initialDestinations = await fetchAllDestinations(locale);
  return <DestinationsPageClient initialCategory="hidden-gem" initialDestinations={initialDestinations} />;
}
