'use client';

import { Fragment, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from '@/i18n/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import Header from '@/components/Header';
import DestinationCard from '@/components/DestinationCard';
import { DestinationCardSkeleton, TrendingCardSkeleton } from '@/components/CardSkeleton';
import CategoryLinks from '@/components/CategoryLinks';
import AdBanner from '@/components/AdBanner';
import SearchBar from '@/components/SearchBar';
import { Destination } from '@/types';
import { mapApiToDestination } from '@/lib/destination-mapper';
import { destinations as destinationApi, ai } from '@/lib/api';
import { toSlug } from '@/lib/slug';
import { localizeCategoryPath } from '@/lib/category-slugs';
import Image from 'next/image';
import {
  Search, ArrowLeft, ChevronLeft, ChevronRight,
  Star, SlidersHorizontal, X, MapPin, Sparkles,
  Flame,
} from 'lucide-react';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

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
  'Sunrise Spot':   'bg-amber-400',
  'Sunset Spot':    'bg-orange-500',
  'Camping Spot':   'bg-lime-700',
  'Budget Friendly': 'bg-emerald-600',
  Waterfall:        'bg-cyan-600',
  'Night Spot':     'bg-indigo-600',
  "Photographer's Pick": 'bg-fuchsia-600',
};

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

function filterDestinations(
  full: Destination[],
  selectedCategory: string | null,
  selectedRegion: string | null
): Destination[] {
  let filtered = full;

  if (selectedRegion) {
    filtered = filtered.filter(d =>
      d.subRegion?.toLowerCase().includes(selectedRegion.toLowerCase())
    );
  }

  if (selectedCategory === 'hidden-gem') {
    filtered = filtered.filter(d => {
      const badges = Array.isArray(d.badges) ? d.badges : [];
      return (d.badge || '').toLowerCase() === 'hidden_gem'
        || badges.some((badge: unknown) => String(badge).toLowerCase() === 'hidden_gem');
    });
  } else if (selectedCategory) {
    filtered = filtered.filter(d =>
      d.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  return filtered;
}

type DestinationsPageClientProps = {
  initialCategory?: string | null;
  initialRegion?: string | null;  // e.g. "Sleman", "Bantul" — filters by subRegion
  initialDestinations?: Destination[];
  isWeeklyCurated?: boolean;       // true on the hidden-gem page — shows the weekly refresh badge
};

function DestinationsPageInner({ initialCategory = null, initialRegion = null, initialDestinations, isWeeklyCurated = false }: DestinationsPageClientProps) {
  const router = useRouter();
  const { t, locale } = useLocale();

  const hasInitialData = Boolean(initialDestinations && initialDestinations.length > 0);

  const [allDestinations, setAllDestinations]     = useState<Destination[]>(() =>
    hasInitialData
      ? filterDestinations(initialDestinations!, initialCategory, initialRegion)
      : []
  );
  const [isLoading, setIsLoading]                 = useState(!hasInitialData);
  const [selectedCategory, setSelectedCategory]   = useState<string | null>(initialCategory);
  const [selectedRegion, setSelectedRegion]       = useState<string | null>(initialRegion);
  const [searchQuery, setSearchQuery]             = useState('');
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const savedIdsRef = useRef<Set<string>>(new Set());
  const [hydrated, setHydrated]                   = useState(false);
  const [page, setPage]                           = useState(1);
  const [totalPages, setTotalPages]               = useState(1);
  const [totalCount, setTotalCount]               = useState<number | null>(null);
  const [loadingMore, setLoadingMore]             = useState(false);
  const hasLoadedOnce = useRef(false);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const stickyFilterRef = useRef<HTMLDivElement | null>(null);

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

  const handleSelectCategory = (cat: string | null) => {
    if (cat) {
      // Redirect to the canonical category URL for SEO
      router.push(`/${locale}/destinations/${cat}`);
    } else {
      // Deselect: go back to the all destinations page
      router.push(`/${locale}/destinations`);
    }
  };

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
  const handleExplore = useCallback((dest: Destination) => router.push(`/destinations/${toSlug(dest.name)}`), []);

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
    if (hasInitialData) {
      if (!hasLoadedOnce.current) {
        // Server-rendered list is already seeded (and filtered) — skip the
        // client fetch on first mount to avoid a skeleton flash + double fetch.
        hasLoadedOnce.current = true;
        return;
      }
      // Filter changes after mount: apply them against the full server list.
      setAllDestinations(
        isWeeklyCurated && selectedCategory === 'hidden-gem'
          ? initialDestinations!  // already the curated 15, no filtering needed
          : filterDestinations(initialDestinations!, selectedCategory, selectedRegion)
      );
      setPage(1);
      setTotalPages(1);
      return;
    }

    let cancelled = false;
    async function loadInitial() {
      setIsLoading(true);
      setTotalCount(null);
      try {
        let full: Destination[] = [];

        if (isWeeklyCurated && selectedCategory === 'hidden-gem') {
          // Use the dedicated endpoint — returns only the 15 curated destinations
          // instead of fetching the full catalogue and filtering client-side.
          const response = await destinationApi.getHiddenGem();
          const data = (response as any).data || (response as any);
          full = Array.isArray(data) ? data.map(mapApiToDestination) : [];
        } else {
          const response = await destinationApi.getAll({ limit: 500 });
          const data = (response as any).data || (response as any);
          full = Array.isArray(data) ? data.map(mapApiToDestination) : [];
        }

        if (cancelled) return;
        setAllDestinations(
          isWeeklyCurated && selectedCategory === 'hidden-gem'
            ? full  // already the exact curated list, no further filtering needed
            : filterDestinations(full, selectedCategory, selectedRegion)
        );
        setPage(1); setTotalPages(1);
      } catch (e) { console.error('Failed to fetch destinations:', e); }
      finally {
        if (!cancelled) {
          hasLoadedOnce.current = true;
          setIsLoading(false);
        }
      }
    }
    loadInitial();
    return () => { cancelled = true; };
  }, [selectedCategory, selectedRegion, initialDestinations]);

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
        <section className="relative bg-royal-950 pt-10 pb-0 overflow-hidden">
          {/* Background image: dynamically calculated based on selectedRegion */}
          {(() => {
            let bgSrc = '/merapi.jpg';
            let bgAlt = 'Yogyakarta';
            if (selectedRegion) {
              const r = selectedRegion.toLowerCase();
              if (r.includes('sleman')) {
                bgSrc = '/merapi.png';
                bgAlt = 'Gunung Merapi Sleman';
              } else if (r.includes('gunungkidul') || r.includes('gunung kidul')) {
                bgSrc = '/pantai.png';
                bgAlt = 'Pantai Gunungkidul';
              } else if (r.includes('yogyakarta') || r.includes('jogja')) {
                bgSrc = '/tugu.png';
                bgAlt = 'Tugu Yogyakarta';
              } else if (r.includes('kulon') || r.includes('progo')) {
                bgSrc = '/kalibiru.png';
                bgAlt = 'Kalibiru Kulon Progo';
              } else if (r.includes('bantul')) {
                bgSrc = '/pantai.png';
                bgAlt = 'Pantai Bantul';
              }
            }
            return (
              <div className="absolute inset-0">
                <Image
                  key={bgSrc}
                  src={bgSrc}
                  alt={bgAlt}
                  fill
                  sizes="100vw"
                  className="object-cover object-center opacity-40 transition-opacity duration-500"
                  priority
                />
                {/* gradient: dark left → transparent right */}
                <div className="absolute inset-0 bg-gradient-to-r from-royal-950 via-royal-950/70 to-transparent" />
                {/* subtle bottom fade so content blends into page */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-royal-950" />
              </div>
            );
          })()}

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* SEO Breadcrumb Navigation & JSON-LD Structured Data */}
            {(() => {
              const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';
              const items: { label: string; href?: string; schemaUrl: string }[] = [];

              if (selectedRegion && selectedCategory) {
                const regSlug = selectedRegion.toLowerCase().replace(/\s+/g, '-');
                const catName = t(`category.${selectedCategory.replace(/-/g, '_')}`) || selectedCategory;
                const regLabel = selectedRegion.toLowerCase().includes('yogyakarta') ? 'Wisata Yogyakarta' : `Wisata ${selectedRegion}`;
                
                items.push({
                  label: regLabel,
                  href: `/${locale}/location/${regSlug}`,
                  schemaUrl: `${siteUrl}/${locale}/location/${regSlug}`,
                });
                items.push({
                  label: catName,
                  schemaUrl: `${siteUrl}/${locale}/destinations/${selectedCategory}`,
                });
              } else if (selectedRegion) {
                const regSlug = selectedRegion.toLowerCase().replace(/\s+/g, '-');
                const regLabel = selectedRegion.toLowerCase().includes('yogyakarta') ? 'Wisata Yogyakarta' : `Wisata ${selectedRegion}`;
                items.push({
                  label: regLabel,
                  schemaUrl: `${siteUrl}/${locale}/location/${regSlug}`,
                });
              } else if (selectedCategory) {
                const catName = t(`category.${selectedCategory.replace(/-/g, '_')}`) || selectedCategory;
                items.push({
                  label: catName,
                  schemaUrl: `${siteUrl}/${locale}/destinations/${selectedCategory}`,
                });
              } else {
                items.push({
                  label: locale === 'en' ? 'All Destinations' : 'Destinasi Wisata',
                  schemaUrl: `${siteUrl}/${locale}/destinations`,
                });
              }

              const schemaItems = [
                { name: 'Jogjagem', url: `${siteUrl}/${locale}` },
                ...items.map(i => ({ name: i.label, url: i.schemaUrl })),
              ];

              return (
                <>
                  <BreadcrumbJsonLd items={schemaItems} />
                  <nav aria-label="Breadcrumb" className="mb-6">
                    <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/60">
                      <li className="flex items-center gap-1.5">
                        <Link href={`/${locale}`} className="hover:text-gold-400 transition-colors font-medium">
                          Jogjagem
                        </Link>
                      </li>
                      {items.map((item, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <ChevronRight className="h-3 w-3 text-white/30 shrink-0" />
                          {item.href && idx < items.length - 1 ? (
                            <Link href={item.href} className="hover:text-gold-400 transition-colors font-medium">
                              {item.label}
                            </Link>
                          ) : (
                            <span className="text-gold-400 font-semibold" aria-current="page">
                              {item.label}
                            </span>
                          )}
                        </li>
                      ))}
                    </ol>
                  </nav>
                </>
              );
            })()}

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
              <div>
                {(() => {
                  const isEn = locale === 'en';
                  const year = new Date().getFullYear();
                  const count = (selectedRegion || selectedCategory ? allDestinations.length : (totalCount ?? allDestinations.length)) || '90+';
                  
                  let badge = isEn ? `TRAVEL GUIDE ${year}` : `PANDUAN WISATA ${year}`;
                  let title = t('destinations_page.heading');
                  let subtitle = isEn
                    ? `Discover ${count} curated destinations across Yogyakarta ${year}.`
                    : `Eksplorasi ${count} destinasi & tempat wisata pilihan paling populer di Yogyakarta ${year}.`;

                  if (selectedRegion) {
                    const r = selectedRegion.toLowerCase();
                    badge = isEn ? `DESTINATIONS · ${selectedRegion.toUpperCase()}` : `DESTINASI · ${selectedRegion.toUpperCase()}`;

                    if (r.includes('gunungkidul') || r.includes('gunung kidul')) {
                      title = isEn ? 'Wisata Gunungkidul' : 'Wisata Gunungkidul';
                      subtitle = isEn
                        ? `Explore ${count} top-rated exotic beaches, caves, and natural adventure destinations in Gunungkidul, Jogja ${year}.`
                        : `Eksplorasi ${count} tempat wisata pantai eksotis, gua, serta petualangan alam terbaik di Gunungkidul, Jogja ${year}.`;
                    } else if (r.includes('sleman')) {
                      title = isEn ? 'Wisata Sleman & Merapi' : 'Wisata Sleman & Merapi';
                      subtitle = isEn
                        ? `Explore ${count} top-rated Merapi nature spots, historical temples, and culinary destinations in Sleman, Jogja ${year}.`
                        : `Eksplorasi ${count} tempat wisata alam Merapi, candi bersejarah, serta kuliner hits terbaik di Sleman, Jogja ${year}.`;
                    } else if (r.includes('bantul')) {
                      title = isEn ? 'Wisata Bantul' : 'Wisata Bantul';
                      subtitle = isEn
                        ? `Explore ${count} top-rated beaches, scenic hills, and craft centers in Bantul, Jogja ${year}.`
                        : `Eksplorasi ${count} tempat wisata pantai, bukit pemandangan, serta sentra kerajinan terbaik di Bantul, Jogja ${year}.`;
                    } else if (r.includes('kulon') || r.includes('progo')) {
                      title = isEn ? 'Wisata Kulon Progo' : 'Wisata Kulon Progo';
                      subtitle = isEn
                        ? `Explore ${count} top-rated nature spots, Menoreh hills, and trending attractions in Kulon Progo, Jogja ${year}.`
                        : `Eksplorasi ${count} tempat wisata alam, perbukitan Menoreh, serta destinasi hits terbaik di Kulon Progo, Jogja ${year}.`;
                    } else if (r.includes('yogyakarta') || r.includes('jogja')) {
                      title = isEn ? 'Wisata Yogyakarta' : 'Wisata Yogyakarta';
                      subtitle = isEn
                        ? `Explore ${count} top-rated heritage, culture, Malioboro, and culinary spots in Yogyakarta ${year}.`
                        : `Eksplorasi ${count} tempat wisata sejarah, budaya, Malioboro, serta kuliner khas terbaik di Yogyakarta ${year}.`;
                    } else {
                      title = `Wisata ${selectedRegion}`;
                      subtitle = isEn
                        ? `Explore ${count} curated destinations in ${selectedRegion}, Yogyakarta ${year}.`
                        : `Eksplorasi ${count} tempat wisata pilihan terbaik di ${selectedRegion}, Jogja ${year}.`;
                    }
                  } else if (selectedCategory) {
                    const catName = t(`category.${selectedCategory.replace(/-/g, '_')}`) || selectedCategory;
                    badge = isEn ? `CATEGORY · ${catName.toUpperCase()}` : `KATEGORI · ${catName.toUpperCase()}`;
                    title = `Wisata ${catName} Jogja`;
                    subtitle = isEn
                      ? `Explore ${count} top-rated ${catName.toLowerCase()} destinations across Yogyakarta ${year}.`
                      : `Eksplorasi ${count} tempat wisata ${catName.toLowerCase()} pilihan paling populer dan hits di Yogyakarta ${year}.`;
                  }

                  return (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <MapPin className="h-4 w-4 text-gold-400" />
                        <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                          {badge}
                        </span>
                      </div>
                      <h1 className="font-manrope text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                        {title}
                      </h1>
                      <p className="mt-3 text-sm sm:text-base text-white/70 font-light max-w-xl leading-relaxed">
                        {subtitle}
                      </p>
                    </>
                  );
                })()}
                {/* Weekly curated badge — shown only on the hidden-gem page */}
                {isWeeklyCurated && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-400/25 text-teal-300 text-xs font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
                    </span>
                    {locale === 'en' ? 'Updated every week' : 'Diperbarui tiap minggu'}
                  </div>
                )}
                {/* Powerful SEO Quick Links Chips — Always rendered for maximum crawling & internal link equity */}
                <nav aria-label="Navigasi Wilayah dan Kategori Wisata" className="mt-4 flex flex-wrap items-center gap-2">

                  {[
                    { slug: 'kota-yogyakarta', label: 'Yogyakarta', seoTitle: 'Wisata Yogyakarta', match: 'yogyakarta' },
                    { slug: 'sleman', label: 'Sleman', seoTitle: 'Wisata Sleman & Merapi', match: 'sleman' },
                    { slug: 'bantul', label: 'Bantul', seoTitle: 'Wisata Pantai & Kerajinan Bantul', match: 'bantul' },
                    { slug: 'kulon-progo', label: 'Kulon Progo', seoTitle: 'Wisata Alam Kulon Progo', match: 'kulon' },
                    { slug: 'gunungkidul', label: 'Gunungkidul', seoTitle: 'Wisata Pantai & Gua Gunungkidul', match: 'gunung' },
                  ].map(({ slug, label, seoTitle, match }) => {
                    const href = `/${locale}/location/${slug}`;
                    const isActive = Boolean(selectedRegion && selectedRegion.toLowerCase().includes(match));
                    return (
                      <Link
                        key={slug}
                        href={href}
                        title={seoTitle}
                        aria-label={seoTitle}
                        aria-current={isActive ? 'page' : undefined}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 ${
                          isActive
                            ? 'border-gold-400 bg-gold-400/20 text-gold-300 shadow-sm'
                            : 'border-white/15 text-white/60 hover:border-gold-400/50 hover:text-gold-400 hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {(trendingLoading || trendingItems.length > 0 || allDestinations.length > 0) && (() => {
              // Cross-reference trending items against allDestinations to filter by active category/region.
              // Events are always included (they carry a location string but no category).
              const destIndex = new Map(allDestinations.map(d => [d.id, d]));
              let filteredTrending = trendingLoading ? trendingItems : trendingItems.filter(item => {
                if (item.type === 'event') {
                  // Filter events by region if a region is active
                  if (selectedRegion) {
                    return item.location?.toLowerCase().includes(selectedRegion.toLowerCase());
                  }
                  // For category filter, exclude events (they don't have a category)
                  if (selectedCategory) return false;
                  return true;
                }
                const dest = destIndex.get(item.id);
                if (selectedCategory && dest) {
                  if (dest.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
                }
                if (selectedRegion) {
                  const loc = (dest?.subRegion || dest?.location || item.location || '').toLowerCase();
                  if (!loc.includes(selectedRegion.toLowerCase())) return false;
                }
                return true;
              });

              // Fallback: If AI global trending has fewer than 3 matches for the active filter (e.g. Bantul, Kulon Progo),
              // populate with top-rated destinations matching the filter from allDestinations.
              if (!trendingLoading && filteredTrending.length < 3 && allDestinations.length > 0) {
                const existingIds = new Set(filteredTrending.map(t => t.id));
                const candidates = allDestinations.filter(dest => {
                  if (existingIds.has(dest.id)) return false;
                  if (selectedCategory) {
                    if (dest.category?.toLowerCase() !== selectedCategory.toLowerCase()) return false;
                  }
                  if (selectedRegion) {
                    const loc = (dest.subRegion || dest.location || '').toLowerCase();
                    if (!loc.includes(selectedRegion.toLowerCase())) return false;
                  }
                  return true;
                });

                candidates.sort((a, b) => (b.rating || 0) - (a.rating || 0));

                const fallbacks: TrendingItem[] = candidates.slice(0, 5 - filteredTrending.length).map(dest => ({
                  type: 'destination',
                  id: dest.id,
                  badge: dest.category ? (t(`category.${dest.category.replace(/-/g, '_')}`) || dest.category) : 'Pilihan',
                  headline: dest.name,
                  reason: dest.tagline || dest.description || '',
                  imageUrl: dest.images?.[0]?.url || '',
                  rating: dest.rating || 4.5,
                  distance: '',
                  location: dest.subRegion || dest.location || '',
                }));

                filteredTrending = [...filteredTrending, ...fallbacks];
              }

              const trendingLabel = selectedCategory
                ? `Trending · ${t(`category.${selectedCategory.replace(/-/g, '_')}`) || selectedCategory}`
                : selectedRegion
                ? `Trending · ${selectedRegion}`
                : locale === 'en' ? 'Trending Now' : 'Sedang Trending';

              if (!trendingLoading && filteredTrending.length < 1) return null;

              return (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Flame className="h-4 w-4 text-red-400" />
                    <span className="text-xs font-semibold uppercase tracking-widest text-white/60">{trendingLabel}</span>
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
                    items={filteredTrending}
                    destinations={allDestinations}
                    isLoading={trendingLoading}
                    onNavigate={handleTrendingNavigate}
                  />
                </div>
              );
            })()}

            <div className="w-full sm:max-w-xl mb-2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                placeholder={t('destinations_page.search_placeholder') || 'Cari destinasi, aktivitas, atau pengalaman...'}
              />
            </div>
          </div>

            <div className="border-t border-white/8 mt-2 relative z-40">
              <CategoryLinks
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
                dark
              />
            </div>
        </section>

        <div ref={stickyFilterRef} className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm">
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

        <section ref={resultsRef} className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-3xl bg-stone-200/70 animate-pulse aspect-[3/4] ${i % 7 === 0 ? 'col-span-2' : ''}`}
                />
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
                  <Fragment key={dest.id}>
                    <DestinationCard
                      destination={dest}
                      onExplore={handleExplore}
                      onToggleSave={handleToggleSave}
                      isSaved={isSaved(dest.id)}
                      className={index % 7 === 0 ? 'col-span-2' : ''}
                    />
                    {index === 3 && (
                      <AdBanner
                        placement="listing_native"
                        category={selectedCategory ?? undefined}
                        variant="native"
                      />
                    )}
                  </Fragment>
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

export default function DestinationsPageClient({ initialCategory = null, initialRegion = null, initialDestinations, isWeeklyCurated = false }: DestinationsPageClientProps) {
  return (
    <AuthProvider>
      <DestinationsPageInner
        initialCategory={initialCategory}
        initialRegion={initialRegion}
        initialDestinations={initialDestinations}
        isWeeklyCurated={isWeeklyCurated}
      />
    </AuthProvider>
  );
}
