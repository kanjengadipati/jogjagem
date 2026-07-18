'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import I18nProvider from '@/contexts/I18nProvider';
import { useLocale } from '@/contexts/LocaleContext';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';
import ConversationalAI from '@/components/ConversationalAI';
import { destinations as destinationsApi, auth } from '@/lib/api';
import { Destination } from '@/types';

function AIPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLocale();

  // ?q=<query> pre-fills the first message
  const initialQuery = searchParams.get('q') || '';

  // Image search result passed via sessionStorage (too large for URL)
  const [initialImageResult, setInitialImageResult] = useState<{
    imageUrl: string;
    reply: string;
    matchedDestinationIds: string[];
  } | null>(null);

  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Pick up image result from sessionStorage (set by Hero image search)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ai_image_result');
      if (raw) {
        setInitialImageResult(JSON.parse(raw));
        sessionStorage.removeItem('ai_image_result');
      }
    } catch { /* ignore */ }
  }, []);

  // Load destinations for card rendering in AI responses
  useEffect(() => {
    destinationsApi.getAll().then((res) => {
      if (res.status === 'success' && res.data) {
        const mapped = (res.data as any[]).map((raw) => ({
          ...raw,
          subRegion:    raw.sub_region    || raw.subRegion    || '',
          ticketPrice:  raw.ticket_price  || raw.ticketPrice  || '',
          openingHours: raw.opening_hours || raw.openingHours || '',
          reviewCount:  raw.review_count  || raw.reviewCount  || 0,
          travelTips:   raw.travel_tips   || raw.travelTips   || [],
          bestTime:     raw.best_time     || raw.bestTime     || '',
          googleMapsUrl:     raw.google_maps_url     || raw.googleMapsUrl     || '',
          googleReviewCount: raw.google_review_count || raw.googleReviewCount || 0,
          seoTitle:       raw.seo_title       || raw.seoTitle       || '',
          seoKeywords:    raw.seo_keywords    || raw.seoKeywords    || '',
          seoDescription: raw.seo_description || raw.seoDescription || '',
          ogImageUrl:     raw.og_image_url    || raw.ogImageUrl     || '',
        }));
        setAllDestinations(mapped as Destination[]);
      }
    }).catch(() => {});
  }, []);

  // Hydrate saved destinations from localStorage
  useEffect(() => {
    if (allDestinations.length === 0) return;
    try {
      const raw = localStorage.getItem('explore_jogja_saved_v1');
      if (raw) {
        const parsed: Destination[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const refreshed = parsed
            .map((item) => allDestinations.find((d) => d.id === item.id) ?? item)
            .filter(Boolean) as Destination[];
          setSavedDestinations(refreshed);
        }
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, [allDestinations]);

  // Persist saved destinations
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(savedDestinations));
    } catch { /* ignore */ }
  }, [savedDestinations, hydrated]);

  const handleToggleSave = async (dest: Destination) => {
    setSavedDestinations((prev) => {
      const exists = prev.some((d) => d.id === dest.id);
      return exists ? prev.filter((d) => d.id !== dest.id) : [...prev, dest];
    });
    try {
      const isSavedNow = !savedDestinations.some((d) => d.id === dest.id);
      await auth.updateDestinationStatus(dest.id, isSavedNow ? 'saved' : 'removed');
    } catch { /* ignore */ }
  };

  const isSaved = (id: string) => savedDestinations.some((d) => d.id === id);

  const handleExploreDestination = (dest: Destination) => {
    const slug = dest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    router.push(`/destinations/${slug}`);
  };

  return (
    <div className="min-h-screen bg-[#F7F3EE] flex flex-col">
      <Header
        activeTab="ai-assistant"
        setActiveTab={(tab) => {
          if (tab === 'map') router.push('/map');
          else if (tab === 'planner') router.push('/planner');
          else if (tab === 'saved') router.push('/saved');
          else router.push(`/?tab=${tab}`);
        }}
        savedCount={savedDestinations.length}
      />

      <SubNav
        onBack={() => router.back()}
        title={t('ai_page.title')}
        zClass="z-40"
      />

      <div className="flex-1">
        <ConversationalAI
          initialQuery={initialQuery}
          initialImageResult={initialImageResult}
          onClearImageResult={() => setInitialImageResult(null)}
          onExploreDestination={handleExploreDestination}
          onToggleSave={handleToggleSave}
          isSaved={isSaved}
        />
      </div>
    </div>
  );
}

export default function AIPage() {
  return (
    <Suspense>
      <AuthProvider>
        <LocationProvider>
          <I18nProvider>
            <AIPageContent />
          </I18nProvider>
        </LocationProvider>
      </AuthProvider>
    </Suspense>
  );
}
