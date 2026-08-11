'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface WisataSekitarMalioboroClientProps {
  destinations: Destination[];
  locale: string;
}

export default function WisataSekitarMalioboroClient({ destinations, locale }: WisataSekitarMalioboroClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? 'Around Malioboro' : 'Wisata Sekitar Malioboro'}
      eyebrowText={
        isEn
          ? `Malioboro Area · ${destinations.length} Nearby Attractions`
          : `Kawasan Malioboro · ${destinations.length} Wisata Terdekat`
      }
      headlineTitle={
        isEn ? (
          <>
            Tourist Attractions <span className="italic text-gold-600">Around Malioboro</span>
          </>
        ) : (
          <>
            Tempat Wisata <span className="italic text-gold-600">Sekitar Malioboro Jogja</span>
          </>
        )
      }
      introText={
        isEn
          ? 'Explore top destinations within walking distance or minutes away from Malioboro Street — heritage landmarks, traditional markets, museums, and vibrant night spots.'
          : 'Jelajahi destinasi paling hits yang bisa dijangkau jalan kaki atau beberapa menit saja dari Jalan Malioboro — dari Kraton, Benteng Vredeburg, Pasar Beringharjo, hingga Titik Nol KM.'
      }
      updateBadgeText={isEn ? 'Malioboro Guide 2026' : 'Panduan Malioboro 2026'}
      adPlacement="wisata_malioboro_listicle"
    />
  );
}
