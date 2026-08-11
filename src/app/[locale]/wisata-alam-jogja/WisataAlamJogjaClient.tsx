'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface WisataAlamJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

export default function WisataAlamJogjaClient({ destinations, locale }: WisataAlamJogjaClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? 'Nature Spots' : 'Wisata Alam Jogja'}
      eyebrowText={
        isEn
          ? `Nature Escape · ${destinations.length} Places`
          : `Wisata Alam · ${destinations.length} Destinasi Asri`
      }
      headlineTitle={
        isEn ? (
          <>
            Nature Spots <span className="italic text-gold-600">Near Yogyakarta</span>
          </>
        ) : (
          <>
            Wisata Alam <span className="italic text-gold-600">Dekat Jogja yang Asri</span>
          </>
        )
      }
      introText={
        isEn
          ? 'Escape the bustle of the city and refresh your mind in nature — from serene pine forests, waterfalls, hills in Sleman & Gunungkidul, to untouched beaches.'
          : 'Jauhi hiruk piruk kota dan nikmati kesegaran alam Jogja — dari hutan pinus yang tenang, air terjun tersembunyi, bukit hijau di Sleman & Gunungkidul, hingga pantai alami.'
      }
      updateBadgeText={isEn ? 'Nature Recommendations 2026' : 'Rekomendasi Alam 2026'}
      adPlacement="wisata_alam_listicle"
    />
  );
}
