'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface KulinerJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

export default function KulinerJogjaClient({ destinations, locale }: KulinerJogjaClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? 'Local Culinary' : 'Kuliner Lokal Jogja'}
      eyebrowText={
        isEn
          ? `Must-Try Dishes · ${destinations.length} Spots`
          : `Wajib Dicoba · ${destinations.length} Spot Kuliner`
      }
      headlineTitle={
        isEn ? (
          <>
            Local Culinary <span className="italic text-gold-600">Must-Try in Yogyakarta</span>
          </>
        ) : (
          <>
            Kuliner Lokal <span className="italic text-gold-600">Wajib Dicoba di Jogja</span>
          </>
        )
      }
      introText={
        isEn
          ? 'Discover the authentic flavors of Yogyakarta — from legendary Gudeg to hidden local food stalls, coffee joints, and night culinary spots loved by locals.'
          : 'Jelajahi kelezatan otentik khas Yogyakarta — mulai dari Gudeg legendaris, angkringan hidden gem, hingga kuliner malam favorit warga lokal.'
      }
      updateBadgeText={isEn ? 'Curated 2026' : 'Kurasi Kuliner 2026'}
      adPlacement="kuliner_jogja_listicle"
    />
  );
}
