'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import Header from '@/components/Header';
import DestinationCard, { isLandscape } from '@/components/DestinationCard';
import CategoryLinks from '@/components/CategoryLinks';
import { Destination } from '@/types';
import { destinations as destinationApi } from '@/lib/api';
import { Search, ArrowLeft } from 'lucide-react';

function mapApiToDestination(raw: Record<string, unknown>): Destination {
  return {
    id: (raw.id || raw.ExternalID || '') as string,
    name: (raw.name || raw.Name || '') as string,
    tagline: (raw.tagline || raw.Tagline || '') as string,
    category: (raw.category || raw.Category || '') as string,
    location: (raw.location || raw.Location || '') as string,
    subRegion: (raw.sub_region || raw.SubRegion || raw.subRegion || '') as string,
    images: (raw.images || raw.Images || []) as Destination['images'],
    rating: (raw.rating || raw.Rating || 0) as number,
    reviewCount: (raw.review_count || raw.ReviewCount || raw.reviewCount || 0) as number,
    description: (raw.description || raw.Description || '') as string,
    story: (raw.story || raw.Story || '') as string,
    ticketPrice: (raw.ticket_price || raw.TicketPrice || raw.ticketPrice || '') as string,
    openingHours: (raw.opening_hours || raw.OpeningHours || raw.openingHours || '') as string,
    facilities: (raw.facilities || raw.Facilities || []) as string[],
    travelTips: (raw.travel_tips || raw.TravelTips || raw.travelTips || []) as string[],
    bestTime: (raw.best_time || raw.BestTime || raw.bestTime || '') as string,
    weather: (raw.weather || raw.Weather || { temp: '', condition: '', status: '' }) as Destination['weather'],
    latitude: (raw.latitude || raw.Latitude || 0) as number,
    longitude: (raw.longitude || raw.Longitude || 0) as number,
    reviews: (raw.reviews || raw.Reviews || []) as Destination['reviews'],
    partners: (raw.partners || raw.Partners || []) as Destination['partners'],
    faqs: (raw.faqs || raw.Faqs || raw.FAQs || []) as Destination['faqs'],
    googleMapsUrl: (raw.google_maps_url || raw.GoogleMapsURL || raw.googleMapsUrl || '') as string,
    googleReviewCount: (raw.google_review_count || raw.GoogleReviewCount || raw.googleReviewCount || 0) as number,
  };
}

function DestinationsPageInner() {
  const router = useRouter();
  const { t } = useLocale();
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [displayCount, setDisplayCount] = useState(20);
  const [hydrated, setHydrated] = useState(false);

  // Intersection Observer to detect scroll to bottom
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setDisplayCount(prev => prev + 20);
      }
    }, { threshold: 0.1 });

    const footer = document.querySelector('footer');
    if (footer) observer.observe(footer);

    return () => {
      if (footer) observer.unobserve(footer);
    };
  }, []);

  useEffect(() => {
    async function fetchDestinations() {
      setIsLoading(true);
      try {
        const response = await destinationApi.getAll();
        // Assuming response is { status: 'success', data: Destination[] } or similar structure based on API
        // Adjust according to the actual API response structure if needed
        const data = (response as any).data || (response as any);
        setAllDestinations(Array.isArray(data) ? data.map(mapApiToDestination) : []);
      } catch (e) {
        console.error("Failed to fetch destinations:", e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDestinations();

    try {
      const saved = localStorage.getItem('explore_jogja_saved_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        // We'll need to re-fetch/filter saved destinations after allDestinations is loaded
        setSavedDestinations(parsed);
      }
    } catch (e) {
      console.error("Local storage read failed:", e);
    }
    setHydrated(true);
  }, []);

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
      if (exists) return prev.filter(d => d.id !== dest.id);
      return [...prev, dest];
    });
  };

  const isSaved = (id: string) => savedDestinations.some(d => d.id === id);

  const toSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleExploreDestination = (dest: Destination) => {
    router.push(`/destinations/${toSlug(dest.name)}`);
  };

  const filteredDestinations = allDestinations.filter((dest) => {
    const matchesCategory = selectedCategory ? dest.category === selectedCategory : true;
    const matchesSearch = searchQuery
      ? dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const resultCount = filteredDestinations.length;
  const totalDestinations = allDestinations.length;

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <Header
        activeTab="discover"
        setActiveTab={() => router.push('/')}
        savedCount={savedDestinations.length}
        isOverHero={false}
      />

      <main className="flex-1">
          {/* Page Header */}
          <section className="bg-royal-950 pt-28 pb-12 sm:pt-32 sm:pb-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-1.5 text-gold-400/80 hover:text-gold-300 transition-colors mb-6 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm font-medium">{t('destinations_page.back_to_explore')}</span>
              </button>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-gold-400 font-semibold mb-1 block">
                    {t('destinations_page.all_destinations')}
                  </span>
                  <h1 className="font-manrope text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    {t('destinations_page.heading')}
                  </h1>
                  <p className="text-sm text-white/60 mt-2">
                    {totalDestinations} {t('destinations_page.subtitle')}
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('destinations_page.search_placeholder')}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold-400/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Category Filter */}
          <CategoryLinks
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Results Info */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
            <p className="text-xs text-stone-500">
              {resultCount === totalDestinations
                ? `Showing all ${totalDestinations} destinations`
                : `${resultCount} destination${resultCount !== 1 ? 's' : ''} found`}
            </p>
          </div>

           {/* Destinations Grid */}
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-20 text-stone-500">{t('destinations_page.loading')}</div>
            ) : filteredDestinations.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-white">
                <Search className="h-10 w-10 text-gold-300 mx-auto mb-4" />
                <span className="block text-base font-semibold text-royal-950 mb-1">{t('destinations_page.not_found')}</span>
                <span className="block text-sm text-stone-500">{t('destinations_page.try_different')}</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filteredDestinations.slice(0, displayCount).map((dest) => (
                  <DestinationCard
                    key={dest.id}
                    destination={dest}
                    onExplore={handleExploreDestination}
                    onToggleSave={handleToggleSave}
                    isSaved={isSaved(dest.id)}
                    className={isLandscape(dest.id) ? 'sm:col-span-2' : ''}
                  />
                ))}
              </div>
            )}
          </section>

        </main>

      {/* Footer */}
      <footer className="bg-royal-950 text-white border-t border-royal-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <img src="/logo-gold-new.png" alt="Jogjagem" className="h-6 w-auto" />
              <span className="font-manrope font-bold text-sm tracking-[0.08em] uppercase text-white">Jogjagem</span>
            </div>
            <p className="text-[10px] text-gold-100/40 font-mono tracking-widest uppercase mt-1">
              {t('footer.tagline')}
            </p>
          </div>

          <div className="text-[10px] font-mono text-gold-200/40 uppercase tracking-widest space-y-1">
            <p>{t('footer.copyright')}</p>
            <p>{t('footer.made_with')}</p>
            <p>{t('footer.build_by')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function DestinationsPage() {
  return (
    <AuthProvider>
      <DestinationsPageInner />
    </AuthProvider>
  );
}
