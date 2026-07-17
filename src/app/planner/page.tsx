'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';
import TripPlanner from '@/components/TripPlanner';
import AuthModal from '@/components/AuthModal';
import { destinations as destinationsApi, auth } from '@/lib/api';
import { Destination } from '@/types';
import { Loader2 } from 'lucide-react';

function PlannerPageContent() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Load all destinations
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

  // Persist saved destinations to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(savedDestinations));
    } catch { /* ignore */ }
  }, [savedDestinations, hydrated]);

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
        title="Trip Planner"
        zClass="z-40"
      />

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

export default function PlannerPage() {
  return (
    <AuthProvider>
      <LocationProvider>
        <PlannerPageContent />
      </LocationProvider>
    </AuthProvider>
  );
}
