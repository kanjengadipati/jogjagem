'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface ItineraryJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

export default function ItineraryJogjaClient({ destinations, locale }: ItineraryJogjaClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? '2-3 Day Itinerary' : 'Itinerary 2-3 Hari Jogja'}
      eyebrowText={
        isEn
          ? `Complete Travel Route · ${destinations.length} Key Stops`
          : `Panduan Rute Liburan · ${destinations.length} Spot Utama`
      }
      headlineTitle={
        isEn ? (
          <>
            Complete 2–3 Day <span className="italic text-gold-600">Yogyakarta Travel Itinerary</span>
          </>
        ) : (
          <>
            Itinerary 2–3 Hari <span className="italic text-gold-600">di Jogja Panduan Lengkap</span>
          </>
        )
      }
      introText={
        isEn
          ? 'Rely on this optimized step-by-step 2 to 3-day itinerary covering ancient heritage, hidden natural spots, golden sunset viewpoints, and authentic local food.'
          : 'Panduan rute liburan 2 hingga 3 hari yang paling efisien di Jogja. Mengombinasikan wisata budaya ikonik, alam asri, spot sunset romantis, dan perburuan kuliner khas.'
      }
      updateBadgeText={isEn ? 'Updated Itinerary Guide 2026' : 'Rute Terupdate 2026'}
      customSubTitle={(d, i) => {
        if (i < 3) return isEn ? 'Day 1 · Kraton & Cultural Heritage' : 'Hari 1 · Budaya & Sejarah Kraton';
        if (i < 6) return isEn ? 'Day 2 · Nature Adventure & Sunset' : 'Hari 2 · Petualangan Alam & Sunset';
        return isEn ? 'Day 3 · Shopping & Culinary Hunt' : 'Hari 3 · Berburu Kuliner & Oleh-Oleh';
      }}
      adPlacement="itinerary_jogja_listicle"
    />
  );
}
