import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from './components/Header';
import Hero from './components/Hero';
import CategoryLinks from './components/CategoryLinks';
import DestinationCard, { isLandscape } from './components/DestinationCard';
import ConversationalAI from './components/ConversationalAI';
import TripPlanner from './components/TripPlanner';
import InteractiveMap from './components/InteractiveMap';

import { Destination, Festival } from './types';
import { destinations, events, config } from './lib/api';
import { Sparkles, Calendar, Quote, Compass, Eye, Heart, MapPin, Brain, CalendarDays, Map, Sun, Utensils, Leaf, Sunset, RefreshCw, AlertCircle } from 'lucide-react';

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
  const [apiError, setApiError] = useState(false);

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
      setApiError(true);
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  // Persistent local favorites storage
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [hydrated, setHydrated] = useState(false);

      // Hydrate from localStorage after mount (avoids SSR/client mismatch)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('explore_jogja_saved_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedDestinations(parsed.map((item: any) => allDestinations.find(d => d.id === item.id)).filter(Boolean));
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

  const handleToggleSave = (dest: Destination) => {
    setSavedDestinations((prev) => {
      const exists = prev.some(d => d.id === dest.id);
      if (exists) {
        return prev.filter(d => d.id !== dest.id);
      } else {
        return [...prev, dest];
      }
    });
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
      <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center">
        <RefreshCw className="h-10 w-10 text-gold-500 animate-spin" />
      </div>
    );
  }

  return (
    <div id="explore-jogja-app-root" className="min-h-screen bg-[#faf9f6] flex flex-col justify-between">
      
      {/* Premium Header */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          if (tab === 'events') {
            setActiveTab('discover');
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
            setActiveTab('discover');
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
        isOverHero={activeTab === 'discover'}
      />

      {/* Main Core Content container */}
      <main id="main-content-layout" className="flex-1 pb-16">
        
        <>
            {/* Active Tab: Discover (Homepage) */}
            {activeTab === 'discover' && (
              <div className="space-y-4 animate-fade-in">
                {apiError && (
                  <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
                    <div className="rounded-3xl bg-amber-50 border border-amber-200/60 p-5 text-amber-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-sm">
                      <div className="flex items-start space-x-3.5">
                        <AlertCircle className="h-5.5 w-5.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-amber-950">Connection Issue Detected</h4>
                          <p className="text-xs text-amber-700/90 mt-1 leading-relaxed">
                            Could not connect to the backend server. If you are developing locally, please ensure the backend Go API server is running on port 8081. If you've deployed, verify your API base URL configuration.
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          setIsLoading(true);
                          setApiError(false);
                          Promise.all([
                            destinations.getAll(),
                            events.getAll(),
                            config.getQuotes(),
                          ]).then(([destRes, eventRes, quoteRes]) => {
                            if (destRes.status === 'success' && destRes.data) {
                              setAllDestinations(destRes.data as Destination[]);
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
                            console.error('Failed to load data on retry:', err);
                            setApiError(true);
                          }).finally(() => {
                            setIsLoading(false);
                          });
                        }}
                        className="text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200/80 px-4 py-2 rounded-xl border border-amber-300/60 transition-all cursor-pointer shrink-0 w-fit"
                      >
                        Retry Connection
                      </button>
                    </div>
                  </div>
                )}

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
                          : 'Trending Destinations'
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
                    <div className="text-center py-12 border border-dashed border-gold-200 rounded-3xl bg-white p-6">
                      <span className="block text-sm font-medium text-royal-950">No matches found for this category</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                      {displayDestinations.map((dest) => (
                        <DestinationCard
                          key={dest.id}
                          destination={dest}
                          onExplore={handleExploreDestination}
                          onToggleSave={handleToggleSave}
                          isSaved={isSaved(dest.id)}
                          className={isLandscape(dest.id) ? 'sm:col-span-2 lg:col-span-2' : 'sm:col-span-1 lg:col-span-1'}
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
                      <div className="flex items-end justify-between mb-5 border-b border-stone-200/50 pb-3">
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
                      <div className="flex items-end justify-between mb-5 border-b border-stone-200/50 pb-3">
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

                      <div className="grid grid-cols-2 gap-4 h-full">
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
                  <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-6 border-b border-stone-200/50 pb-4">
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
                    
                    {/* Step 1: Morning (Prambanan Temple) */}
                    {(() => {
                      const dest = allDestinations.find(d => d.id === 'prambanan') || allDestinations[0];
                      if (!dest) return null;
                      return (
                        <div 
                          onClick={() => handleExploreDestination(dest)}
                          className="flex-shrink-0 w-[275px] sm:w-[320px] lg:w-auto lg:flex-1 bg-[#FAF6F0] border border-stone-200/10 rounded-[24px] p-2.5 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF1E6] hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="flex flex-col items-center justify-center flex-shrink-0 w-24 sm:w-28 text-center px-1">
                            <div className="mb-2 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#B18A5E]">
                              <Sun className="h-4.5 w-4.5" />
                            </div>
                            <span className="text-xs font-bold text-[#1C1A17] tracking-tight leading-tight block">Morning</span>
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#B18A5E] mt-1 tracking-wide leading-none block">07.00 AM</span>
                          </div>
                          <div className="relative h-[80px] sm:h-[96px] w-[130px] sm:w-[155px] lg:w-[130px] xl:w-[160px] rounded-[16px] overflow-hidden flex-shrink-0 bg-stone-100">
                            <img src={dest.images[0]?.url || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-2 text-left">
                              <span className="text-[9px] sm:text-[10px] font-bold text-white block truncate leading-none">Prambanan Temple</span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Arrow Divider */}
                    <div className="flex-shrink-0 text-[#A78B71]/40 font-bold text-base sm:text-lg">&rarr;</div>

                    {/* Step 2: Lunch (Gudeg Yu Djum) */}
                    <div 
                      onClick={() => handleHeroSearch('kuliner tradisional gudeg yu djum')}
                      className="flex-shrink-0 w-[275px] sm:w-[320px] lg:w-auto lg:flex-1 bg-[#FAF6F0] border border-stone-200/10 rounded-[24px] p-2.5 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF1E6] hover:shadow-md transition-all duration-300 group"
                    >
                      <div className="flex flex-col items-center justify-center flex-shrink-0 w-24 sm:w-28 text-center px-1">
                        <div className="mb-2 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#5F713D]">
                          <Utensils className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-bold text-[#1C1A17] tracking-tight leading-tight block">Lunch</span>
                        <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#B18A5E] mt-1 tracking-wide leading-none block">12.00 PM</span>
                        <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium truncate mt-1 max-w-[85px] sm:max-w-[95px] leading-tight block">Gudeg Yu Djum</span>
                      </div>
                      <div className="relative h-[80px] sm:h-[96px] w-[130px] sm:w-[155px] lg:w-[130px] xl:w-[160px] rounded-[16px] overflow-hidden flex-shrink-0 bg-stone-100">
                        <img src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    </div>

                    {/* Arrow Divider */}
                    <div className="flex-shrink-0 text-[#A78B71]/40 font-bold text-base sm:text-lg">&rarr;</div>

                    {/* Step 3: Afternoon (Taman Sari) */}
                    {(() => {
                      const dest = allDestinations.find(d => d.id === 'tamansari') || allDestinations[3];
                      if (!dest) return null;
                      return (
                        <div 
                          onClick={() => handleExploreDestination(dest)}
                          className="flex-shrink-0 w-[275px] sm:w-[320px] lg:w-auto lg:flex-1 bg-[#FAF6F0] border border-stone-200/10 rounded-[24px] p-2.5 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF1E6] hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="flex flex-col items-center justify-center flex-shrink-0 w-24 sm:w-28 text-center px-1">
                            <div className="mb-2 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#4F6F52]">
                              <Leaf className="h-4 w-4" />
                            </div>
                            <span className="text-xs font-bold text-[#1C1A17] tracking-tight leading-tight block">Afternoon</span>
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#B18A5E] mt-1 tracking-wide leading-none block">02.30 PM</span>
                            <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium truncate mt-1 max-w-[85px] sm:max-w-[95px] leading-tight block">Taman Sari</span>
                          </div>
                          <div className="relative h-[80px] sm:h-[96px] w-[130px] sm:w-[155px] lg:w-[130px] xl:w-[160px] rounded-[16px] overflow-hidden flex-shrink-0 bg-stone-100">
                            <img src={dest.images[0]?.url || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        </div>
                      );
                    })()}

                    {/* Arrow Divider */}
                    <div className="flex-shrink-0 text-[#A78B71]/40 font-bold text-base sm:text-lg">&rarr;</div>

                    {/* Step 4: Sunset (Parangtritis Beach) */}
                    {(() => {
                      const dest = allDestinations.find(d => d.id === 'parangtritis') || allDestinations[1];
                      if (!dest) return null;
                      return (
                        <div 
                          onClick={() => handleExploreDestination(dest)}
                          className="flex-shrink-0 w-[275px] sm:w-[320px] lg:w-auto lg:flex-1 bg-[#FAF6F0] border border-stone-200/10 rounded-[24px] p-2.5 sm:p-3.5 flex items-center justify-between cursor-pointer hover:bg-[#FAF1E6] hover:shadow-md transition-all duration-300 group"
                        >
                          <div className="flex flex-col items-center justify-center flex-shrink-0 w-24 sm:w-28 text-center px-1">
                            <div className="mb-2 w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#BC6C25]">
                              <Sunset className="h-4.5 w-4.5" />
                            </div>
                            <span className="text-xs font-bold text-[#1C1A17] tracking-tight leading-tight block">Sunset</span>
                            <span className="text-[9px] sm:text-[10px] font-mono font-bold text-[#B18A5E] mt-1 tracking-wide leading-none block">05.30 PM</span>
                            <span className="text-[9px] sm:text-[10px] text-stone-500 font-medium truncate mt-1 max-w-[85px] sm:max-w-[95px] leading-tight block">Parangtritis Beach</span>
                          </div>
                          <div className="relative h-[80px] sm:h-[96px] w-[130px] sm:w-[155px] lg:w-[130px] xl:w-[160px] rounded-[16px] overflow-hidden flex-shrink-0 bg-stone-100">
                            <img src={dest.images[0]?.url || ''} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                        </div>
                      );
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

            {/* Active Tab: Interactive Map */}
            {activeTab === 'map' && (
              <InteractiveMap
                onExploreDestination={handleExploreDestination}
                selectedDestination={null}
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
                  <div className="text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-white p-6 max-w-md mx-auto">
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

      {/* Editorial polished footer */}
      <footer id="editorial-luxury-footer" className="bg-royal-950 text-white border-t border-royal-900 py-12 px-4 sm:px-6 lg:px-8 pb-28 md:pb-12">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="font-manrope text-gold-300 font-bold text-lg">Ψ</span>
              <span className="font-manrope font-bold text-sm tracking-[0.08em] uppercase text-white">Explore Yogyakarta</span>
            </div>
            <p className="text-[10px] text-gold-100/40 font-mono tracking-widest uppercase mt-1">
              AI Tourism Discovery & Ecosystem Gateway • Yogyakarta DIY
            </p>
          </div>

          <div className="text-[10px] font-mono text-gold-200/40 uppercase tracking-widest space-y-1">
            <p>© 2026 Explore Jogja Platform • DIY Tourism Department Ecosystem Partner</p>
            <p>Made with deep hospitality & Javanese cultural heritage</p>
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Bottom Tab Bar - Matches the layout and feel of the reference mobile device screen */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-royal-950/95 backdrop-blur-md border-t border-royal-900 px-4 py-2.5 flex justify-around items-center text-white">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex flex-col items-center justify-center space-y-0.5 ${
            activeTab === 'discover' ? 'text-gold-400 font-semibold' : 'text-white/60'
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
          onClick={() => setActiveTab('map')}
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
