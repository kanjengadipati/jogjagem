import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import Hero from './components/Hero';
import CategoryLinks from './components/CategoryLinks';
import DestinationCard, { isLandscape } from './components/DestinationCard';
import ConversationalAI from './components/ConversationalAI';
import TripPlanner from './components/TripPlanner';

import { Destination, Festival } from './types';
import { destinations, events, config, auth } from './lib/api';
import { Sparkles, Calendar, Quote, Compass, Eye, Heart, MapPin, Brain, CalendarDays, Map, Sun, Utensils, Leaf, Sunset, RefreshCw } from 'lucide-react';

export default function App() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('discover');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [conversationalQuery, setConversationalQuery] = useState<string>('');
  const [initialImageResult, setInitialImageResult] = useState<{
    imageUrl: string;
    reply: string;
    matchedDestinationIds: string[];
  } | null>(null);
  
   const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [allEvents, setAllEvents] = useState<Festival[]>([]);
  const [allQuotes, setAllQuotes] = useState<{ text: string; author: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
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
    // Check if user is logged in
    if (!auth.isLoggedIn()) {
      openAuth('login');
      return;
    }

    // Optimistic update
    setSavedDestinations((prev) => {
      const exists = prev.some(d => d.id === dest.id);
      const newSaved = exists ? prev.filter(d => d.id !== dest.id) : [...prev, dest];
      localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(newSaved));
      return newSaved;
    });

    // Sync with API
    try {
        const isSavedNow = !savedDestinations.some(d => d.id === dest.id);
        await auth.updateDestinationStatus(dest.id, isSavedNow ? 'saved' : 'removed');
    } catch (err) {
        console.error('Failed to sync save status', err);
    }
  };

  const isSaved = (id: string) => {
    return savedDestinations.some(d => d.id === id);
  };

  const handleHeroSearch = (query: string) => {
    setConversationalQuery(query);
    setActiveTab('ai-assistant');
  };

  const handleHeroImageSearch = (imageUrl: string, reply: string, matchedDestinationIds: string[]) => {
    setInitialImageResult({ imageUrl, reply, matchedDestinationIds });
    setActiveTab('ai-assistant');
  };

  const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleExploreDestination = (dest: Destination) => {
    router.push(`/destinations/${toSlug(dest.name)}`);
  };

  // Quick helper to choose random quote
  const [quoteIdx, setQuoteIdx] = useState(0);
  useEffect(() => {
    if (allQuotes.length > 0) {
      setQuoteIdx(Math.floor(Math.random() * allQuotes.length));
    }
  }, [activeTab, allQuotes]);

  const filteredDestinations = selectedCategory
    ? allDestinations.filter(d => d.category === selectedCategory)
    : allDestinations;

  const defaultSortedIds = ['prambanan', 'parangtritis', 'malioboro', 'tamansari', 'merapi', 'kalibiru', 'keraton', 'ratuboko', 'timang', 'tebingbreksi', 'pindul', 'pinusmangunan', 'goajomblang'];

  const displayDestinations = selectedCategory
    ? filteredDestinations
    : defaultSortedIds
        .map(id => allDestinations.find(d => d.id === id))
        .filter((d): d is Destination => d !== undefined);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div id="explore-jogja-app-root" className="min-h-screen bg-[#F7F3EE] flex flex-col justify-between">
      
      {/* Premium Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab === 'map') {
            router.push('/map');
          } else if (tab === 'events') {
            setActiveTab('discover-events');
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
            setActiveTab('discover-experiences');
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
            setActiveTab(tab);
          }
        }}
        savedCount={savedDestinations.length}
        onOpenAuth={openAuth}
      />

      {/* Main Core Content container */}
      <main id="main-content-layout" className="flex-1 pb-16">
        
        <>
            {/* Active Tab: Discover (Homepage) */}
            {(activeTab === 'discover' || activeTab.startsWith('discover-')) && (
              <div className="space-y-4 animate-fade-in">
                {/* Visual Fullscreen Hero Section */}
                <Hero
                  destinations={allDestinations}
                  onSearchSubmit={handleHeroSearch}
                  onImageSearchSubmit={handleHeroImageSearch}
                  onExploreDestination={handleExploreDestination}
                  onToggleSave={handleToggleSave}
                  isSaved={isSaved}
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
                        {selectedCategory ? 'CURATED COLLECTION' : 'LOCAL FAVORITES'}
                      </span>
                      <h2 className="font-manrope text-2xl sm:text-3xl font-bold tracking-tight text-royal-950">
                        {selectedCategory 
                          ? `Curated ${selectedCategory.replace('-', ' ')}` 
                          : 'Popular Destinations'
                        }
                      </h2>
                    </div>
                    <button 
                      onClick={() => router.push('/destinations')}
                      className="text-xs sm:text-sm font-semibold text-royal-700/80 hover:text-gold-600 transition-colors flex items-center space-x-0.5 border-b border-royal-700/10 hover:border-gold-600 pb-0.5 cursor-pointer"
                    >
                      <span>See all</span>
                      <span>&gt;</span>
                    </button>
                  </div>

                  {displayDestinations.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gold-200 rounded-3xl bg-[#FCFAF8] p-6">
                      <span className="block text-sm font-medium text-royal-950">No matches found for this category</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
                      {displayDestinations.map((dest) => (
                        <DestinationCard
                          key={dest.id}
                          destination={dest}
                          onExplore={handleExploreDestination}
                          onToggleSave={handleToggleSave}
                          isSaved={isSaved(dest.id)}
                          className={isLandscape(dest.id) ? 'col-span-2 lg:col-span-2' : 'col-span-1 lg:col-span-1'}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Two Column section matching high-fidelity mockup */}
                <section id="upcoming-festivals-showcase" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Upcoming Festivals (7/12) */}
                    <div className="lg:col-span-7 flex flex-col">
                      <div className="flex items-end justify-between mb-5 border-b border-[#E8E0D5] pb-3">
                        <div className="text-left">
                          <h2 className="font-manrope text-xl sm:text-2xl font-bold tracking-tight text-royal-950">
                            Upcoming Festivals
                          </h2>
                          <p className="text-xs text-stone-500/80 mt-0.5">Don't miss what's happening</p>
                        </div>
                        <button
                          onClick={() => router.push('/destinations')}
                          className="text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center space-x-0.5 cursor-pointer"
                        >
                          <span>See all</span>
                          <span>→</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {allEvents.slice(0, 3).map((fest, idx) => {
                          const badges = ["Limited", "Popular", "Live Tonight"];
                          const subBadge = ["Starts in 5 Days", "Starts in 18 Days", "Tonight • 7 PM"];
                          return (
                            <div
                              key={fest.id}
                              className="group relative aspect-[3/4] w-full overflow-hidden rounded-[24px] bg-royal-950 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-stone-200/10"
                            >
                              <img 
                                src={fest.image} 
                                alt={fest.name} 
                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                              
                              {/* Top Badge */}
                              <div className="absolute top-3.5 left-3.5 bg-red-600 border border-red-500/10 px-2.5 py-0.5 rounded-full text-[9px] font-sans font-semibold text-white uppercase tracking-[0.08em]">
                                {badges[idx] || fest.category.toUpperCase()}
                              </div>

                              {/* Heart button */}
                              <button className="absolute top-3.5 right-3.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-black/20 hover:bg-black/45 text-white backdrop-blur-sm border border-white/10">
                                <Heart className="h-3.5 w-3.5 text-white" />
                              </button>

                              {/* Text Overlay Details */}
                              <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end text-left">
                                {/* Sub badge time */}
                                <span className="text-[9px] font-sans font-semibold text-gold-400 mb-1 tracking-[0.08em] uppercase">
                                  {subBadge[idx] || "Upcoming"}
                                </span>
                                
                                <h3 className="font-manrope text-sm font-bold tracking-tight text-white leading-tight mb-2 group-hover:text-gold-300 transition-colors">
                                  {fest.name}
                                </h3>
                                
                                <p className="text-[10px] text-white/60 font-light">
                                  {fest.date} • {fest.location}
                                </p>

                                {/* Circle Arrow in Bottom Right */}
                                <div className="absolute bottom-4 right-4 h-6.5 w-6.5 rounded-full bg-gold-400 text-royal-950 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300">
                                  <svg className="h-3 w-3 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Column: AI Picks Just For You (5/12) */}
                    <div className="lg:col-span-5 flex flex-col">
                      <div className="flex items-end justify-between mb-5 border-b border-[#E8E0D5] pb-3">
                        <div className="text-left">
                          <h2 className="font-manrope text-xl sm:text-2xl font-bold tracking-tight text-royal-950">
                            AI Picks Just for You
                          </h2>
                          <p className="text-xs text-stone-500/80 mt-0.5">Personalized for today's vibes</p>
                        </div>
                        <button
                          onClick={() => router.push('/destinations')}
                          className="text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center space-x-0.5 cursor-pointer"
                        >
                          <span>See all</span>
                          <span>→</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Card 1: Merapi Sunrise Jeep Tour */}
                        {(() => {
                          const dest = allDestinations.find(d => d.id === 'merapi') || allDestinations[0];
                          if (!dest) return null;
                          return (
                            <div
                              onClick={() => handleExploreDestination(dest)}
                              className="group relative h-full min-h-[220px] lg:min-h-0 w-full overflow-hidden rounded-[24px] bg-royal-950 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-stone-200/10"
                            >
                              <img 
                                src={dest.images[0]?.url || ''} 
                                alt={dest.name} 
                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                              
                              {/* Top Badge */}
                              <div className="absolute top-3.5 left-3.5 bg-amber-500 border border-amber-400/10 px-2.5 py-0.5 rounded-full text-[9px] font-sans font-semibold text-white uppercase tracking-[0.08em]">
                                AI Pick Today
                              </div>
 
                              {/* Heart button */}
                              <button className="absolute top-3.5 right-3.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-black/20 hover:bg-black/45 text-white backdrop-blur-sm border border-white/10">
                                <Heart className="h-3.5 w-3.5 text-white" />
                              </button>
 
                              {/* Text Overlay Details */}
                              <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end text-left">
                                <h3 className="font-manrope text-sm font-bold tracking-tight text-white leading-tight mb-2.5 group-hover:text-gold-300 transition-colors">
                                  {dest.name}
                                </h3>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[10px] font-mono text-gold-400 font-bold">★ 4.8</span>
                                    <span className="text-[9px] font-mono font-bold text-white/50 bg-white/10 px-1.5 py-0.5 rounded">Low Crowd</span>
                                  </div>
                                  <div className="h-6.5 w-6.5 rounded-full bg-gold-400 text-royal-950 flex items-center justify-center shadow-md group-hover:bg-gold-300 transition-colors">
                                    <svg className="h-3.5 w-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3">
                                      <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
 
                        {/* Card 2: Jomblang Cave */}
                        {(() => {
                          const dest = allDestinations.find(d => d.id === 'goajomblang') || allDestinations[1];
                          if (!dest) return null;
                          return (
                            <div
                              onClick={() => handleExploreDestination(dest)}
                              className="group relative h-full min-h-[220px] lg:min-h-0 w-full overflow-hidden rounded-[24px] bg-royal-950 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer border border-stone-200/10"
                            >
                              <img 
                                src={dest.images[0]?.url || ''} 
                                alt={dest.name} 
                                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-108" 
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />
                              
                              {/* Top Badge */}
                              <div className="absolute top-3.5 left-3.5 bg-emerald-600 border border-emerald-500/10 px-2.5 py-0.5 rounded-full text-[9px] font-sans font-semibold text-white uppercase tracking-[0.08em]">
                                Hidden Gem
                              </div>
 
                              {/* Heart button */}
                              <button className="absolute top-3.5 right-3.5 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-black/20 hover:bg-black/45 text-white backdrop-blur-sm border border-white/10">
                                <Heart className="h-3.5 w-3.5 text-white" />
                              </button>
 
                              {/* Text Overlay Details */}
                              <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col justify-end text-left">
                                <h3 className="font-manrope text-sm font-bold tracking-tight text-white leading-tight mb-2.5 group-hover:text-gold-300 transition-colors">
                                  {dest.name}
                                </h3>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="text-[10px] font-mono text-gold-400 font-bold">★ 4.9</span>
                                    <span className="text-[9px] font-mono font-bold text-white/50 bg-white/10 px-1.5 py-0.5 rounded">Heavenly Light</span>
                                  </div>
                                  <div className="h-6.5 w-6.5 rounded-full bg-gold-400 text-royal-950 flex items-center justify-center shadow-md group-hover:bg-gold-300 transition-colors">
                                    <svg className="h-3.5 w-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3">
                                      <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                  </div>
                </section>

                  {/* AI Suggested Journey Section */}
                  <section id="ai-suggested-journey-timeline" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 border-b border-[#E8E0D5] pb-4">
                    <div className="text-left">
                      <h2 className="font-manrope text-xl sm:text-2xl font-bold tracking-tight text-royal-950">
                        AI Suggested Journey
                      </h2>
                      <p className="text-xs text-stone-500/80 mt-0.5">One perfect day in Jogja</p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('planner')}
                      className="mt-2 sm:mt-0 text-xs font-semibold text-gold-700 hover:text-gold-900 flex items-center space-x-0.5 border-b border-gold-700/10 hover:border-gold-900 pb-0.5 cursor-pointer w-fit"
                    >
                      <span>Customize with AI</span>
                      <span>→</span>
                    </button>
                  </div>

                  {/* Timeline Cards Row */}
                  <div className="flex items-center space-x-2.5 sm:space-x-3.5 overflow-x-auto pb-4 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0">
                    {(() => {
                      const journeySlots = [
                        { label: 'Morning', time: '07.00 AM', icon: Sun, color: '#B18A5E', categories: ['heritage', 'adventure'] },
                        { label: 'Lunch', time: '12.00 PM', icon: Utensils, color: '#5F713D', categories: ['culinary'] },
                        { label: 'Afternoon', time: '02.30 PM', icon: Leaf, color: '#4F6F52', categories: ['nature', 'heritage', 'hidden-gem'] },
                        { label: 'Sunset', time: '05.30 PM', icon: Sunset, color: '#BC6C25', categories: ['beach', 'nature'] },
                      ];

                      return journeySlots.map((slot, idx) => {
                        const dest = allDestinations
                          .filter(d => slot.categories.includes(d.category) && d.images.length > 0)
                          .sort((a, b) => b.rating - a.rating)[0];
                        if (!dest) return null;
                        const Icon = slot.icon;
                        return (
                          <React.Fragment key={slot.label}>
                            {idx > 0 && <div className="flex-shrink-0 text-[#A78B71]/40 font-bold text-base sm:text-lg">&rarr;</div>}
                            <div 
                              onClick={() => handleExploreDestination(dest)}
                              className="flex-shrink-0 w-[275px] sm:w-[320px] lg:w-auto lg:flex-1 bg-[#F7F3EE] border border-stone-200/10 rounded-[24px] p-2.5 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF1E6] hover:shadow-md transition-all duration-300 group"
                            >
                              <div className="flex flex-col items-center justify-center flex-shrink-0 w-24 sm:w-28 text-center px-1">
                                <div className="mb-2 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center" style={{ color: slot.color }}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-[#1C1A17] tracking-tight leading-tight block">{slot.label}</span>
                                <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#B18A5E] mt-1 tracking-wide leading-none block">{slot.time}</span>
                                <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium truncate mt-1 max-w-[85px] sm:max-w-[95px] leading-tight block">{dest.name}</span>
                              </div>
                              <div className="relative h-[80px] sm:h-[96px] w-[130px] sm:w-[155px] lg:w-[130px] xl:w-[160px] rounded-[16px] overflow-hidden flex-shrink-0 bg-stone-100">
                                <img src={dest.images[0]?.url || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt={dest.name} />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 text-left">
                                  <span className="text-[9px] sm:text-[10px] font-bold text-white block truncate leading-none">{dest.name}</span>
                                </div>
                              </div>
                            </div>
                          </React.Fragment>
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
            )}

            {/* Active Tab: Events */}
            {activeTab === 'events' && (
              <section id="events-tab-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="flex flex-col space-y-1 mb-8 border-b border-stone-200 pb-5">
                  <div className="flex items-center space-x-2.5">
                    <Calendar className="h-5 w-5 text-gold-600" />
                    <h2 className="font-manrope text-2xl font-bold text-royal-950">Upcoming Events</h2>
                  </div>
                  <p className="text-sm text-royal-700/70 font-light">Festivals, cultural shows, and seasonal highlights in Yogyakarta.</p>
                </div>
                {allEvents.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-[#FCFAF8] p-6 max-w-md mx-auto">
                    <Calendar className="h-10 w-10 text-gold-400 mx-auto mb-3" />
                    <h3 className="font-manrope text-base font-bold text-royal-950">No Events Found</h3>
                    <p className="text-xs text-royal-700/60 font-light mt-1 max-w-xs mx-auto">Check back soon for upcoming festivals and events.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {allEvents.map((evt) => (
                      <div key={evt.id} className="group rounded-3xl overflow-hidden bg-white border border-[#E8E0D5] shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer">
                        <div className="relative h-44 overflow-hidden bg-stone-100">
                          {evt.image ? (
                            <img src={evt.image} alt={evt.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" referrerPolicy="no-referrer" />
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
              </section>
            )}

            {/* Active Tab: Experiences */}
            {activeTab === 'experiences' && (
              <section id="experiences-tab-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="flex flex-col space-y-1 mb-8 border-b border-stone-200 pb-5">
                  <div className="flex items-center space-x-2.5">
                    <Sparkles className="h-5 w-5 text-gold-600" />
                    <h2 className="font-manrope text-2xl font-bold text-royal-950">Experiences</h2>
                  </div>
                  <p className="text-sm text-royal-700/70 font-light">Adventure, nature, and hidden gems across Yogyakarta.</p>
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
                        isSaved={isSaved(dest.id)}
                      />
                    ))
                  }
                  {allDestinations.filter(d => ['adventure', 'nature', 'hidden-gem', 'beach'].includes(d.category?.toLowerCase())).length === 0 && (
                    <div className="col-span-full text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-[#FCFAF8] p-6">
                      <Leaf className="h-10 w-10 text-gold-400 mx-auto mb-3" />
                      <h3 className="font-manrope text-base font-bold text-royal-950">Loading Experiences...</h3>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Active Tab: AI Assistant (Conversational Local Advisor) */}
            {activeTab === 'ai-assistant' && (
              <ConversationalAI
                initialQuery={conversationalQuery}
                initialImageResult={initialImageResult}
                onClearImageResult={() => setInitialImageResult(null)}
                onExploreDestination={handleExploreDestination}
                onToggleSave={handleToggleSave}
                isSaved={isSaved}
              />
            )}

            {/* Active Tab: Trip Planner */}
            {activeTab === 'planner' && (
              <TripPlanner
                savedDestinations={savedDestinations}
                onExploreDestination={handleExploreDestination}
                onRemoveFromSaved={handleToggleSave}
              />
            )}

            {/* Active Tab: Saved Favorites Drawer */}
            {activeTab === 'saved' && (
              <section id="saved-bookmarks-dashboard" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
                <div className="flex flex-col space-y-2 mb-8 border-b border-gold-100 pb-5">
                  <div className="flex items-center space-x-2.5">
                    <Heart className="h-5 w-5 fill-gold-600 text-gold-600 animate-pulse" />
                    <h2 className="font-manrope text-2xl font-bold text-royal-950">Your Bookmarked Discoveries</h2>
                  </div>
                  <p className="text-sm text-royal-700/80 font-light">
                    Your customized offline-saved library. You can immediately allocate these favorited sights into your Trip Planner slots.
                  </p>
                </div>

                {savedDestinations.length === 0 ? (
                  <div className="text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-[#FCFAF8] p-6 max-w-md mx-auto">
                    <Compass className="h-10 w-10 text-gold-500 mx-auto mb-3 animate-spin" />
                    <h3 className="font-manrope text-base font-bold text-royal-950">No Saved Places</h3>
                    <p className="text-xs text-royal-700/60 font-light mt-1 max-w-xs mx-auto">
                      Whenever you explore Yogyakarta destinations, click the heart icon to persist them securely inside this dashboard.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {savedDestinations.map((dest) => (
                      <DestinationCard
                        key={dest.id}
                        destination={dest}
                        onExplore={handleExploreDestination}
                        onToggleSave={handleToggleSave}
                        isSaved={isSaved(dest.id)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}
        </>
      </main>
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />

      {/* Editorial polished footer */}
      <footer id="editorial-luxury-footer" className="bg-royal-950 text-white border-t border-royal-900 py-12 px-4 sm:px-6 lg:px-8 pb-28 md:pb-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <img src="/logo-gold-new.png" alt="Jogjagem" className="h-6 w-auto" />
              <span className="font-manrope font-bold text-sm tracking-[0.08em] uppercase text-white">Jogjagem</span>
            </div>
            <p className="text-[10px] text-gold-100/40 font-mono tracking-widest uppercase mt-1">
              AI Tourism Discovery & Hidden Gems in Yogyakarta
            </p>
          </div>

          <div className="text-[10px] font-mono text-gold-200/40 uppercase tracking-widest space-y-1">
            <p>© 2026 Jogjagem Platform</p>
            <p>Made with deep hospitality & Javanese cultural heritage</p>
            <p>Build by Giwangan Studio • 085111221044</p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Tab Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-royal-950/95 backdrop-blur-md border-t border-royal-900 px-4 pt-2.5 pb-[calc(10px+env(safe-area-inset-bottom,0px))] flex justify-around items-center text-white">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            ['discover','events','experiences'].includes(activeTab) ? 'text-gold-400 font-semibold' : 'text-white/60'
          }`}
        >
          <Compass className="h-5 w-5" />
          <span className="text-[10px]">Explore</span>
        </button>

        <button
          onClick={() => setActiveTab('ai-assistant')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeTab === 'ai-assistant' ? 'text-gold-400 font-semibold' : 'text-white/60'
          }`}
        >
          <Brain className="h-5 w-5" />
          <span className="text-[10px]">AI Assistant</span>
        </button>

        <button
          onClick={() => setActiveTab('planner')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeTab === 'planner' ? 'text-gold-400 font-semibold' : 'text-white/60'
          }`}
        >
          <CalendarDays className="h-5 w-5" />
          <span className="text-[10px]">Planner</span>
        </button>

        <button
          onClick={() => router.push('/map')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeTab === 'map' ? 'text-gold-400 font-semibold' : 'text-white/60'
          }`}
        >
          <Map className="h-5 w-5" />
          <span className="text-[10px]">Map</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`flex flex-col items-center justify-center space-y-0.5 relative ${
            activeTab === 'saved' ? 'text-gold-400 font-semibold' : 'text-white/60'
          }`}
        >
          <Heart className={`h-5 w-5 ${savedDestinations.length > 0 ? 'fill-gold-400 text-gold-400' : ''}`} />
          {savedDestinations.length > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold-500 text-[8px] font-bold text-white">
              {savedDestinations.length}
            </span>
          )}
          <span className="text-[10px]">Saved</span>
        </button>
      </div>
    </div>
  );
}
