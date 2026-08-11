'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface WisataKeluargaJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

export default function WisataKeluargaJogjaClient({ destinations, locale }: WisataKeluargaJogjaClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? 'Family Attractions' : 'Wisata Keluarga Jogja'}
      eyebrowText={
        isEn
          ? `Family-Friendly · ${destinations.length} Top Picks`
          : `Ramah Keluarga · ${destinations.length} Rekomendasi Destinasi`
      }
      headlineTitle={
        isEn ? (
          <>
            Fun Family Attractions <span className="italic text-gold-600">in Yogyakarta</span>
          </>
        ) : (
          <>
            Wisata Seru <span className="italic text-gold-600">Bareng Keluarga di Jogja</span>
          </>
        )
      }
      introText={
        isEn
          ? 'Plan the perfect family trip to Yogyakarta with interactive educational spots, theme parks, spacious parks, and kid-friendly natural destinations.'
          : 'Rencanakan liburan seru keluarga di Jogja dengan tempat rekreasi edukatif, taman bermain interaktif, museum ramah anak, dan alam yang aman.'
      }
      updateBadgeText={isEn ? 'Family Guide 2026' : 'Panduan Liburan Keluarga 2026'}
      adPlacement="wisata_keluarga_listicle"
    />
  );
}
