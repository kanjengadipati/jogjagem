'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import Hero from './components/Hero';
import CategoryLinks from './components/CategoryLinks';
import DestinationCard from './components/DestinationCard';
import MobileDiscoverView from './components/MobileDiscoverView';
import { useLocale } from '@/contexts/LocaleContext';

import { Destination, Festival } from './types';
import { destinations, events, config, auth, ai, APIResponse } from '@/lib/api';
import { Sparkles, Calendar, Quote, Compass, Eye, Heart, MapPin, Brain, CalendarDays, Map, Sun, Utensils, Leaf, Sunset, RefreshCw, User, ChevronRight, Star } from 'lucide-react';

export default function App() {
  const { t } = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
   const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  // baseDestinations: unfiltered full list, never replaced by category filter.
  // Used for AI picks lookup so they stay independent of the active filter.
  const [baseDestinations, setBaseDestinations] = useState<Destination[]>([]);
  const [allEvents, setAllEvents] = useState<Festival[]>([]);
  const [allQuotes, setAllQuotes] = useState<{ text: string; author: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [destPage, setDestPage] = useState(1);
  const [destTotalPages, setDestTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [eventPage, setEventPage] = useState(1);
  const [eventTotalPages, setEventTotalPages] = useState(1);
  const [loadingMoreEvents, setLoadingMoreEvents] = useState(false);
  const [aiPicks, setAiPicks] = useState<Array<{
    destinationId: string; headline: string; reason: string;
    badge: string; crowd: string; imageUrl: string; rating: number; location: string;
  }>>([]);
  const [trendingItems, setTrendingItems] = useState<Array<{
    type: 'destination' | 'event'; id: string; badge: string;
    headline: string; reason: string; imageUrl: string; rating: number; location: string;
  }>>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [isFilterLoading, setIsFilterLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      destinations.getAll(),
      events.getAll(),
      config.getQuotes(),
    ]).then(([destRes, eventRes, quoteRes]) => {
      if (destRes.status === 'success' && destRes.data) {
        const mapped = (destRes.data as any[]).map(raw => ({
          ...raw,
          subRegion: raw.sub_region || raw.SubRegion || raw.subRegion || '',
          ticketPrice: raw.ticket_price || raw.TicketPrice || raw.ticketPrice || '',
          openingHours: raw.opening_hours || raw.OpeningHours || raw.openingHours || '',
          reviewCount: raw.review_count || raw.ReviewCount || raw.reviewCount || 0,
          travelTips: raw.travel_tips || raw.TravelTips || raw.travelTips || [],
          bestTime: raw.best_time || raw.BestTime || raw.bestTime || '',
          googleMapsUrl: raw.google_maps_url || raw.GoogleMapsURL || raw.googleMapsUrl || '',
          googleReviewCount: raw.google_review_count || raw.GoogleReviewCount || raw.googleReviewCount || 0,
          seoTitle: raw.seo_title || raw.SeoTitle || raw.seoTitle || '',
          seoKeywords: raw.seo_keywords || raw.SeoKeywords || raw.seoKeywords || '',
          seoDescription: raw.seo_description || raw.SeoDescription || raw.seoDescription || '',
          ogImageUrl: raw.og_image_url || raw.OgImageUrl || raw.ogImageUrl || '',
        }));
        setAllDestinations(mapped as Destination[]);
        setBaseDestinations(mapped as Destination[]); // keep unfiltered copy for AI picks
        // Save pagination meta
        const meta = (destRes as any).meta;
        if (meta) {
          setDestPage(meta.page ?? 1);
          setDestTotalPages(meta.total_pages ?? 1);
        }
      }
      if (eventRes.status === 'success' && eventRes.data) {
        const mapped = (eventRes.data as any[]).map(raw => ({
          id: raw.id || raw.ExternalID || '',
          name: raw.title || raw.Name || '',
          date: raw.start_date ? `${raw.start_date} - ${raw.end_date || ''}` : (raw.date || ''),
          location: raw.location || '',
          image: raw.image_url || raw.image || '',
          description: raw.description || '',
          highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
          category: raw.category || '',
        }));
        setAllEvents(mapped);
        const meta = (eventRes as any).meta;
        if (meta) {
          setEventPage(meta.page ?? 1);
          setEventTotalPages(meta.total_pages ?? 1);
        }
      }
      if (quoteRes.status === 'success' && quoteRes.data) {
        setAllQuotes(quoteRes.data);
      }
    }).catch(err => {
      console.error('Failed to load data:', err);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  // Fetch when category changes — use isFilterLoading (not isLoading) to avoid full-page spinner
  useEffect(() => {
    // Skip on initial mount — handled by the mount Promise.all
    if (isLoading) return;

    async function loadCategory() {
      setIsFilterLoading(true);
      try {
        const mapRaw = (raw: any) => ({
          ...raw,
          subRegion: raw.sub_region || raw.SubRegion || raw.subRegion || '',
          ticketPrice: raw.ticket_price || raw.TicketPrice || raw.ticketPrice || '',
          openingHours: raw.opening_hours || raw.OpeningHours || raw.openingHours || '',
          reviewCount: raw.review_count || raw.ReviewCount || raw.reviewCount || 0,
          travelTips: raw.travel_tips || raw.TravelTips || raw.travelTips || [],
          bestTime: raw.best_time || raw.BestTime || raw.bestTime || '',
          googleMapsUrl: raw.google_maps_url || raw.GoogleMapsURL || raw.googleMapsUrl || '',
          googleReviewCount: raw.google_review_count || raw.GoogleReviewCount || raw.googleReviewCount || 0,
          seoTitle: raw.seo_title || raw.SeoTitle || raw.seoTitle || '',
          seoKeywords: raw.seo_keywords || raw.SeoKeywords || raw.seoKeywords || '',
          seoDescription: raw.seo_description || raw.SeoDescription || raw.seoDescription || '',
          ogImageUrl: raw.og_image_url || raw.OgImageUrl || raw.ogImageUrl || '',
        });

        if (selectedCategory) {
          const res = await destinations.getByCategory(selectedCategory);
          if (res.status === 'success' && res.data) {
            setAllDestinations((res.data as any[]).map(mapRaw) as Destination[]);
            setDestPage(1);
            setDestTotalPages(1);
          }
        } else {
          const res = await destinations.getAll({ limit: 15, page: 1 });
          if (res.status === 'success' && res.data) {
            setAllDestinations((res.data as any[]).map(mapRaw) as Destination[]);
            const meta = (res as any).meta;
            if (meta) {
              setDestPage(meta.page ?? 1);
              setDestTotalPages(meta.total_pages ?? 1);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load category destinations:', err);
      } finally {
        setIsFilterLoading(false);
      }
    }
    loadCategory();
  }, [selectedCategory]);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [footerOpenIdx, setFooterOpenIdx] = useState<number | null>(null);

  const [pendingReportId, setPendingReportId] = useState<string | null>(null);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };
  
  const handleAuthSuccess = () => {
    const pendingId = sessionStorage.getItem('pending_report');
    if (pendingId) {
      setPendingReportId(pendingId);
      sessionStorage.removeItem('pending_report');
    }
  };

  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR/client mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('explore_jogja_saved_v1');
      if (saved) {
        const parsed: Destination[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If allDestinations is loaded, prefer fresh data; otherwise use cached
          if (allDestinations.length > 0) {
            const refreshed = parsed
              .map(item => allDestinations.find(d => d.id === item.id) ?? item)
              .filter(Boolean) as Destination[];
            setSavedDestinations(refreshed);
          } else {
            // allDestinations not loaded yet — use cached objects directly
            setSavedDestinations(parsed);
          }
        }
      }
    } catch (e) {
      console.error("Local storage read failed:", e);
    }
    setHydrated(true);
  }, [allDestinations]);


  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(savedDestinations));
    } catch (e) {
      console.error("Local storage write failed:", e);
    }
  }, [savedDestinations, hydrated]);

  const handleToggleSave = async (dest: Destination) => {
    // Optimistic update — always save locally first, no login required
    setSavedDestinations((prev) => {
      const exists = prev.some(d => d.id === dest.id);
      const newSaved = exists ? prev.filter(d => d.id !== dest.id) : [...prev, dest];
      localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(newSaved));
      return newSaved;
    });

    // Sync with API only if logged in
    if (auth.isLoggedIn()) {
      try {
        const isSavedNow = !savedDestinations.some(d => d.id === dest.id);
        await auth.updateDestinationStatus(dest.id, isSavedNow ? 'saved' : 'removed');
      } catch (err) {
        console.error('Failed to sync save status', err);
      }
    }
  };

  const isSaved = (id: string) => {
    return savedDestinations.some(d => d.id === id);
  };

  // Keep URL in sync with active tab so back/forward and direct links work.
  // For the default 'discover' tab we stay on clean '/' — no ?tab= needed.
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleHeroSearch = (query: string) => {
    router.push(`/ai?q=${encodeURIComponent(query)}`);
  };

  const handleHeroImageSearch = (imageUrl: string, reply: string, matchedDestinationIds: string[]) => {
    try {
      sessionStorage.setItem('ai_image_result', JSON.stringify({ imageUrl, reply, matchedDestinationIds }));
    } catch { /* ignore */ }
    router.push('/ai');
  };

  const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleExploreDestination = (dest: Destination) => {
    router.push(`/destinations/${toSlug(dest.name)}`);
  };

  const loadMoreDestinations = async () => {
    if (loadingMore || destPage >= destTotalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = destPage + 1;
      const res = await destinations.getAll({ limit: 15, page: nextPage });
      if (res.status === 'success' && res.data) {
        const mapped = (res.data as any[]).map(raw => ({
          ...raw,
          subRegion: raw.sub_region || raw.SubRegion || raw.subRegion || '',
          ticketPrice: raw.ticket_price || raw.TicketPrice || raw.ticketPrice || '',
          openingHours: raw.opening_hours || raw.OpeningHours || raw.openingHours || '',
          reviewCount: raw.review_count || raw.ReviewCount || raw.reviewCount || 0,
          travelTips: raw.travel_tips || raw.TravelTips || raw.travelTips || [],
          bestTime: raw.best_time || raw.BestTime || raw.bestTime || '',
          googleMapsUrl: raw.google_maps_url || raw.GoogleMapsURL || raw.googleMapsUrl || '',
          googleReviewCount: raw.google_review_count || raw.GoogleReviewCount || raw.googleReviewCount || 0,
          seoTitle: raw.seo_title || raw.SeoTitle || raw.seoTitle || '',
          seoKeywords: raw.seo_keywords || raw.SeoKeywords || raw.seoKeywords || '',
          seoDescription: raw.seo_description || raw.SeoDescription || raw.seoDescription || '',
          ogImageUrl: raw.og_image_url || raw.OgImageUrl || raw.ogImageUrl || '',
        }));
        setAllDestinations(prev => [...prev, ...(mapped as Destination[])]);
        setDestPage(nextPage);
        const meta = (res as any).meta;
        if (meta) {
          setDestTotalPages(meta.total_pages ?? 1);
        }
      }
    } catch (err) {
      console.error('Failed to load more destinations:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreEvents = async () => {
    if (loadingMoreEvents || eventPage >= eventTotalPages) return;
    setLoadingMoreEvents(true);
    try {
      const nextPage = eventPage + 1;
      const res = await events.getAll({ limit: 15, page: nextPage });
      if (res.status === 'success' && res.data) {
        const mapped = (res.data as any[]).map(raw => ({
          id: raw.id || raw.ExternalID || '',
          name: raw.title || raw.Name || '',
          date: raw.start_date ? `${raw.start_date} - ${raw.end_date || ''}` : (raw.date || ''),
          location: raw.location || '',
          image: raw.image_url || raw.image || '',
          description: raw.description || '',
          highlights: Array.isArray(raw.highlights) ? raw.highlights : [],
          category: raw.category || '',
        }));
        setAllEvents(prev => [...prev, ...mapped]);
        setEventPage(nextPage);
        const meta = (res as any).meta;
        if (meta) {
          setEventTotalPages(meta.total_pages ?? 1);
        }
      }
    } catch (err) {
      console.error('Failed to load more events:', err);
    } finally {
      setLoadingMoreEvents(false);
    }
  };

  // Fetch AI multi-picks once when destinations first load — not on every page append
  const aiPicksFetchedRef = useRef(false);
  useEffect(() => {
    if (allDestinations.length === 0 || aiPicksFetchedRef.current) return;
    aiPicksFetchedRef.current = true;
    const hour = new Date().getHours();
    const timeOfDay = hour < 11 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    ai.recommendMulti(timeOfDay)
      .then((res: APIResponse<{ items: any[] }>) => {
        if (res.status === 'success' && res.data?.items?.length) {
          setAiPicks(res.data.items);
        }
      })
      .catch(() => {});
  }, [allDestinations]);

  // Fetch trending items for mobile view
  useEffect(() => {
    ai.trending()
      .then((res: APIResponse<{ items: any[] }>) => {
        if (res.status === 'success' && res.data?.items?.length) {
          setTrendingItems(res.data.items);
        }
      })
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, []);

  // Quick helper to choose random quote
  const [quoteIdx, setQuoteIdx] = useState(0);
  useEffect(() => {
    if (allQuotes.length > 0) {
      setQuoteIdx(Math.floor(Math.random() * allQuotes.length));
    }
  }, [activeTab, allQuotes]);

  const badgePriority = (badge?: string) =>
    badge === 'trending' ? 0 : badge === 'hidden_gem' ? 1 : 2;

  // When a category is selected, allDestinations is already populated by the
  // API fetch in the selectedCategory useEffect — no extra client-side filter needed.
  const displayDestinations = selectedCategory
    ? allDestinations
    : [...allDestinations].sort((a, b) => {
        const rankDiff = badgePriority(a.badge) - badgePriority(b.badge);
        if (rankDiff !== 0) return rankDiff;
        return (b.rating ?? 0) - (a.rating ?? 0);
      });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div id="explore-jogja-app-root" className="min-h-screen bg-[#F5F0E8] flex flex-col justify-between">
      
      {/* Premium Header — desktop only (mobile + tablet has its own in MobileDiscoverView) */}
      <div className="hidden xl:block">
      <Header 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab === 'map') {
            router.push('/map');
          } else if (tab === 'events') {
            navigateToTab('discover-events');
            setTimeout(() => {
              const el = document.getElementById('upcoming-festivals-showcase');
              if (el) {
                const headerOffset = 80;
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            }, 150);
          } else if (tab === 'experiences') {
            navigateToTab('discover-experiences');
            setTimeout(() => {
              const el = document.getElementById('trending-destinations-showcase');
              if (el) {
                const headerOffset = 80;
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth'
                });
              }
            }, 150);
          } else {
            navigateToTab(tab);
          }
        }}
        savedCount={savedDestinations.length}
        onOpenAuth={openAuth}
      />
      </div>{/* end hidden xl:block header */}

      {/* Main Core Content container */}
      <main id="main-content-layout" className="flex-1 pb-4 xl:pb-16 bg-[#F5F0E8]">
        
        <>
            {/* Active Tab: Discover (Homepage) */}
            {(activeTab === 'discover' || activeTab.startsWith('discover-')) && (
              <>
                {/* ── Mobile-only dark redesign ── */}
                <MobileDiscoverView
                  allDestinations={allDestinations}
                  baseDestinations={baseDestinations}
                  allEvents={allEvents}
                  trendingItems={trendingItems}
                  trendingLoading={trendingLoading}
                  aiPicks={aiPicks}
                  onToggleSave={handleToggleSave}
                  isSaved={isSaved}
                  onOpenAuth={openAuth}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />

                {/* ── Desktop layout (unchanged) ── */}
                <div className="hidden xl:block">
              <div className="space-y-4 animate-fade-in">
                {/* Visual Fullscreen Hero Section */}
                <Hero
                  destinations={allDestinations}
                  onSearchSubmit={handleHeroSearch}
                  onImageSearchSubmit={handleHeroImageSearch}
                  onExploreDestination={handleExploreDestination}
                  onToggleSave={handleToggleSave}
                  isSaved={isSaved}
                  initialAiPick={aiPicks[0]}
                />

                {/* Categories Row */}
                <CategoryLinks
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />

                {/* Destinations Showcase Grids */}
                <section id="trending-destinations-showcase" className="mx-auto max-w-7xl px-4 pt-1 pb-8 sm:px-6 lg:px-8 sm:pt-2">
                  <div className="flex items-end justify-between mb-6">
                    <div className="flex flex-col">
                      <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-gold-600 font-semibold mb-1 block">
                        {selectedCategory ? t('home.curated_label') : t('home.local_label')}
                      </span>
                      <h2 className="font-manrope text-2xl sm:text-3xl font-bold tracking-tight text-royal-950">
                        {selectedCategory 
                          ? t('home.curated_category', { category: t(`category.${selectedCategory}`) }) 
                          : t('home.popular_destinations')
                        }
                      </h2>
                    </div>
                    <button 
                      onClick={() => router.push('/destinations')}
                      className="text-xs sm:text-sm font-semibold text-royal-700/80 hover:text-gold-600 transition-colors flex items-center space-x-0.5 border-b border-royal-700/10 hover:border-gold-600 pb-0.5 cursor-pointer"
                    >
                      <span>{t('common.see_all')}</span>
                      <span>&gt;</span>
                    </button>
                  </div>

                  {isFilterLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="rounded-3xl bg-stone-200/70 animate-pulse aspect-[3/4]" />
                      ))}
                    </div>
                  ) : displayDestinations.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gold-200 rounded-3xl bg-[#F5F0E8] p-6">
                      <span className="block text-sm font-medium text-royal-950">{t('home.no_matches')}</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
                      {displayDestinations.map((dest, index) => (
                      <DestinationCard
                          key={dest.id}
                          destination={dest}
                          onExplore={handleExploreDestination}
                          onToggleSave={handleToggleSave}
                          onAuthRequired={() => openAuth('login')}
                          isSaved={isSaved(dest.id)}
                          isReportPending={pendingReportId === dest.id}
                          onClearPendingReport={() => setPendingReportId(null)}
                          className={index % 7 === 0 ? 'col-span-2 lg:col-span-2' : 'col-span-1 lg:col-span-1'}
                        />
                      ))}
                    </div>
                  )}

                  {!selectedCategory && destPage < destTotalPages && (
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={loadMoreDestinations}
                        disabled={loadingMore}
                        className="px-6 py-2 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 disabled:opacity-50 text-white rounded-full font-semibold text-xs transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer"
                      >
                        {loadingMore ? (
                          <>
                            <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent animate-spin"></span>
                            <span>{t('common.loading')}</span>
                          </>
                        ) : (
                          <span>{t('common.load_more')}</span>
                        )}
                      </button>
                    </div>
                  )}
                </section>

                {/* Two Column section matching high-fidelity mockup */}
                <section id="upcoming-festivals-showcase" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                  <div className="flex items-end justify-between mb-5 border-b border-[#E8E0D5] pb-3">
                    <div className="text-left">
                      <h2 className="font-manrope text-xl sm:text-2xl font-bold tracking-tight text-royal-950">
                        {t('home.upcoming_festivals')}
                      </h2>
                      <p className="text-xs text-stone-500/80 mt-0.5">{t('home.don_t_miss')}</p>
                    </div>
                    <button
                      onClick={() => router.push('/events')}
                      className="text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center space-x-0.5 cursor-pointer"
                    >
                      <span>{t('common.see_all')}</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* 5 events: row 1 = 3 cards, row 2 = 2 cards centered */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                    {allEvents.slice(0, 5).map((fest, idx) => {
                          const fallbackBadges = [t('common.badge_limited'), t('common.badge_popular'), t('common.badge_live_tonight'), t('common.badge_upcoming'), t('common.badge_upcoming')];
                          const subBadge = [t('common.badge_starts_5'), t('common.badge_starts_18'), t('common.badge_tonight_7'), t('common.badge_upcoming'), t('common.badge_upcoming')];
                          
                          const apiBadge = fest.badge;
                          const rawBadgeText = apiBadge 
                            ? t(`hero.badge_${apiBadge.toLowerCase().replace(/ /g, '_')}`) 
                            : (fallbackBadges[idx] || fest.category);
                          const badgeText = rawBadgeText.toUpperCase();
                          const badgeKey = (apiBadge || fallbackBadges[idx] || fest.category)
                            .toLowerCase().replace(/-/g, '_').replace(/ /g, '_');

                          const BADGE_STYLES: Record<string, string> = {
                            'trending': 'bg-red-600/90 border border-red-500/30 text-white',
                            'akan_datang': 'bg-blue-600/90 border border-blue-500/30 text-white',
                            'spesial_hari_ini': 'bg-amber-600/90 border border-amber-500/30 text-white',
                            'populer': 'bg-purple-600/90 border border-purple-500/30 text-white',
                            'terbatas': 'bg-orange-600/90 border border-orange-500/30 text-white',
                            'live_malam_ini': 'bg-green-600/90 border border-green-500/30 text-white',
                          };
                          const badgeBgClass = BADGE_STYLES[badgeKey] || 'bg-black/40 backdrop-blur-md border border-white/10 text-white';

                          return (
                            <div
                              key={fest.id}
                              onClick={() => router.push(`/events/${fest.id}`)}
                              className="group relative aspect-[3/4] w-full overflow-hidden rounded-[20px] bg-royal-950 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-stone-200/10"
                            >
                              {fest.image ? (
                                <Image 
                                  src={fest.image} 
                                  alt={fest.name} 
                                  fill
                                  sizes="(max-width: 640px) 50vw, 20vw"
                                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                />
                              ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-royal-900 to-royal-950" />
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                              
                              <div className={`absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-full text-[9px] font-sans font-semibold uppercase tracking-[0.08em] ${badgeBgClass}`}>
                                {badgeText}
                              </div>
                              <button className="absolute top-3.5 right-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 hover:bg-black/45 text-white backdrop-blur-sm border border-white/10">
                                <Heart className="h-3.5 w-3.5 text-white" />
                              </button>

                              <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end text-left">
                                <span className="text-[9px] font-sans font-semibold text-gold-400 mb-1 tracking-[0.08em] uppercase">
                                  {subBadge[idx] || t('common.badge_upcoming')}
                                </span>
                                <h3 className="font-manrope text-sm font-bold tracking-tight text-white leading-tight mb-1.5 group-hover:text-gold-300 transition-colors line-clamp-2">
                                  {fest.name}
                                </h3>
                                <p className="text-[10px] text-white/60 font-light leading-snug">
                                  {fest.date} • {fest.location}
                                </p>
                                <div className="absolute bottom-4 right-4 h-6 w-6 rounded-full bg-gold-400 text-royal-950 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
                                  <svg className="h-3 w-3 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                  </div>
                </section>

                  {/* AI Suggested Journey Section */}
                  <section id="ai-suggested-journey-timeline" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 border-b border-[#E8E0D5] pb-4">
                    <div className="text-left">
                      <h2 className="font-manrope text-xl sm:text-2xl font-bold tracking-tight text-royal-950">
                        {t('home.ai_suggested_journey')}
                      </h2>
                      <p className="text-xs text-stone-500/80 mt-0.5">{t('home.one_perfect_day')}</p>
                    </div>
                    <button 
                      onClick={() => router.push('/planner')}
                      className="mt-2 sm:mt-0 text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('home.customize_ai')}</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Timeline grid — 4 cards in a row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {(() => {
                      const journeySlots = [
                        { label: t('home.morning'), time: '07.00 AM', icon: Sun,     color: '#B18A5E', bgColor: '#FDF6EC', categories: ['heritage', 'adventure'] },
                        { label: t('home.lunch'),   time: '12.00 PM', icon: Utensils, color: '#5F713D', bgColor: '#F0F4EC', categories: ['culinary'] },
                        { label: t('home.afternoon'),time:'02.30 PM', icon: Leaf,     color: '#4F6F52', bgColor: '#EEF4EF', categories: ['nature', 'heritage', 'hidden-gem'] },
                        { label: t('home.sunset'),  time: '05.30 PM', icon: Sunset,  color: '#BC6C25', bgColor: '#FDF0E6', categories: ['beach', 'nature'] },
                      ];

                      return journeySlots.map((slot, idx) => {
                        const dest = allDestinations
                          .filter(d => slot.categories.includes(d.category) && d.images.length > 0)
                          .sort((a, b) => b.rating - a.rating)[0];
                        if (!dest) return null;
                        const Icon = slot.icon;
                        return (
                          <div
                            key={slot.label}
                            onClick={() => handleExploreDestination(dest)}
                            className="group relative rounded-[20px] overflow-hidden cursor-pointer border border-stone-200/60 hover:border-gold-300 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 aspect-[3/4]"
                          >
                            {/* Image — full card */}
                            <Image
                              src={dest.images[0]?.url || ''}
                              fill
                              sizes="(max-width: 640px) 50vw, 25vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                              alt={dest.name}
                            />

                            {/* Gradient scrim */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                            {/* Time chip top-left */}
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 border border-white/10">
                              <Icon className="h-3 w-3" style={{ color: slot.color }} />
                              <span className="text-[10px] font-bold text-white">{slot.time}</span>
                            </div>

                            {/* Step number top-right */}
                            <div className="absolute top-2.5 right-2.5 h-5 w-5 rounded-full bg-white/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                              <span className="text-[9px] font-bold text-white">{idx + 1}</span>
                            </div>

                            {/* Info overlay — bottom */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: slot.color }}>
                                {slot.label}
                              </p>
                              <h4 className="font-manrope text-sm font-bold text-white leading-tight line-clamp-1 group-hover:text-gold-300 transition-colors drop-shadow-sm">
                                {dest.name}
                              </h4>
                              <div className="flex items-center justify-between mt-1.5">
                                <div className="flex items-center gap-1 text-[10px]">
                                  <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                                  <span className="font-bold text-gold-400">{dest.rating.toFixed(1)}</span>
                                  <span className="text-white/50">· {dest.subRegion || dest.location}</span>
                                </div>
                                <div className="h-6 w-6 rounded-full bg-gold-400 text-royal-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0">
                                  <svg className="h-3 w-3 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </section>

                  {/* Editorial Literary Quote (Anti-AI-Slop humbleness and high craft) */}
                  {allQuotes.length > 0 && (
                    <section id="literary-quote-section" className="mx-auto max-w-4xl px-4 py-8 text-center">
                    <div className="relative p-8 rounded-3xl bg-gold-50/30 border border-gold-100/40 shadow-inner flex flex-col items-center">
                      <Quote className="h-8 w-8 text-gold-400 opacity-60 mb-4" />
                      <p className="font-display text-lg italic text-royal-950/90 leading-relaxed max-w-xl">
                        "{allQuotes[quoteIdx]?.text}"
                      </p>
                      <span className="block mt-3 text-xs uppercase tracking-wider font-mono font-bold text-gold-700">
                        — {allQuotes[quoteIdx]?.author}
                      </span>
                    </div>
                  </section>
                )}
              </div>
                </div>{/* end hidden xl:block desktop wrapper */}
              </>
            )}

            {/* Active Tab: Events */}
            {activeTab === 'events' && (
              <section id="events-tab-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="flex flex-col space-y-1 mb-8 border-b border-stone-200 pb-5">
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="h-5 w-5 text-gold-600" />
                    <h2 className="font-manrope text-2xl font-bold text-royal-950">{t('home.upcoming_events')}</h2>
                  </div>
                  <p className="text-sm text-royal-700/70 font-light">{t('home.events_desc')}</p>
                </div>
                {allEvents.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-[#F5F0E8] p-6 max-w-md mx-auto">
                    <Calendar className="h-10 w-10 text-gold-400 mx-auto mb-3" />
                    <h3 className="font-manrope text-base font-bold text-royal-950">{t('home.no_events_title')}</h3>
                    <p className="text-xs text-royal-700/60 font-light mt-1 max-w-xs mx-auto">{t('home.no_events_desc')}</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {allEvents.map((evt) => (
                      <div key={evt.id} className="group rounded-3xl overflow-hidden bg-white border border-[#E8E0D5] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                        <div className="relative h-44 overflow-hidden bg-stone-100">
                          {evt.image ? (
                            <Image src={evt.image} alt={evt.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-50 to-amber-100">
                              <Calendar className="h-10 w-10 text-gold-400" />
                            </div>
                          )}
                          {evt.category && (
                            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-royal-950 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#E8E0D5]">
                              {evt.category}
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-manrope font-bold text-sm text-royal-950 leading-tight mb-1.5 line-clamp-2">{evt.name}</h3>
                          {evt.date && (
                            <div className="flex items-center space-x-1.5 text-[11px] text-gold-700 font-medium mb-2">
                              <Calendar className="h-3 w-3" />
                              <span>{evt.date}</span>
                            </div>
                          )}
                          {evt.location && (
                            <div className="flex items-center space-x-1.5 text-[11px] text-stone-500 mb-2">
                              <MapPin className="h-3 w-3 shrink-0" />
                              <span className="truncate">{evt.location}</span>
                            </div>
                          )}
                          {evt.description && (
                            <p className="text-xs text-stone-600/80 line-clamp-2 leading-relaxed">{evt.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {eventPage < eventTotalPages && (
                  <div className="mt-8 flex justify-center">
                    <button
                      onClick={loadMoreEvents}
                      disabled={loadingMoreEvents}
                      className="px-6 py-2 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 disabled:opacity-50 text-white rounded-full font-semibold text-xs transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer"
                    >
                      {loadingMoreEvents ? (
                        <>
                          <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent animate-spin"></span>
                          <span>{t('common.loading')}</span>
                        </>
                      ) : (
                        <span>{t('common.load_more')}</span>
                      )}
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* Active Tab: Experiences */}
            {activeTab === 'experiences' && (
              <section id="experiences-tab-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="flex flex-col space-y-1 mb-8 border-b border-stone-200 pb-5">
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="h-5 w-5 text-gold-600" />
                    <h2 className="font-manrope text-2xl font-bold text-royal-950">{t('home.experiences')}</h2>
                  </div>
                  <p className="text-sm text-royal-700/70 font-light">{t('home.experiences_desc')}</p>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {allDestinations
                    .filter(d => ['adventure', 'nature', 'hidden-gem', 'beach'].includes(d.category?.toLowerCase()))
                    .map((dest) => (
                      <DestinationCard
                        key={dest.id}
                        destination={dest}
                        onExplore={handleExploreDestination}
                        onToggleSave={handleToggleSave}
                        onAuthRequired={() => openAuth('login')}
                        isSaved={isSaved(dest.id)}
                        isReportPending={pendingReportId === dest.id}
                        onClearPendingReport={() => setPendingReportId(null)}
                      />
                    ))
                  }
                  {allDestinations.filter(d => ['adventure', 'nature', 'hidden-gem', 'beach'].includes(d.category?.toLowerCase())).length === 0 && (
                    <div className="col-span-full text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-[#F5F0E8] p-6">
                      <Leaf className="h-10 w-10 text-gold-400 mx-auto mb-3" />
                      <h3 className="font-manrope text-base font-bold text-royal-950">{t('home.loading_experiences')}</h3>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Active Tab: AI Assistant → /ai route */}
            {/* Active Tab: Trip Planner → /planner route */}
            {/* Active Tab: Saved → /saved route */}
        </>
      </main>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        defaultMode={authModalMode}
      />

      {/* Footer */}
      <footer id="editorial-luxury-footer" className="bg-[#F5F0E8] md:bg-royal-950 text-white md:text-white border-t-0 md:border-t border-stone-200 md:border-royal-900">

        {/* Quote card — mobile only */}
        <div className="xl:hidden mx-4 mt-3 mb-0 bg-[#F5EDD8] rounded-3xl p-5 flex items-start gap-4 border border-[#E8D9B8]">
          <span className="text-gold-500 text-4xl font-serif leading-none mt-1">"</span>
          <div className="flex-1">
            <p className="text-royal-950 font-manrope font-semibold text-[13px] leading-relaxed">
              Jogja bukan sekadar tempat, tapi rasa yang selalu ingin kembali.
            </p>
            <p className="text-gold-600 text-[11px] font-semibold mt-2">— Jogjagem</p>
          </div>
          <div className="shrink-0 opacity-30">
            <Image src="/logo-gold-new.png" alt="" width={48} height={48} className="h-12 w-auto" />
          </div>
        </div>

        {/* Main footer body */}
        <div className="bg-royal-950 mt-4 xl:mt-0 rounded-t-3xl xl:rounded-none px-5 pt-7 pb-[calc(90px+env(safe-area-inset-bottom,0px))] xl:pb-12">
          <div className="mx-auto max-w-7xl">

            {/* Logo + tagline + social */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Image src="/logo-gold-new.png" alt="Jogjagem" width={22} height={22} className="h-[22px] w-auto" />
                  <span className="font-manrope font-bold text-[16px] tracking-widest text-white uppercase">Jogjagem</span>
                </div>
                <p className="text-white/50 text-[11px] leading-snug max-w-[180px]">
                  Teman perjalananmu terbaik menjelajahi keindahan Yogyakarta.
                </p>
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-4 mb-7">
              {[
                { icon: 'IG', href: 'https://instagram.com' },
                { icon: 'TK', href: 'https://tiktok.com' },
                { icon: 'YT', href: 'https://youtube.com' },
                { icon: 'FB', href: 'https://facebook.com' },
              ].map(s => (
                <a
                  key={s.icon}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-colors text-[10px] font-bold"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            {/* Nav links — accordion */}
            {(() => {
              const NAV_ITEMS = [
                {
                  label: 'Tentang Kami',
                  content: 'Jogjagem adalah platform perjalanan digital yang membantu kamu menjelajahi keindahan Yogyakarta — dari destinasi tersembunyi hingga warisan budaya dunia. Dibuat dengan cinta oleh anak Jogja, untuk semua yang rindu Jogja.',
                },
                {
                  label: 'Bantuan',
                  content: 'Butuh bantuan? Hubungi kami via email di hello@jogjagem.id atau DM Instagram @jogjagem. Tim kami siap membantu kamu merencanakan perjalanan terbaik ke Yogyakarta.',
                },
                {
                  label: 'Syarat & Ketentuan',
                  content: 'Dengan menggunakan Jogjagem, kamu menyetujui penggunaan layanan secara bertanggung jawab. Konten, foto, dan data destinasi hanya untuk keperluan informasi perjalanan. Jogjagem tidak bertanggung jawab atas perubahan harga atau jam operasional destinasi.',
                },
                {
                  label: 'Kebijakan Privasi',
                  content: 'Kami menghargai privasimu. Data lokasi dan preferensi perjalanan hanya digunakan untuk meningkatkan rekomendasi. Kami tidak menjual data pribadimu kepada pihak ketiga. Kamu dapat menghapus akun dan data kapan saja.',
                },
              ];

              return (
                <div className="border-t border-white/10 divide-y divide-white/8">
                  {NAV_ITEMS.map((item, idx) => (
                    <div key={item.label}>
                      <button
                        onClick={() => setFooterOpenIdx(footerOpenIdx === idx ? null : idx)}
                        className="w-full flex items-center justify-between py-3.5 text-left"
                      >
                        <span className="text-white/80 text-[13px] font-medium">{item.label}</span>
                        <ChevronRight
                          className={`h-4 w-4 text-white/30 transition-transform duration-200 ${footerOpenIdx === idx ? 'rotate-90' : ''}`}
                        />
                      </button>
                      {footerOpenIdx === idx && (
                        <p className="text-white/50 text-[12px] leading-relaxed pb-3.5 -mt-1 pr-4">
                          {item.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {/* Desktop copyright */}
            <div className="hidden xl:block mt-6 pt-4 border-t border-white/10">
              <div className="text-[10px] font-mono text-gold-200/40 uppercase tracking-widest space-y-1">
                <p>{t('footer.copyright')}</p>
                <p>{t('footer.build_by')}</p>
              </div>
            </div>

          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-[calc(8px+env(safe-area-inset-bottom,0px))]">
        <div className="bg-[#1c1a17]/95 backdrop-blur-xl border border-white/10 rounded-[28px] px-2 py-2 flex items-center justify-around shadow-[0_8px_32px_rgba(0,0,0,0.5)]">

          {/* Beranda */}
          {(() => {
            const isActive = ['discover','events','experiences'].includes(activeTab);
            return (
              <button
                onClick={() => navigateToTab('discover')}
                className="flex flex-col items-center gap-1 flex-1 py-1"
              >
                <div className={`flex items-center justify-center w-10 h-8 rounded-2xl transition-all duration-200 ${isActive ? 'bg-gold-400/20' : ''}`}>
                  <Compass className={`h-5 w-5 transition-colors ${isActive ? 'text-gold-400' : 'text-white/40'}`} />
                </div>
                <span className={`text-[9px] font-semibold tracking-wide transition-colors ${isActive ? 'text-gold-400' : 'text-white/30'}`}>
                  Beranda
                </span>
              </button>
            );
          })()}

          {/* Jelajah */}
          {(() => {
            const isActive = activeTab === 'destinations';
            return (
              <button
                onClick={() => router.push('/destinations')}
                className="flex flex-col items-center gap-1 flex-1 py-1"
              >
                <div className={`flex items-center justify-center w-10 h-8 rounded-2xl transition-all duration-200 ${isActive ? 'bg-gold-400/20' : ''}`}>
                  <Map className={`h-5 w-5 transition-colors ${isActive ? 'text-gold-400' : 'text-white/40'}`} />
                </div>
                <span className={`text-[9px] font-semibold tracking-wide transition-colors ${isActive ? 'text-gold-400' : 'text-white/30'}`}>
                  Jelajahi
                </span>
              </button>
            );
          })()}

          {/* AI — center elevated */}
          <div className="flex flex-col items-center flex-1 -mt-6">
            <button
              onClick={() => router.push('/ai')}
              className="flex flex-col items-center gap-1 active:scale-95 transition-transform duration-150"
            >
              <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center shadow-[0_4px_16px_rgba(180,130,40,0.45)] border border-gold-300/20">
                <Sparkles className="h-6 w-6 text-royal-950" />
              </div>
              <span className="text-[9px] font-semibold tracking-wide text-gold-400">AI</span>
            </button>
          </div>

          {/* Itinerary */}
          {(() => {
            const isActive = activeTab === 'planner';
            return (
              <button
                onClick={() => router.push('/planner')}
                className="flex flex-col items-center gap-1 flex-1 py-1"
              >
                <div className={`flex items-center justify-center w-10 h-8 rounded-2xl transition-all duration-200 ${isActive ? 'bg-gold-400/20' : ''}`}>
                  <CalendarDays className={`h-5 w-5 transition-colors ${isActive ? 'text-gold-400' : 'text-white/40'}`} />
                </div>
                <span className={`text-[9px] font-semibold tracking-wide transition-colors ${isActive ? 'text-gold-400' : 'text-white/30'}`}>
                  Itinerary
                </span>
              </button>
            );
          })()}

          {/* Profil */}
          {(() => {
            const isActive = activeTab === 'profile';
            return (
              <button
                onClick={() => router.push('/profile')}
                className="flex flex-col items-center gap-1 flex-1 py-1"
              >
                <div className={`flex items-center justify-center w-10 h-8 rounded-2xl transition-all duration-200 ${isActive ? 'bg-gold-400/20' : ''}`}>
                  <User className={`h-5 w-5 transition-colors ${isActive ? 'text-gold-400' : 'text-white/40'}`} />
                </div>
                <span className={`text-[9px] font-semibold tracking-wide transition-colors ${isActive ? 'text-gold-400' : 'text-white/30'}`}>
                  Pengguna
                </span>
              </button>
            );
          })()}

        </div>
      </div>
    </div>
  );
}
