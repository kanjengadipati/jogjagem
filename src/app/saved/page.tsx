'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Compass, Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';
import AuthModal from '@/components/AuthModal';
import DestinationCard from '@/components/DestinationCard';
import { destinations as destinationsApi, auth } from '@/lib/api';
import { Destination } from '@/types';

function SavedPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect guests to auth modal immediately
  useEffect(() => {
    if (!auth.isLoggedIn()) {
      setAuthModalOpen(true);
    }
  }, []);

  // Load all destinations for enrichment
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
    }).catch(() => {}).finally(() => setIsLoading(false));
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

  // Persist to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(savedDestinations));
    } catch { /* ignore */ }
  }, [savedDestinations, hydrated]);

  const handleToggleSave = async (dest: Destination) => {
    if (!auth.isLoggedIn()) { setAuthModalOpen(true); return; }
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

  const handleAuthClose = () => {
    setAuthModalOpen(false);
    if (!auth.isLoggedIn()) router.push('/');
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
        activeTab="saved"
        setActiveTab={(tab) => {
          if (tab === 'map') router.push('/map');
          else router.push(`/?tab=${tab}`);
        }}
        savedCount={savedDestinations.length}
      />

      <SubNav
        onBack={() => router.back()}
        title="Saved Places"
        zClass="z-40"
      />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-24 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col space-y-2 mb-8 border-b border-gold-100 pb-5">
          <div className="flex items-center space-x-2.5">
            <Heart className="h-5 w-5 fill-gold-600 text-gold-600" />
            <h2 className="font-manrope text-2xl font-bold text-royal-950">Your Bookmarked Discoveries</h2>
          </div>
          <p className="text-sm text-royal-700/80 font-light">
            Your saved destinations. Allocate them into your Trip Planner to build the perfect itinerary.
          </p>
        </div>

        {savedDestinations.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-white/40 p-6 max-w-md mx-auto">
            <Compass className="h-10 w-10 text-gold-500 mx-auto mb-3" />
            <h3 className="font-manrope text-base font-bold text-royal-950">No Saved Places Yet</h3>
            <p className="text-xs text-royal-700/60 font-light mt-1 max-w-xs mx-auto">
              Explore Yogyakarta and tap the heart icon on any destination to save it here.
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-5 px-5 py-2.5 bg-royal-950 hover:bg-royal-800 text-white text-xs font-bold rounded-xl transition-all"
            >
              Explore Destinations
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {savedDestinations.map((dest) => (
              <DestinationCard
                key={dest.id}
                destination={dest}
                onExplore={handleExploreDestination}
                onToggleSave={handleToggleSave}
                onAuthRequired={() => setAuthModalOpen(true)}
                isSaved={isSaved(dest.id)}
              />
            ))}
          </div>
        )}
      </section>

      <AuthModal
        isOpen={authModalOpen}
        onClose={handleAuthClose}
        defaultMode="login"
      />
    </div>
  );
}

export default function SavedPage() {
  return (
    <AuthProvider>
      <LocationProvider>
        <SavedPageContent />
      </LocationProvider>
    </AuthProvider>
  );
}
