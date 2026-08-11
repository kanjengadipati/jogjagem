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
            Hidden Gems <span className="italic text-gold-600">Pilihan Minggu Ini</span>
          </>
        ) : (
          <>
            Hidden Gem <span className="italic text-gold-600">Pilihan Minggu Ini</span>
          </>
        )
      }
      introText={
        isEn
          ? "Up to 15 off-the-beaten-path destinations in Yogyakarta, picked fresh every week. High-rated spots that haven't gone mainstream yet — the kind of places most visitors walk right past."
          : 'Hingga 15 destinasi tersembunyi di Yogyakarta yang dipilih ulang setiap minggu. Tempat-tempat berkualitas tinggi yang belum banyak diketahui — spot yang sering terlewat kebanyakan wisatawan.'
      }
      updateBadgeText={isEn ? 'Updated every week' : 'Diperbarui tiap minggu'}
      adPlacement="hidden_gem_listicle"
    />
  );
}
