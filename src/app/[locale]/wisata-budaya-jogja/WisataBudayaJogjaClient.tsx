'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface WisataBudayaJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

export default function WisataBudayaJogjaClient({ destinations, locale }: WisataBudayaJogjaClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? 'Cultural & Heritage' : 'Wisata Budaya Jogja'}
      eyebrowText={
        isEn
          ? `Rich Heritage · ${destinations.length} Historic Destinations`
          : `Warisan Budaya · ${destinations.length} Destinasi Bersejarah`
      }
      headlineTitle={
        isEn ? (
          <>
            Cultural & Historic <span className="italic text-gold-600">Sites in Yogyakarta</span>
          </>
        ) : (
          <>
            Tempat Wisata Budaya <span className="italic text-gold-600">& Cerita Sejarah Jogja</span>
          </>
        )
      }
      introText={
        isEn
          ? 'Immerse yourself in the rich royal history and vibrant cultural heritage of Yogyakarta — from ancient temples and royal palaces to traditional art villages.'
          : 'Menyelami kekayaan sejarah dan filosofi budaya Kraton Yogyakarta — dari candi megah pencakar langit purba, istana kerajaan, hingga desa wisata seni budaya.'
      }
      updateBadgeText={isEn ? 'Heritage Guide 2026' : 'Panduan Budaya 2026'}
      adPlacement="wisata_budaya_listicle"
    />
  );
}
