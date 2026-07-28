'use client';

import React from 'react';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from '@/contexts/LocaleContext';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';
import InteractiveMap from '@/components/InteractiveMap';
import { Destination } from '@/types';
import { toSlug } from '@/lib/slug';

function MapPageContent() {
  const router = useRouter();
  const { t } = useLocale();

  const handleExploreDestination = (dest: Destination) => {
    router.push(`/destinations/${toSlug(dest.name)}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <Header
        activeTab="map"
        setActiveTab={(tab) => {
          if (tab === 'map') return;
          router.push(`/?tab=${tab}`);
        }}
        savedCount={0}
      />

      <SubNav
        onBack={() => router.back()}
        title={t('map_page.title')}
        zClass="z-40"
      />

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <InteractiveMap
          onExploreDestination={handleExploreDestination}
          selectedDestination={null}
        />
      </div>
    </div>
  );
}

export default function MapPageClient() {
  return <MapPageContent />;
}
