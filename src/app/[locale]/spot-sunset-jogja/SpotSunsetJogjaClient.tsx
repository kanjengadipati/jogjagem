'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface SpotSunsetJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

export default function SpotSunsetJogjaClient({ destinations, locale }: SpotSunsetJogjaClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? 'Sunset Spots' : 'Spot Sunset Jogja'}
      eyebrowText={
        isEn
          ? `Golden Hour · ${destinations.length} Golden Viewpoint Spots`
          : `Matahari Terbenam · ${destinations.length} Spot Sunset Eksotis`
      }
      headlineTitle={
        isEn ? (
          <>
            Best Sunset Views <span className="italic text-gold-600">in Yogyakarta</span>
          </>
        ) : (
          <>
            Spot Tempat Melihat <span className="italic text-gold-600">Sunset Terbaik di Jogja</span>
          </>
        )
      }
      introText={
        isEn
          ? 'Experience magical golden hour sunsets from cliffside vantage points, coastal beaches, ancient temples, and hilltops with panoramic views of Yogyakarta.'
          : 'Nikmati keindahan momen golden hour dan langit senja yang magis dari tebing pantai, puncak bukit, Candi Ratu Boko, hingga resto berlatar pemandangan kota Jogja.'
      }
      updateBadgeText={isEn ? 'Sunset Guide 2026' : 'Rekomendasi Sunset 2026'}
      adPlacement="spot_sunset_listicle"
    />
  );
}
