'use client';

import SeoListicleLayout from '@/components/SeoListicleLayout';
import type { Destination } from '@/types';

interface HiddenGemJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

export default function HiddenGemJogjaClient({ destinations, locale }: HiddenGemJogjaClientProps) {
  const isEn = locale === 'en';

  return (
    <SeoListicleLayout
      destinations={destinations}
      locale={locale}
      breadcrumbLabel={isEn ? 'Hidden Gems' : 'Hidden Gem Jogja'}
      eyebrowText={
        isEn
          ? `Picked this week · ${destinations.length} spots`
          : `Pilihan minggu ini · ${destinations.length} tempat`
      }
      headlineTitle={
        isEn ? (
          <>
            Top 10 Hidden Gem <span className="italic text-gold-600">Destinations</span>
          </>
        ) : (
          <>
            Top 10 Hidden Gem <span className="italic text-gold-600">Jogja</span>
          </>
        )
      }
      introText={
        isEn
          ? "The top 10 hidden gem destinations in Yogyakarta, curated fresh every week. High-rated spots that haven't gone mainstream yet — the kind of places most visitors walk right past. Plus more hidden gems below."
          : 'Top 10 destinasi tersembunyi di Yogyakarta yang dipilih ulang setiap minggu. Tempat-tempat berkualitas tinggi yang belum banyak diketahui — spot yang sering terlewat kebanyakan wisatawan. Plus hidden gem lainnya di bawah.'
      }
      updateBadgeText={isEn ? 'Updated every week' : 'Diperbarui tiap minggu'}
      adPlacement="hidden_gem_listicle"
      highlightTop10
    />
  );
}
