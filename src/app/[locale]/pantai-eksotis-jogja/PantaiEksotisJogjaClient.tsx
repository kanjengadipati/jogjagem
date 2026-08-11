'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface PantaiEksotisJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

export default function PantaiEksotisJogjaClient({ destinations, locale }: PantaiEksotisJogjaClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? 'Exotic Beaches' : 'Pantai Eksotis Jogja'}
      eyebrowText={
        isEn
          ? `Coastal Escapes · ${destinations.length} Hidden Beaches`
          : `Pesona Pesisir · ${destinations.length} Pantai Hidden Gem`
      }
      headlineTitle={
        isEn ? (
          <>
            Exotic & Hidden <span className="italic text-gold-600">Beaches in Yogyakarta</span>
          </>
        ) : (
          <>
            Wisata Pantai Eksotis <span className="italic text-gold-600">& Hidden Gem di Gunungkidul Jogja</span>
          </>
        )
      }
      introText={
        isEn
          ? 'Discover Yogyakarta’s most breathtaking exotic beaches and hidden coastal gems — white sand bays, dramatic limestone cliffs, and serene untouched shores in Gunungkidul & Bantul.'
          : 'Jelajahi keindahan pantai eksotis dan hidden gem pesisir Jogja — teluk pasir putih, tebing karang megah, hingga pantai tersembunyi yang tenang di Gunungkidul dan Bantul.'
      }
      updateBadgeText={isEn ? 'Beach Guide 2026' : 'Panduan Pantai 2026'}
      customItemBadge={(d) => (d.subRegion?.toLowerCase() === 'gunungkidul' ? 'Gunungkidul' : 'Pantai Eksotis')}
      adPlacement="pantai_eksotis_listicle"
    />
  );
}
