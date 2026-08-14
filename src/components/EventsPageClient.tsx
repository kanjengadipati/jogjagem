'use client';

import React, { Fragment, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Calendar, MapPin, Search, Star, Heart, Flame,
  SlidersHorizontal, Sparkles, X, ChevronRight, ChevronLeft,
  Clock, Tag,
} from 'lucide-react';
import { EventCardSkeleton, TrendingCardSkeleton } from '@/components/CardSkeleton';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import AdBanner from '@/components/AdBanner';
import { BreadcrumbJsonLd } from '@/components/JsonLd';
import { events as eventsApi } from '@/lib/api';
import { useLocale } from '@/contexts/LocaleContext';

// ── Types ─────────────────────────────────────────────────────────────────────

interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  image_url: string;
  category: string;
  ticket_price: string;
  organizer: string;
  badge?: string;
  badges?: string[];
  rating?: number;
}

type EventCategory = {
  id: string | null;
  label: string;
  icon: string;
};

type ActiveFilter = {
  minRating: number | null;
  free: boolean;
  today: boolean;
  thisWeekend: boolean;
  thisMonth: boolean;
  popular: boolean;
};

// ── Ordering ──────────────────────────────────────────────────────────────────

function eventStatusRank(start: string, end: string, today: string): number {
  const s = (start || '').trim();
  const e = (end || '').trim();
  if (!s) return 3;
  if (!e) {
    if (s <= today) return 0; // started, no end date → assumed ongoing
    return 1;
  }
  if (s <= today && e >= today) return 0;
  if (s > today) return 1;
  return 2;
}

const BADGE_RANK: Record<string, number> = {
  trending: 0,
  populer: 1,
  terbatas: 2,
  akan_datang: 3,
};

function badgeRank(badge?: string): number {
  return BADGE_RANK[(badge || '').toLowerCase()] ?? 4;
}

function sortEventsByStatus(list: EventItem[]): EventItem[] {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
  return [...list].sort((a, b) => {
    const ra = eventStatusRank(a.start_date, a.end_date, today);
    const rb = eventStatusRank(b.start_date, b.end_date, today);
    if (ra !== rb) return ra - rb;
    switch (ra) {
      case 0: // active: least time left first
        if (a.end_date !== b.end_date) return a.end_date < b.end_date ? -1 : 1;
        if (a.start_date !== b.start_date) return a.start_date > b.start_date ? -1 : 1;
        break;
      case 1: // upcoming: nearest start first
        if (a.start_date !== b.start_date) return a.start_date < b.start_date ? -1 : 1;
        if (a.end_date !== b.end_date) return a.end_date < b.end_date ? -1 : 1;
        break;
      case 2: // completed: most recently ended first
        if (a.end_date !== b.end_date) return a.end_date > b.end_date ? -1 : 1;
        if (a.start_date !== b.start_date) return a.start_date > b.start_date ? -1 : 1;
        break;
    }
    const ba = badgeRank(a.badge);
    const bb = badgeRank(b.badge);
    if (ba !== bb) return ba - bb;
    return a.id.localeCompare(b.id);
  });
}

// ── Constants ─────────────────────────────────────────────────────────────────

const BADGE_STYLES: Record<string, string> = {
  trending:          'bg-red-600/90 border-red-500/30 text-white',
  populer:           'bg-purple-600/90 border-purple-500/30 text-white',
  akan_datang:       'bg-blue-600/90 border-blue-500/30 text-white',
  spesial_hari_ini:  'bg-amber-600/90 border-amber-500/30 text-white',
  terbatas:          'bg-orange-600/90 border-orange-500/30 text-white',
  festival:          'bg-fuchsia-700/90 border-fuchsia-500/30 text-white',
  weekend:           'bg-indigo-600/90 border-indigo-500/30 text-white',
  budaya:            'bg-amber-700/90 border-amber-600/30 text-white',
  musik:             'bg-teal-600/90 border-teal-500/30 text-white',
  kuliner:           'bg-green-700/90 border-green-600/30 text-white',
  seni:              'bg-pink-700/90 border-pink-500/30 text-white',
  olahraga:          'bg-cyan-700/90 border-cyan-500/30 text-white',
  default:           'bg-black/50 border-white/10 text-white backdrop-blur-sm',
};

const EVENT_CATEGORIES: EventCategory[] = [
  { id: null,       label: 'Semua',    icon: '✦' },
  { id: 'festival', label: 'Festival', icon: '🎪' },
  { id: 'musik',    label: 'Musik',    icon: '🎵' },
  { id: 'budaya',   label: 'Budaya',   icon: '🏛' },
  { id: 'kuliner',  label: 'Kuliner',  icon: '🍜' },
  { id: 'seni',     label: 'Seni',     icon: '🎨' },
  { id: 'olahraga', label: 'Olahraga', icon: '⚡' },
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  festival: ['festival', 'fest', 'karnaval', 'carnival', 'pekan raya', 'pasar malam', 'sekaten'],
  musik: ['musik', 'music', 'jazz', 'konser', 'concert', 'gamelan', 'sound', 'orchestra', 'band', 'akustik'],
  budaya: ['budaya', 'cultural', 'culture', 'ceremony', 'upacara', 'tradisi', 'heritage', 'keraton', 'wayang', 'adat'],
  kuliner: ['kuliner', 'food', 'culinary', 'makan', 'bazar makanan', 'cooking', 'resto', 'snack', 'bakpia'],
  seni: ['seni', 'art', 'fashion', 'film', 'cinema', 'pameran', 'exhibition', 'dance', 'tari', 'teater', 'theatre', 'drama', 'comedy', 'komedi'],
  olahraga: ['olahraga', 'sport', 'sports', 'adventure', 'marathon', 'race', 'run', 'lari', 'gowes', 'cycling', 'sepeda', 'hiking', 'trail'],
};

function matchEventCategory(evt: EventItem, categoryId: string | null): boolean {
  if (!categoryId) return true;
  const keywords = CATEGORY_KEYWORDS[categoryId];
  if (!keywords) return evt.category?.toLowerCase() === categoryId.toLowerCase();

  const target = `${evt.category || ''} ${evt.badge || ''} ${evt.title || ''}`.toLowerCase();
  return keywords.some(kw => target.includes(kw));
}

// ── Trending Carousel for Events ──────────────────────────────────────────────

function TrendingEventsCarousel({
  items,
  isLoading,
  onNavigate,
}: {
  items: EventItem[];
  isLoading: boolean;
  onNavigate: (item: EventItem) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 220 : -220, behavior: 'smooth' });
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
              const badgeKey = (item.badge || item.category || '').toLowerCase().replace(/[\s-]/g, '_');
              const badgeBg = BADGE_STYLES[badgeKey] || 'bg-gold-500';
              const dateText = item.start_date
                ? new Date(item.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
                : null;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item)}
                  className="shrink-0 w-[140px] sm:w-[170px] rounded-2xl overflow-hidden bg-white/5 border border-white/10 text-left hover:border-gold-400/40 active:scale-95 transition-all duration-200 cursor-pointer group"
                >
                  <div className="relative h-[85px] sm:h-[100px] overflow-hidden">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        sizes="170px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-gold-400/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <span className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-royal-950 text-[9px] font-black leading-none shadow-lg">
                      {idx + 1}
                    </span>
                    <span className={`absolute top-2 left-8 ${badgeBg} text-white text-[8px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full truncate max-w-[100px]`}>
                      {item.badge || item.category}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <p className="text-[11px] font-bold text-white leading-tight line-clamp-2 mb-1.5 group-hover:text-gold-300 transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-white/60">
                      {dateText && (
                        <span className="flex items-center gap-1 text-gold-400 font-medium truncate">
                          <Calendar className="h-2.5 w-2.5 shrink-0" />
                          {dateText}
                        </span>
                      )}
                      {item.location && (
                        <span className="truncate text-white/50 max-w-[70px]">
                          {item.location}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
      </div>
      {!isLoading && items.length > 3 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute -left-4 top-1/2 -translate-y-1/2 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-all"
            aria-label="Scroll Kiri"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute -right-4 top-1/2 -translate-y-1/2 hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-black/60 border border-white/10 text-white hover:bg-black/80 transition-all"
            aria-label="Scroll Kanan"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

// ── Filter Chips ──────────────────────────────────────────────────────────────

function EventFilterChips({
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
    filters.today ||
    filters.thisWeekend ||
    filters.thisMonth ||
    filters.popular;

  const chipBase = 'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer shrink-0 whitespace-nowrap';
  const chipOn  = 'bg-gold-500 border-gold-400 text-royal-950 font-bold';
  const chipOff = 'bg-white border-stone-200 text-stone-700 hover:border-gold-400/60 hover:text-stone-900';

  const ratingOptions = [4, 4.5];

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
        onClick={() => onChange({ today: !filters.today })}
        className={`${chipBase} ${filters.today ? chipOn : chipOff}`}
      >
        Hari Ini
      </button>

      <button
        onClick={() => onChange({ thisWeekend: !filters.thisWeekend })}
        className={`${chipBase} ${filters.thisWeekend ? chipOn : chipOff}`}
      >
        Akhir Pekan
      </button>

      <button
        onClick={() => onChange({ thisMonth: !filters.thisMonth })}
        className={`${chipBase} ${filters.thisMonth ? chipOn : chipOff}`}
      >
        Bulan Ini
      </button>

      <button
        onClick={() => onChange({ popular: !filters.popular })}
        className={`${chipBase} ${filters.popular ? chipOn : chipOff}`}
      >
        <Flame className={`h-3 w-3 ${filters.popular ? 'text-royal-950' : 'text-red-500'}`} />
        Populer
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

// ── Event Card ────────────────────────────────────────────────────────────────

function EventCard({
  evt,
  isSaved,
  onToggleSave,
  className = '',
}: {
  evt: EventItem;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  className?: string;
}) {
  const { t } = useLocale();

  const badgeKey = (evt.badge || evt.category || '').toLowerCase().replace(/[\s-]/g, '_');
  const badgeStyle = BADGE_STYLES[badgeKey] || BADGE_STYLES.default;
  const badgeLabel = evt.badge
    ? (t(`badges.${evt.badge.toLowerCase().replace(/ /g, '_')}`) || evt.badge)
    : evt.category.replace(/-/g, ' ');

  // Secondary badges
  const allBadges = (evt.badges && evt.badges.length > 0)
    ? evt.badges
    : evt.badge
      ? [evt.badge]
      : [];
  const secondaryBadges = allBadges
    .filter((b: string) => b !== evt.badge)
    .slice(0, 2)
    .map((b: string) => {
      const key = b.toLowerCase().replace(/[\s-]/g, '_');
      return {
        label: (t(`badges.${b.toLowerCase().replace(/ /g, '_')}`) || b).toUpperCase(),
        style: BADGE_STYLES[key] || BADGE_STYLES.default,
      };
    });

  const dateLabel = evt.start_date
    ? `${evt.start_date}${evt.end_date && evt.end_date !== evt.start_date ? ` – ${evt.end_date}` : ''}`
    : null;

  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <Link
      href={`/events/${evt.id}`}
      className={`group relative rounded-[24px] overflow-hidden bg-stone-900 border border-stone-200/40 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 cursor-pointer block h-[280px] sm:h-[320px] ${className}`}
    >
      {/* Shimmer placeholder */}
      {!imgLoaded && !imgError && evt.image_url && (
        <div className="absolute inset-0 bg-stone-800 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.4s_infinite] -translate-x-full" />
        </div>
      )}

      {/* Image */}
      {evt.image_url && !imgError ? (
        <Image
          src={evt.image_url}
          alt={evt.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-royal-900 to-royal-950 flex items-center justify-center">
          <Calendar className="h-12 w-12 text-gold-400/40" />
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent group-hover:from-black/100 transition-opacity duration-300" />

      {/* Badge top-left */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[70%] z-10">
        <span className={`inline-flex items-center text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.08em] px-2 sm:px-2.5 py-0.5 rounded-full border ${badgeStyle} truncate`}>
          {badgeLabel}
        </span>
        {secondaryBadges.map((b, i) => (
          <span key={i} className={`inline-flex items-center text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.08em] px-2 sm:px-2.5 py-0.5 rounded-full border ${b.style} truncate opacity-80`}>
            {b.label}
          </span>
        ))}
      </div>

      {/* Ticket price top-right */}
      {evt.ticket_price && evt.ticket_price !== '0' && (
        <div className="absolute top-3 right-12 z-10">
          <span className="bg-gold-500 text-royal-950 text-[9px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
            {evt.ticket_price}
          </span>
        </div>
      )}

      {/* Bookmark */}
      <button
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onToggleSave(evt.id);
        }}
        className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-sm border border-white/10 transition-all"
        aria-label="Simpan Event"
      >
        <Heart className={`h-3.5 w-3.5 transition-all ${isSaved ? 'fill-red-500 text-red-500 scale-110' : 'text-white/90'}`} />
      </button>

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 z-10">
        <h3 className="font-manrope font-bold text-sm sm:text-base text-white leading-tight line-clamp-2 mb-2 group-hover:text-gold-300 transition-colors">
          {evt.title}
        </h3>

        <div className="flex flex-col gap-1">
          {dateLabel && (
            <div className="flex items-center gap-1.5 text-[11px] text-gold-400 font-medium">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{dateLabel}</span>
            </div>
          )}
          {evt.location && (
            <div className="flex items-center gap-1.5 text-[11px] text-white/60">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{evt.location}</span>
            </div>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between mt-3">
          {evt.rating && evt.rating > 0 ? (
            <div className="flex items-center gap-1 text-[11px] font-semibold text-white bg-black/35 py-1 px-2.5 rounded-full border border-white/5">
              <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
              {evt.rating.toFixed(1)}
            </div>
          ) : <div />}
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-royal-950 shadow-md group-hover:bg-gold-300 group-hover:scale-105 transition-all duration-300">
            <svg className="h-3.5 w-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Page Content ──────────────────────────────────────────────────────────────

const EVENT_REGIONS = [
  { slug: 'kota-yogyakarta', label: 'Yogyakarta', match: 'yogyakarta' },
  { slug: 'sleman', label: 'Sleman', match: 'sleman' },
  { slug: 'bantul', label: 'Bantul', match: 'bantul' },
  { slug: 'kulon-progo', label: 'Kulon Progo', match: 'kulon' },
  { slug: 'gunungkidul', label: 'Gunungkidul', match: 'gunung' },
];

function EventsPageContent() {
  const router = useRouter();
  const { t, locale } = useLocale();

  const [eventList, setEventList]                 = useState<EventItem[]>([]);
  const [isLoading, setIsLoading]                 = useState(true);
  const [page, setPage]                           = useState(1);
  const [totalPages, setTotalPages]               = useState(1);
  const [loadingMore, setLoadingMore]             = useState(false);
  const [searchQuery, setSearchQuery]             = useState('');
  const [selectedCategory, setSelectedCategory]   = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion]       = useState<string | null>(null);
  const [savedEventIds, setSavedEventIds]         = useState<Set<string>>(new Set());

  const [activeFilters, setActiveFilters] = useState<ActiveFilter>({
    minRating: null,
    free: false,
    today: false,
    thisWeekend: false,
    thisMonth: false,
    popular: false,
  });

  const clearFilters = () =>
    setActiveFilters({
      minRating: null,
      free: false,
      today: false,
      thisWeekend: false,
      thisMonth: false,
      popular: false,
    });

  const anyFilterActive =
    activeFilters.minRating !== null ||
    activeFilters.free ||
    activeFilters.today ||
    activeFilters.thisWeekend ||
    activeFilters.thisMonth ||
    activeFilters.popular;

  // Infinite scroll refs
  const footerRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);
  const stickyFilterRef = useRef<HTMLDivElement | null>(null);
  const requestIdRef = useRef(0);

  // Saved events persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem('jogjagem_saved_events_v1');
      if (saved) {
        setSavedEventIds(new Set(JSON.parse(saved)));
      }
    } catch {}
  }, []);

  const handleToggleSave = useCallback((id: string) => {
    setSavedEventIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('jogjagem_saved_events_v1', JSON.stringify(Array.from(next)));
      } catch {}
      return next;
    });
  }, []);

  const fetchEvents = async (targetPage: number, append: boolean) => {
    const reqId = ++requestIdRef.current;
    if (targetPage === 1) setIsLoading(true); else setLoadingMore(true);
    try {
      // Fetch all events without server-side category filter —
      // category & region filtering is done client-side (keyword matching).
      const res = await eventsApi.getAll({
        limit: 100,
        page: targetPage,
        q: searchQuery.trim() || undefined,
      });
      if (reqId !== requestIdRef.current) return;
      if (res.status === 'success' && res.data) {
        const items = res.data as EventItem[];
        setEventList(prev => append ? [...prev, ...items] : items);
        setPage(targetPage);
        const meta = (res as any).meta;
        if (meta) setTotalPages(meta.total_pages ?? 1);
      }
    } catch (e) {
      console.error('Failed to load events:', e);
    } finally {
      if (reqId === requestIdRef.current) {
        if (targetPage === 1) setIsLoading(false); else setLoadingMore(false);
      }
    }
  };

  const loadNextPage = () => {
    if (loadingMore || page >= totalPages) return;
    fetchEvents(page + 1, true);
  };

  // Debounced fetch on filter/search change
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchEvents(1, false);
    }, searchQuery ? 300 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadNextPage(); },
      { threshold: 0.1 }
    );
    const footer = footerRef.current;
    if (footer) observer.observe(footer);
    return () => { if (footer) observer.unobserve(footer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, totalPages, loadingMore]);

  // Filter — applied on the status-sorted list
  const sortedEvents = useMemo(() => sortEventsByStatus(eventList), [eventList]);

  // Trending items for the carousel — respects active category & region filter
  const trendingEvents = useMemo(() => {
    const pool = eventList.filter(evt => {
      if (selectedCategory && !matchEventCategory(evt, selectedCategory)) return false;
      if (selectedRegion && !evt.location?.toLowerCase().includes(selectedRegion.toLowerCase())) return false;
      return true;
    });
    const scored = [...pool].sort((a, b) => {
      const br = badgeRank(a.badge) - badgeRank(b.badge);
      if (br !== 0) return br;
      return (b.rating || 0) - (a.rating || 0);
    });
    return scored.slice(0, 8);
  }, [eventList, selectedCategory, selectedRegion]);

  const filteredEvents = useMemo(() => {
    return sortedEvents.filter(evt => {
      if (selectedCategory && !matchEventCategory(evt, selectedCategory)) {
        return false;
      }

      if (selectedRegion && !evt.location?.toLowerCase().includes(selectedRegion.toLowerCase())) {
        return false;
      }

      if (activeFilters.minRating !== null) {
        if (!evt.rating || evt.rating < activeFilters.minRating) return false;
      }

      if (activeFilters.free) {
        const isFree = !evt.ticket_price
          || evt.ticket_price === '0'
          || String(evt.ticket_price).toLowerCase() === 'gratis';
        if (!isFree) return false;
      }

      if (activeFilters.today) {
        if (!evt.start_date || !evt.end_date) return false;
        const today = new Date().toISOString().slice(0, 10);
        if (evt.start_date > today || evt.end_date < today) return false;
      }

      if (activeFilters.thisWeekend) {
        if (!evt.start_date || !evt.end_date) return false;
        let weekend = false;
        for (let d = new Date(evt.start_date); d <= new Date(evt.end_date); d.setDate(d.getDate() + 1)) {
          if (d.getDay() === 0 || d.getDay() === 6) { weekend = true; break; }
        }
        if (!weekend) return false;
      }

      if (activeFilters.thisMonth) {
        if (!evt.start_date) return false;
        const now = new Date();
        const evStart = new Date(evt.start_date);
        if (evStart.getFullYear() !== now.getFullYear() || evStart.getMonth() !== now.getMonth()) {
          return false;
        }
      }

      if (activeFilters.popular) {
        const b = (evt.badge || '').toLowerCase();
        if (b !== 'trending' && b !== 'populer' && (!evt.rating || evt.rating < 4.5)) {
          return false;
        }
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          evt.title.toLowerCase().includes(q) ||
          evt.description?.toLowerCase().includes(q) ||
          evt.location?.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [sortedEvents, selectedCategory, selectedRegion, activeFilters, searchQuery]);

  const isEn = locale === 'en';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';
  const year = new Date().getFullYear();

  // Breadcrumbs
  const breadcrumbItems = useMemo(() => {
    const items: { label: string; href?: string; schemaUrl: string }[] = [];
    if (selectedCategory) {
      const catObj = EVENT_CATEGORIES.find(c => c.id === selectedCategory);
      const catLabel = catObj?.label || selectedCategory;
      items.push({
        label: isEn ? 'Events & Festivals' : 'Festival & Acara',
        href: `/${locale}/events`,
        schemaUrl: `${siteUrl}/${locale}/events`,
      });
      items.push({
        label: catLabel,
        schemaUrl: `${siteUrl}/${locale}/events?category=${selectedCategory}`,
      });
    } else {
      items.push({
        label: isEn ? 'Events & Festivals' : 'Festival & Acara',
        schemaUrl: `${siteUrl}/${locale}/events`,
      });
    }
    return items;
  }, [selectedCategory, isEn, locale, siteUrl]);

  const schemaItems = useMemo(() => [
    { name: 'Jogjagem', url: `${siteUrl}/${locale}` },
    ...breadcrumbItems.map(i => ({ name: i.label, url: i.schemaUrl })),
  ], [siteUrl, locale, breadcrumbItems]);

  const handleTrendingNavigate = (evt: EventItem) => {
    router.push(`/events/${evt.id}`);
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <Header
        activeTab="events"
        setActiveTab={tab => {
          if (tab === 'map') router.push('/map');
          else if (tab === 'planner') router.push('/planner');
          else if (tab === 'saved') router.push('/saved');
          else if (tab === 'ai-assistant') router.push('/ai');
          else router.push(`/?tab=${tab}`);
        }}
        savedCount={savedEventIds.size}
        isOverHero={false}
      />

      <main className="flex-1">
        {/* ── Hero Section (Aligned with /destinations styling) ────────────── */}
        <section className="relative bg-royal-950 pt-10 pb-0 overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0 select-none pointer-events-none">
            <Image
              src="/event-hero-bg.png"
              alt="Events Hero Background"
              fill
              sizes="100vw"
              className="object-cover object-center opacity-40 transition-opacity duration-500"
              priority
            />
            {/* gradient: dark left → transparent right */}
            <div className="absolute inset-0 bg-gradient-to-r from-royal-950 via-royal-950/70 to-transparent" />
            {/* subtle bottom fade */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-royal-950" />
          </div>

          {/* Decorative radial glows */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(214,161,71,0.12)_0%,_transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.06)_0%,_transparent_60%)]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation & Schema */}
            <BreadcrumbJsonLd items={schemaItems} />
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-white/60">
                <li className="flex items-center gap-1.5">
                  <Link href={`/${locale}`} className="hover:text-gold-400 transition-colors font-medium">
                    Jogjagem
                  </Link>
                </li>
                {breadcrumbItems.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <ChevronRight className="h-3 w-3 text-white/30 shrink-0" />
                    {item.href && idx < breadcrumbItems.length - 1 ? (
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

            {/* Header Content */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gold-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                    {selectedRegion
                      ? `EVENT · ${selectedRegion.toUpperCase()}`
                      : selectedCategory
                      ? `EVENT · ${selectedCategory.toUpperCase()}`
                      : isEn ? `EVENTS & FESTIVAL ${year}` : `PANDUAN ACARA & FESTIVAL ${year}`}
                  </span>
                </div>
                <h1 className="font-manrope text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                  {selectedRegion
                    ? `Festival & Acara ${EVENT_REGIONS.find(r => r.match === selectedRegion)?.label || selectedRegion}`
                    : selectedCategory
                    ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Jogja`
                    : isEn ? 'Events & Festivals' : 'Festival & Acara Jogja'}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-white/70 font-light max-w-xl leading-relaxed">
                  {selectedRegion
                    ? (isEn
                        ? `Explore curated events and cultural festivals in ${EVENT_REGIONS.find(r => r.match === selectedRegion)?.label || selectedRegion}, Yogyakarta ${year}.`
                        : `Eksplorasi agenda festival dan acara menarik di wilayah ${EVENT_REGIONS.find(r => r.match === selectedRegion)?.label || selectedRegion}, Yogyakarta ${year}.`)
                    : selectedCategory
                    ? (isEn
                        ? `Explore curated ${selectedCategory} events, performances, and upcoming highlights in Yogyakarta ${year}.`
                        : `Eksplorasi agenda ${selectedCategory}, jadwal pertunjukan, dan perayaan lokal pilihan di Yogyakarta ${year}.`)
                    : (isEn
                        ? `Discover ${eventList.length || '30+'} curated cultural shows, music festivals, culinary fairs, and local celebrations in Yogyakarta ${year}.`
                        : `Eksplorasi ${eventList.length || '30+'} agenda festival budaya, konser musik, pameran seni, dan perayaan lokal terkini di Yogyakarta ${year}.`)}
                </p>

                {/* Powerful SEO Quick Links Chips — Wilayah Event (Matching /destinations) */}
                <nav aria-label="Navigasi Wilayah Event" className="mt-4 flex flex-wrap items-center gap-2">
                  {EVENT_REGIONS.map(({ slug, label, match }) => {
                    const isActive = selectedRegion === match;
                    return (
                      <button
                        key={slug}
                        onClick={() => setSelectedRegion(isActive ? null : match)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                          isActive
                            ? 'border-gold-400 bg-gold-400/20 text-gold-300 shadow-sm'
                            : 'border-white/15 text-white/60 hover:border-gold-400/50 hover:text-gold-400 hover:bg-white/5'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Trending Events Carousel (Matching /destinations trending section) */}
            {(isLoading || trendingEvents.length > 0) && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-4 w-4 text-red-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/60">
                    {selectedRegion
                      ? `Trending · ${EVENT_REGIONS.find(r => r.match === selectedRegion)?.label || selectedRegion}`
                      : selectedCategory
                      ? `Trending · ${EVENT_CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory}`
                      : isEn ? 'Trending Events' : 'Event Sedang Trending'}
                  </span>
                  <div className="flex-1 h-px bg-white/10" />
                  {!isLoading && (
                    <>
                      <button
                        onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                        className="text-xs text-gold-400/80 hover:text-gold-300 font-medium transition-colors hidden sm:block mr-2"
                      >
                        {isEn ? 'View all' : 'Lihat semua'}
                      </button>
                    </>
                  )}
                </div>
                <TrendingEventsCarousel
                  items={trendingEvents}
                  isLoading={isLoading}
                  onNavigate={handleTrendingNavigate}
                />
              </div>
            )}

            {/* Search Bar */}
            <div className="w-full sm:max-w-xl mb-2">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                placeholder={isEn ? 'Search events, music festivals, exhibitions...' : 'Cari event, festival, konser, atau pertunjukan...'}
              />
            </div>
          </div>

          {/* ── Category Navigation Bar ─────────────────────────────────────── */}
          <div className="border-t border-white/8 mt-2 relative z-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5">
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {EVENT_CATEGORIES.map(cat => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={String(cat.id)}
                      onClick={() => setSelectedCategory(active ? null : cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-150 shrink-0 cursor-pointer ${
                        active
                          ? 'bg-gold-500 border-gold-400 text-royal-950 shadow-md shadow-gold-500/20'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Sticky Filter Bar ─────────────────────────────────────────────── */}
        <div ref={stickyFilterRef} className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => clearFilters()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-stone-300 text-stone-700 hover:border-gold-400/60 hover:text-stone-900 transition-all shrink-0 bg-white"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
              </button>

              <div className="w-px h-5 bg-stone-200 shrink-0" />

              <EventFilterChips
                filters={activeFilters}
                onChange={f => setActiveFilters(prev => ({ ...prev, ...f }))}
                onClear={clearFilters}
              />

              <div className="flex-1" />

              <div className="shrink-0 hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
                <span>Urutkan:</span>
                <span className="font-semibold text-stone-700">Terdekat</span>
                <ChevronRight className="h-3 w-3 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Results Info ─────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 pb-2">
          <p className="text-xs text-stone-500">
            {filteredEvents.length === eventList.length && !anyFilterActive && !searchQuery && !selectedCategory
              ? `Menampilkan semua ${eventList.length} event`
              : `${filteredEvents.length} event ditemukan`}
          </p>
        </div>

        {/* ── Events Grid ──────────────────────────────────────────────────── */}
        <section ref={resultsRef} className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => <EventCardSkeleton key={i} landscape={i % 7 === 0} />)}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gold-200 rounded-3xl bg-white text-center px-6">
              <Sparkles className="h-10 w-10 text-gold-300 mb-4" />
              <h3 className="font-manrope text-base font-bold text-royal-950 mb-1">
                {isEn ? 'No Events Found' : 'Tidak Ada Event'}
              </h3>
              <p className="text-xs text-stone-500 max-w-xs mb-2">
                {searchQuery || selectedCategory || anyFilterActive
                  ? (isEn ? 'Try adjusting your keywords, category, or active filters.' : 'Coba kata kunci, kategori, atau filter yang berbeda.')
                  : (isEn ? 'Stay tuned for upcoming events and festivals in Yogyakarta.' : 'Pantau terus untuk jadwal festival dan acara mendatang.')}
              </p>
              {(searchQuery || selectedCategory || anyFilterActive) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                    clearFilters();
                  }}
                  className="mt-4 px-4 py-2 rounded-full bg-gold-500 text-royal-950 text-xs font-bold hover:bg-gold-400 transition-colors"
                >
                  {isEn ? 'Clear All Filters' : 'Hapus Semua Filter'}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filteredEvents.map((evt, index) => (
                  <Fragment key={evt.id}>
                    <EventCard
                      evt={evt}
                      isSaved={savedEventIds.has(evt.id)}
                      onToggleSave={handleToggleSave}
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

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer ref={footerRef} className="bg-royal-950 text-white border-t border-royal-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Image src="/logo-gold-new.png" alt="Jogjagem" width={24} height={24} className="h-6 w-auto" />
              <span className="font-manrope font-bold text-sm tracking-[0.08em] uppercase text-white">Jogjagem</span>
            </div>
            <p className="text-[10px] text-gold-100/40 font-mono tracking-widest uppercase mt-1">
              Pesona Yogyakarta
            </p>
          </div>
          <div className="text-[10px] font-mono text-gold-200/40 uppercase tracking-widest space-y-1">
            <p>© {new Date().getFullYear()} Jogjagem. All rights reserved.</p>
            <p>Dibuat dengan dedikasi untuk pariwisata Yogyakarta.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function EventsPageClient() {
  return (
    <AuthProvider>
      <LocationProvider>
        <EventsPageContent />
      </LocationProvider>
    </AuthProvider>
  );
}
