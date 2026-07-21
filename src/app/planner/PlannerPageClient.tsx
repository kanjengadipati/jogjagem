'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import I18nProvider from '@/contexts/I18nProvider';
import { useLocale } from '@/contexts/LocaleContext';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';
import TripPlanner from '@/components/TripPlanner';
import AuthModal from '@/components/AuthModal';
import { destinations as destinationsApi, auth } from '@/lib/api';
import { Destination } from '@/types';
import { Loader2, Sparkles } from 'lucide-react';

function PlannerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedDestinationId = searchParams.get('destination');
  const { isAuthenticated } = useAuth();
  const { t } = useLocale();

  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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
          googleMapsUrl:      raw.google_maps_url      || raw.googleMapsUrl      || '',
          googleReviewCount:  raw.google_review_count  || raw.googleReviewCount  || 0,
          seoTitle:       raw.seo_title       || raw.seoTitle       || '',
          seoKeywords:    raw.seo_keywords    || raw.seoKeywords    || '',
          seoDescription: raw.seo_description || raw.seoDescription || '',
          ogImageUrl:     raw.og_image_url    || raw.ogImageUrl     || '',
        }));
        setAllDestinations(mapped as Destination[]);
      }
    }).catch(() => {}).finally(() => setIsLoading(false));
  }, []);

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

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(savedDestinations));
    } catch { /* ignore */ }
  }, [savedDestinations, hydrated]);

  useEffect(() => {
    if (!hydrated || !preselectedDestinationId || allDestinations.length === 0) return;
    const found = allDestinations.find(d => d.id === preselectedDestinationId);
    if (!found) return;
    setSavedDestinations(prev => {
      if (prev.some(d => d.id === found.id)) return prev;
      return [found, ...prev];
    });
  }, [hydrated, preselectedDestinationId, allDestinations]);

  const handleToggleSave = async (dest: Destination) => {
    if (!auth.isLoggedIn()) {
      setAuthModalOpen(true);
      return;
    }
    setSavedDestinations((prev) => {
      const exists = prev.some((d) => d.id === dest.id);
      return exists ? prev.filter((d) => d.id !== dest.id) : [...prev, dest];
    });
    try {
      const isSavedNow = !savedDestinations.some((d) => d.id === dest.id);
      await auth.updateDestinationStatus(dest.id, isSavedNow ? 'saved' : 'removed');
    } catch { /* ignore */ }
  };

  const handleExploreDestination = (dest: Destination) => {
    const slug = dest.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    router.push(`/destinations/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <Header
        activeTab="planner"
        setActiveTab={(tab) => {
          if (tab === 'map') router.push('/map');
          else router.push(`/?tab=${tab}`);
        }}
        savedCount={savedDestinations.length}
      />

      <SubNav
        onBack={() => router.back()}
        title={t('planner_page.title')}
        zClass="z-40"
      />

      {preselectedDestinationId && allDestinations.find(d => d.id === preselectedDestinationId) && (
        <div className="max-w-4xl mx-auto px-4 pt-5">
          <div className="flex items-center gap-3 bg-gold-50 border border-gold-200 rounded-2xl px-4 py-3">
            <Sparkles className="h-4 w-4 text-gold-600 shrink-0" />
            <p className="text-sm text-gold-800">
              <span className="font-semibold">{allDestinations.find(d => d.id === preselectedDestinationId)?.name}</span>
              {' '}sudah ditambahkan ke rencana perjalananmu.
            </p>
          </div>
        </div>
      )}

      <div className="pb-24">
        <TripPlanner
          savedDestinations={savedDestinations}
          onExploreDestination={handleExploreDestination}
          onRemoveFromSaved={handleToggleSave}
        />
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
}

export default function PlannerPageClient() {
  return (
    <AuthProvider>
      <LocationProvider>
        <I18nProvider>
          <Suspense fallback={
            <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
            </div>
          }>
            <PlannerPageContent />
          </Suspense>
        </I18nProvider>
      </LocationProvider>
    </AuthProvider>
  );
}
