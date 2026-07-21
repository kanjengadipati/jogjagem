'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '../../contexts/AuthContext';
import { LocationProvider } from '../../contexts/LocationContext';
import I18nProvider from '@/contexts/I18nProvider';
import { useLocale } from '@/contexts/LocaleContext';
import Header from '../../components/Header';
import SubNav from '../../components/SubNav';
import InteractiveMap from '../../components/InteractiveMap';
import { Destination } from '../../types';

function MapPageContent() {
  const router = useRouter();
  const { t } = useLocale();

  const toSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

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
  return (
    <AuthProvider>
      <LocationProvider>
        <I18nProvider>
          <MapPageContent />
        </I18nProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
