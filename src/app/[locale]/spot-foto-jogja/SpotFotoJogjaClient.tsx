'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface SpotFotoJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

export default function SpotFotoJogjaClient({ destinations, locale }: SpotFotoJogjaClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? 'Photo Spots' : 'Spot Foto Jogja'}
      eyebrowText={
        isEn
          ? `Instagrammable Locations · ${destinations.length} Spots`
          : `Spot Estetik · ${destinations.length} Tempat Foto Unik`
      }
      headlineTitle={
        isEn ? (
          <>
            Unique Photo Spots <span className="italic text-gold-600">in Yogyakarta</span>
          </>
        ) : (
          <>
            Spot Foto Unik <span className="italic text-gold-600">& Instagramable di Jogja</span>
          </>
        )
      }
      introText={
        isEn
          ? 'Capture unforgettable moments at Yogyakarta’s most picturesque, unique, and aesthetic photo spots — from heritage architectural gems to panoramic high-altitude views.'
          : 'Abadikan momen berkesan di tempat-tempat paling estetik, unik, dan instagramable di Jogja — dari arsitektur warisan bersejarah hingga gardu pandang berlatar pemandangan indah.'
      }
      updateBadgeText={isEn ? 'Updated 2026' : 'Kurasi Spot Foto 2026'}
      adPlacement="spot_foto_listicle"
    />
  );
}
