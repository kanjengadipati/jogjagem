'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import Header from '@/components/Header';
import DestinationCard from '@/components/DestinationCard';
import { DestinationCardSkeleton, TrendingCardSkeleton } from '@/components/CardSkeleton';
import CategoryLinks from '@/components/CategoryLinks';
import { Destination } from '@/types';
import { destinations as destinationApi, ai } from '@/lib/api';
import Image from 'next/image';
import {
  Search, ArrowLeft, ChevronLeft, ChevronRight,
  Star, SlidersHorizontal, X, MapPin, Sparkles,
  Flame,
} from 'lucide-react';

type TrendingItem = {
  type: 'destination' | 'event';
  id: string;
  badge: string;
  headline: string;
  reason: string;
  imageUrl: string;
  rating: number;
  location: string;
};

type ActiveFilter = {
  minRating: number | null;
  free: boolean;
  openNow: boolean;
  familyFriendly: boolean;
  petFriendly: boolean;
  outdoor: boolean;
};

const BADGE_COLOR: Record<string, string> = {
  Trending:         'bg-red-600',
  'Hidden Gem':     'bg-teal-600',
  Populer:          'bg-purple-600',
  'Akan Datang':    'bg-indigo-600',
  'Hari Ini':       'bg-amber-600',
  Weekend:          'bg-blue-600',
  Festival:         'bg-fuchsia-700',
  Nature:           'bg-green-700',
  Beach:            'bg-sky-600',
  Heritage:         'bg-amber-700',
};

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
    badge: (raw.badge || raw.Badge || '') as string,
    badges: (raw.badges || raw.Badges || []) as string[],
  };
}

function TrendingCarousel({
  items, destinations, isLoading, onNavigate,
}: {
  items: TrendingItem[];
  destinations: Destination[];
  isLoading: boolean;
  onNavigate: (item: TrendingItem) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 200 : -200, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scrollbar-none pb-1 scroll-smooth"
      >
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => <TrendingCardSkeleton key={i} />)
          : items.map((item, idx) => {
              const badgeBg = BADGE_COLOR[item.badge] ?? 'bg-gold-500';
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => onNavigate(item)}
                  className="shrink-0 w-[130px] sm:w-[160px] rounded-2xl overflow-hidden bg-white/5 border border-white/10 text-left hover:border-gold-400/40 active:scale-95 transition-all duration-200 cursor-pointer"
                >
                  <div className="relative h-[80px] sm:h-[96px] overflow-hidden">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.headline}
                        fill
                        sizes="160px"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-royal-950 text-[9px] font-black leading-none shadow-lg">
                      {idx + 1}
                    </span>
                    <span className={`absolute top-2 left-8 ${badgeBg} text-white text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full`}>
                      {item.badge}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-bold text-white leading-tight line-clamp-2 mb-1">{item.headline}</p>
                    <div className="flex items-center gap-1.5">
                      {item.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-gold-400 font-semibold">
                          <Star className="h-2.5 w-2.5 fill-gold-400" />{item.rating.toFixed(1)}
                        </span>
                      )}
                      {item.location && (
                        <span className="text-[9px] text-white/50 truncate">{item.location}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
      </div>
      {!isLoading && items.length > 4 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

function FilterChips({
  filters,
  onChange,
  onClear,
}: {
  filters: ActiveFilter;
  onChange: (f: Partial<ActiveFilter>) => void;
  onClear: () => void;
}) {
  const anyActive =
    filters.minRating !== null ||
    filters.free ||
    filters.openNow ||
    filters.familyFriendly ||
    filters.petFriendly ||
    filters.outdoor;

  const chipBase = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap';
  const chipOn  = 'bg-gold-500 border-gold-400 text-royal-950';
  const chipOff = 'bg-white border-stone-200 text-stone-700 hover:border-gold-400/60 hover:text-stone-900';

  const ratingOptions = [4, 4.5, 5];

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
      {ratingOptions.map((r) => (
        <button
          key={r}
          onClick={() => onChange({ minRating: filters.minRating === r ? null : r })}
          className={`${chipBase} ${filters.minRating === r ? chipOn : chipOff}`}
        >
          <Star className={`h-3 w-3 ${filters.minRating === r ? 'fill-royal-950 text-royal-950' : 'fill-gold-500 text-gold-500'}`} />
          {r}+
        </button>
      ))}

      <button
        onClick={() => onChange({ free: !filters.free })}
        className={`${chipBase} ${filters.free ? chipOn : chipOff}`}
      >
        Gratis
      </button>

      <button
        onClick={() => onChange({ openNow: !filters.openNow })}
        className={`${chipBase} ${filters.openNow ? chipOn : chipOff}`}
      >
        Buka Sekarang
      </button>

      <button
        onClick={() => onChange({ familyFriendly: !filters.familyFriendly })}
        className={`${chipBase} ${filters.familyFriendly ? chipOn : chipOff}`}
      >
        Family Friendly
      </button>

      <button
        onClick={() => onChange({ petFriendly: !filters.petFriendly })}
        className={`${chipBase} ${filters.petFriendly ? chipOn : chipOff}`}
      >
        Pet Friendly
      </button>

      <button
        onClick={() => onChange({ outdoor: !filters.outdoor })}
        className={`${chipBase} ${filters.outdoor ? chipOn : chipOff}`}
      >
        Outdoor
      </button>

      {anyActive && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition-all shrink-0"
        >
          <X className="h-3 w-3" />
          Bersihkan Filter
        </button>
      )}
    </div>
  );
}

function DestinationsPageInner() {
  const router = useRouter();
  const { t } = useLocale();

  const [allDestinations, setAllDestinations]     = useState<Destination[]>([]);
  const [isLoading, setIsLoading]                 = useState(true);
  const [selectedCategory, setSelectedCategory]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery]             = useState('');
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const savedIdsRef = useRef<Set<string>>(new Set());
  const [hydrated, setHydrated]                   = useState(false);
  const [page, setPage]                           = useState(1);
  const [totalPages, setTotalPages]               = useState(1);
  const [loadingMore, setLoadingMore]             = useState(false);

  const [trendingItems, setTrendingItems]   = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const [activeFilters, setActiveFilters] = useState<ActiveFilter>({
    minRating: null,
    free: false,
    openNow: false,
    familyFriendly: false,
    petFriendly: false,
    outdoor: false,
  });

  const clearFilters = () =>
    setActiveFilters({ minRating: null, free: false, openNow: false, familyFriendly: false, petFriendly: false, outdoor: false });

  useEffect(() => {
    try {
      const saved = localStorage.getItem('explore_jogja_saved_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedDestinations(parsed);
        savedIdsRef.current = new Set(parsed.map((d: Destination) => d.id));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(savedDestinations)); } catch {}
  }, [savedDestinations, hydrated]);

  const handleToggleSave = useCallback((dest: Destination) =>
    setSavedDestinations(prev => {
      const next = prev.some(d => d.id === dest.id)
        ? prev.filter(d => d.id !== dest.id)
        : [...prev, dest];
      savedIdsRef.current = new Set(next.map(d => d.id));
      return next;
    }), []);

  const isSaved = useCallback((id: string) => savedIdsRef.current.has(id), []);
  const toSlug  = useCallback((name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''), []);
  const handleExplore = useCallback((dest: Destination) => router.push(`/destinations/${toSlug(dest.name)}`), [toSlug]);

  useEffect(() => {
    let cancelled = false;
    setTrendingLoading(true);
    ai.trending()
      .then(res => {
        if (cancelled) return;
        if (res.status === 'success' && res.data?.items?.length) {
          setTrendingItems(res.data.items as TrendingItem[]);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setTrendingLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const loadNextPage = async () => {
    if (selectedCategory || loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await destinationApi.getAll({ limit: 15, page: nextPage });
      const data = (response as any).data || (response as any);
      if (Array.isArray(data)) {
        setAllDestinations(prev => [...prev, ...data.map(mapApiToDestination)]);
      }
      setPage(nextPage);
      const meta = (response as any).meta;
      if (meta) setTotalPages(meta.total_pages ?? 1);
    } catch (e) { console.error('Failed to load more:', e); }
    finally { setLoadingMore(false); }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadNextPage(); },
      { threshold: 0.1 }
    );
    const footer = document.querySelector('footer');
    if (footer) observer.observe(footer);
    return () => { if (footer) observer.unobserve(footer); };
  }, [selectedCategory, page, totalPages, loadingMore]);

  useEffect(() => {
    async function loadInitial() {
      setIsLoading(true);
      try {
        if (selectedCategory) {
          const response = await destinationApi.getByCategory(selectedCategory);
          const data = (response as any).data || (response as any);
          setAllDestinations(Array.isArray(data) ? data.map(mapApiToDestination) : []);
          setPage(1); setTotalPages(1);
        } else {
          const response = await destinationApi.getAll({ limit: 15, page: 1 });
          const data = (response as any).data || (response as any);
          setAllDestinations(Array.isArray(data) ? data.map(mapApiToDestination) : []);
          const meta = (response as any).meta;
          if (meta) { setPage(meta.page ?? 1); setTotalPages(meta.total_pages ?? 1); }
          else { setPage(1); setTotalPages(1); }
        }
      } catch (e) { console.error('Failed to fetch destinations:', e); }
      finally { setIsLoading(false); }
    }
    loadInitial();
  }, [selectedCategory]);

  const handleTrendingNavigate = (item: TrendingItem) => {
    if (item.type === 'destination') router.push(`/destinations/${item.id}`);
    else router.push(`/events/${item.id}`);
  };

  const filteredDestinations = useMemo(() => allDestinations.filter(dest => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        dest.name.toLowerCase().includes(q) ||
        dest.tagline.toLowerCase().includes(q) ||
        dest.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (activeFilters.minRating !== null && dest.rating < activeFilters.minRating) return false;
    if (activeFilters.free && dest.ticketPrice && dest.ticketPrice !== '0' && dest.ticketPrice.toLowerCase() !== 'gratis') return false;
    if (activeFilters.outdoor) {
      const outdoorCats = ['nature', 'adventure', 'beach'];
      if (!outdoorCats.includes(dest.category?.toLowerCase())) return false;
    }
    if (activeFilters.familyFriendly) {
      const cat = dest.category?.toLowerCase();
      if (!['family', 'culinary', 'heritage'].includes(cat)) return false;
    }
    return true;
  }), [allDestinations, searchQuery, activeFilters]);

  const anyFilterActive =
    activeFilters.minRating !== null ||
    activeFilters.free ||
    activeFilters.openNow ||
    activeFilters.familyFriendly ||
    activeFilters.petFriendly ||
    activeFilters.outdoor;

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <Header
        activeTab="discover"
        setActiveTab={() => router.push('/')}
        savedCount={savedDestinations.length}
        isOverHero={false}
      />

      <main className="flex-1">
        <section className="relative bg-royal-950 pt-20 pb-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(214,161,71,0.08)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(214,161,71,0.05)_0%,_transparent_60%)]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-1.5 text-gold-400/70 hover:text-gold-300 transition-colors mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">{t('destinations_page.back_to_explore')}</span>
            </button>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-gold-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                    {t('destinations_page.all_destinations')}
                  </span>
                </div>
                <h1 className="font-manrope text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                  {t('destinations_page.heading')}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-white/50 font-light max-w-lg">
                  {t('destinations_page.subtitle_prefix', { count: allDestinations.length || '90+' })}
                  {!t('destinations_page.subtitle_prefix') &&
                    `Temukan ${allDestinations.length || '90+'} destinasi terkurasi di seluruh Yogyakarta.`}
                </p>
              </div>

              <div className="relative w-full lg:w-[420px] shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={t('destinations_page.search_placeholder') || 'Cari destinasi, aktivitas, atau pengalaman...'}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/6 border border-white/12 rounded-2xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-gold-400/50 focus:bg-white/10 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            {(trendingLoading || trendingItems.length > 0) && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Sedang Trending</span>
                  <div className="flex-1 h-px bg-white/10" />
                  {!trendingLoading && (
                    <>
                      <button className="h-7 w-7 flex items-center justify-center rounded-full border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all">
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </button>
                      <button className="h-7 w-7 flex items-center justify-center rounded-full border border-white/15 text-white/50 hover:text-white hover:border-white/30 transition-all">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <TrendingCarousel
                  items={trendingItems}
                  destinations={allDestinations}
                  isLoading={trendingLoading}
                  onNavigate={handleTrendingNavigate}
                />
              </div>
            )}
          </div>

          <div className="border-t border-white/8 mt-2">
            <CategoryLinks
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              dark
            />
          </div>
        </section>

        <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-stone-300 text-stone-700 hover:border-gold-400/60 hover:text-stone-900 transition-all shrink-0 bg-white">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
              </button>

              <div className="w-px h-5 bg-stone-200 shrink-0" />

              <FilterChips
                filters={activeFilters}
                onChange={f => setActiveFilters(prev => ({ ...prev, ...f }))}
                onClear={clearFilters}
              />

              <div className="flex-1" />

              <div className="shrink-0 hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
                <span>Urutkan:</span>
                <span className="font-semibold text-stone-700">Populer</span>
                <ChevronRight className="h-3 w-3 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 pb-2">
          <p className="text-xs text-stone-500">
            {filteredDestinations.length === allDestinations.length && !anyFilterActive && !searchQuery
              ? `Menampilkan semua ${allDestinations.length} destinasi`
              : `${filteredDestinations.length} destinasi ditemukan`}
          </p>
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <DestinationCardSkeleton key={i} landscape={i % 7 === 0} />
              ))}
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gold-200 rounded-3xl bg-white text-center px-6">
              <Sparkles className="h-10 w-10 text-gold-300 mb-4" />
              <span className="block text-base font-semibold text-royal-950 mb-1">
                {t('destinations_page.not_found')}
              </span>
              <span className="block text-sm text-stone-500">
                {t('destinations_page.try_different')}
              </span>
              {anyFilterActive && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 rounded-full bg-gold-500 text-royal-950 text-xs font-bold hover:bg-gold-400 transition-colors"
                >
                  Hapus Semua Filter
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filteredDestinations.map((dest, index) => (
                  <DestinationCard
                    key={dest.id}
                    destination={dest}
                    onExplore={handleExplore}
                    onToggleSave={handleToggleSave}
                    isSaved={isSaved(dest.id)}
                    className={index % 7 === 0 ? 'col-span-2' : ''}
                  />
                ))}
              </div>
              {loadingMore && (
                <div className="mt-10 flex justify-center">
                  <span className="animate-spin rounded-full h-6 w-6 border-2 border-gold-500 border-t-transparent" />
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="bg-royal-950 text-white border-t border-royal-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Image src="/logo-gold-new.png" alt="Jogjagem" width={24} height={24} className="h-6 w-auto" />
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

export default function DestinationsPageClient() {
  return (
    <AuthProvider>
      <DestinationsPageInner />
    </AuthProvider>
  );
}
