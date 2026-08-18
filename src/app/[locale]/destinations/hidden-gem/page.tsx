import type { Metadata } from 'next';
import DestinationsPageClient from '../DestinationsPageClient';
import { fetchHiddenGemDestinations } from '@/lib/server-destinations';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? "This Week's Hidden Gems in Yogyakarta"
    : 'Hidden Gem Jogja Pilihan Minggu Ini';

  const description = isEn
    ? 'Top 10 hidden gems in Yogyakarta, refreshed every week. Secret spots, quiet retreats, and off-the-beaten-path destinations handpicked by our team.'
    : 'Top 10 hidden gem Jogja yang dikurasi setiap minggu. Destinasi tersembunyi, spot sepi, dan tempat healing yang belum banyak diketahui — dipilih ulang tiap pekan.';

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
        'x-default': `${SITE_URL}/destinations/hidden-gem`,
        en: `${SITE_URL}/en/destinations/hidden-gem`,
      },
    },
  };
}

export default async function HiddenGemPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  // Fetch only the 15 curated destinations instead of the full catalogue.
  const initialDestinations = await fetchHiddenGemDestinations(locale);
  return (
    <DestinationsPageClient
      initialCategory="hidden-gem"
      initialDestinations={initialDestinations}
      isWeeklyCurated
    />
  );
}
