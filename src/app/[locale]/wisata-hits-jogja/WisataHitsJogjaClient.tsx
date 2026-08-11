'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface WisataHitsJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

export default function WisataHitsJogjaClient({ destinations, locale }: WisataHitsJogjaClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? 'Trending Hits' : 'Wisata Hits Jogja'}
      eyebrowText={
        isEn
          ? `Trending Now · Top ${destinations.length} Places`
          : `Trending Saat Ini · Top ${destinations.length} Tempat Hits`
      }
      headlineTitle={
        isEn ? (
          <>
            Trending Hits <span className="italic text-gold-600">in Yogyakarta Right Now</span>
          </>
        ) : (
          <>
            10 Tempat Wisata Hits <span className="italic text-gold-600">Paling Viral di Jogja</span>
          </>
        )
      }
      introText={
        isEn
          ? 'Discover the top 10 trending and most popular travel spots in Yogyakarta right now — picked based on real-time popularity, high reviews, and social media buzz.'
          : 'Daftar 10 destinasi wisata paling hits dan viral di Jogja saat ini — dikurasi khusus berdasarkan tingkat popularitas terkini dan ulasan wisatawan terbanyak.'
      }
      updateBadgeText={isEn ? 'Trending Now 2026' : 'Trending Saat Ini 2026'}
      customItemBadge={() => (isEn ? 'Trending Now' : 'Trending Hits')}
      adPlacement="wisata_hits_listicle"
    />
  );
}
