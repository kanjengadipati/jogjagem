'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import Link from 'next/link';
import {
  Calendar, MapPin, ArrowLeft, Search, ChevronLeft, ChevronRight,
  Star, Heart, Flame, SlidersHorizontal, X, Sparkles,
} from 'lucide-react';
import { EventCardSkeleton } from '@/components/CardSkeleton';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import Header from '@/components/Header';
import { events as eventsApi } from '@/lib/api';
import Image from 'next/image';
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

// ── Event Card ────────────────────────────────────────────────────────────────

function EventCard({ evt, className = '' }: { evt: EventItem; className?: string }) {
  const { t } = useLocale();
  const [saved, setSaved] = useState(false);

  const badgeKey = (evt.badge || evt.category || '').toLowerCase().replace(/[\s-]/g, '_');
  const badgeStyle = BADGE_STYLES[badgeKey] || BADGE_STYLES.default;
  const badgeLabel = evt.badge
    ? (t(`hero.badge_${evt.badge.toLowerCase().replace(/ /g, '_')}`) || evt.badge)
    : evt.category.replace(/-/g, ' ');

  const dateLabel = evt.start_date
    ? `${evt.start_date}${evt.end_date && evt.end_date !== evt.start_date ? ` – ${evt.end_date}` : ''}`
    : null;

  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Link
      href={`/events/${evt.id}`}
      className={`group relative rounded-[24px] overflow-hidden bg-stone-900 border border-stone-200/40 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 cursor-pointer block h-[280px] sm:h-[320px] ${className}`}
    >
      {/* Shimmer placeholder */}
      {!imgLoaded && evt.image_url && (
        <div className="absolute inset-0 bg-stone-800 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.4s_infinite] -translate-x-full" />
        </div>
      )}

      {/* Image */}
      {evt.image_url ? (
        <Image
          src={evt.image_url}
          alt={evt.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          referrerPolicy="no-referrer"
          onLoad={() => setImgLoaded(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-royal-900 to-royal-950 flex items-center justify-center">
          <Calendar className="h-12 w-12 text-gold-400/40" />
        </div>
      )}

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent group-hover:from-black/100 transition-opacity duration-300" />

      {/* Badge top-left */}
      <div className="absolute top-3 left-3">
        <span className={`inline-flex items-center text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full border ${badgeStyle}`}>
          {badgeLabel}
        </span>
      </div>

      {/* Ticket price top-right */}
      {evt.ticket_price && evt.ticket_price !== '0' && (
        <div className="absolute top-3 right-12">
          <span className="bg-gold-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
            {evt.ticket_price}
          </span>
        </div>
      )}

      {/* Bookmark */}
      <button
        onClick={e => { e.preventDefault(); setSaved(s => !s); }}
        className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/25 hover:bg-black/45 text-white backdrop-blur-sm border border-white/10 transition-all"
        aria-label="Simpan"
      >
        <Heart className={`h-3.5 w-3.5 transition-all ${saved ? 'fill-red-500 text-red-500 scale-110' : 'text-white/90'}`} />
      </button>

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5">
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

// ── Skeleton ──────────────────────────────────────────────────────────────────

// ── Page content ──────────────────────────────────────────────────────────────

function EventsPageContent() {
  const router = useRouter();
  const { t } = useLocale();

  const [eventList, setEventList]         = useState<EventItem[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [page, setPage]                   = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [loadingMore, setLoadingMore]     = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Infinite scroll
  const loadNextPage = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await eventsApi.getAll({ limit: 15, page: nextPage });
      if (res.status === 'success' && res.data) {
        setEventList(prev => [...prev, ...(res.data as EventItem[])]);
        setPage(nextPage);
        const meta = (res as any).meta;
        if (meta) setTotalPages(meta.total_pages ?? 1);
      }
    } catch (e) { console.error('Failed to load more events:', e); }
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
  }, [page, totalPages, loadingMore]);

  useEffect(() => {
    eventsApi.getAll({ limit: 15, page: 1 })
      .then(res => {
        if (res.status === 'success' && res.data) {
          setEventList(res.data as EventItem[]);
          const meta = (res as any).meta;
          if (meta) { setPage(meta.page ?? 1); setTotalPages(meta.total_pages ?? 1); }
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Filter
  const filtered = eventList.filter(evt => {
    if (selectedCategory && evt.category?.toLowerCase() !== selectedCategory) return false;
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
        savedCount={0}
      />

      <main className="flex-1">
        {/* ── Dark Hero ────────────────────────────────────────────────────── */}
        <section className="relative bg-royal-950 pt-20 pb-0 overflow-hidden">
          {/* Decorative radial glows */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(214,161,71,0.08)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.05)_0%,_transparent_60%)]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Back */}
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-gold-400/70 hover:text-gold-300 transition-colors mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">Kembali</span>
            </button>

            {/* Heading + search */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gold-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                    Events &amp; Festival
                  </span>
                </div>
                <h1 className="font-manrope text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                  Festival Mendatang
                </h1>
                <p className="mt-3 text-sm sm:text-base text-white/50 font-light max-w-lg">
                  Pertunjukan budaya, sorotan musiman, dan perayaan lokal di Yogyakarta.
                </p>
              </div>

              <div className="relative w-full lg:w-[420px] shrink-0">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/40 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari event, festival, atau pertunjukan..."
                  className="w-full pl-11 pr-4 py-3.5 bg-white/6 border border-white/12 rounded-2xl text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-gold-400/50 focus:bg-white/10 transition-all backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Upcoming count chips */}
            <div className="flex items-center gap-3 pb-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-xs text-white/60">
                <Flame className="h-3 w-3 text-red-400" />
                <span><strong className="text-white">{eventList.length}</strong> Event Aktif</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/6 border border-white/10 text-xs text-white/60">
                <Calendar className="h-3 w-3 text-gold-400" />
                <span>Juli – Desember 2025</span>
              </div>
            </div>
          </div>

          {/* ── Category filter ─────────────────────────────────────────────── */}
          <div className="border-t border-white/8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex gap-2 overflow-x-auto scrollbar-none">
                {EVENT_CATEGORIES.map(cat => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={String(cat.id)}
                      onClick={() => setSelectedCategory(active ? null : cat.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border transition-all duration-150 shrink-0 ${
                        active
                          ? 'bg-gold-500 border-gold-400 text-royal-950'
                          : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── Filter bar ───────────────────────────────────────────────────── */}
        <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-stone-300 text-stone-700 hover:border-gold-400/60 transition-all shrink-0 bg-white">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
              </button>
              <div className="w-px h-5 bg-stone-200 shrink-0" />
              {/* Quick filter chips */}
              {['Gratis', 'Hari Ini', 'Akhir Pekan', 'Keluarga'].map(label => (
                <button
                  key={label}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-stone-200 text-stone-700 hover:border-gold-400/60 hover:text-stone-900 bg-white transition-all shrink-0"
                >
                  {label}
                </button>
              ))}
              <div className="flex-1" />
              <div className="shrink-0 hidden sm:flex items-center gap-1.5 text-xs text-stone-500">
                <span>Urutkan:</span>
                <span className="font-semibold text-stone-700">Terbaru</span>
                <ChevronRight className="h-3 w-3 rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Results info ──────────────────────────────────────────────────── */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 pb-2">
          <p className="text-xs text-stone-500">
            {filtered.length === eventList.length && !searchQuery && !selectedCategory
              ? `Menampilkan semua ${eventList.length} event`
              : `${filtered.length} event ditemukan`}
          </p>
        </div>

        {/* ── Events Grid ───────────────────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {Array.from({ length: 8 }).map((_, i) => <EventCardSkeleton key={i} landscape={i % 7 === 0} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gold-200 rounded-3xl bg-white text-center px-6">
              <Sparkles className="h-10 w-10 text-gold-300 mb-4" />
              <h3 className="font-manrope text-base font-bold text-royal-950 mb-1">Tidak Ada Event</h3>
              <p className="text-xs text-stone-500 max-w-xs">
                {searchQuery || selectedCategory
                  ? 'Coba kata kunci atau kategori yang berbeda.'
                  : 'Pantau terus untuk event dan festival mendatang.'}
              </p>
              {(searchQuery || selectedCategory) && (
                <button
                  onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                  className="mt-4 px-4 py-2 rounded-full bg-gold-500 text-royal-950 text-xs font-bold hover:bg-gold-400 transition-colors"
                >
                  Hapus Filter
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
                {filtered.map((evt, index) => (
                  <EventCard
                    key={evt.id}
                    evt={evt}
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

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="bg-royal-950 text-white border-t border-royal-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <span className="font-manrope font-bold text-sm tracking-[0.08em] uppercase text-white">Jogjagem</span>
            <p className="text-[10px] text-gold-100/40 font-mono tracking-widest uppercase mt-1">Pesona Yogyakarta</p>
          </div>
          <div className="text-[10px] font-mono text-gold-200/40 uppercase tracking-widest">
            © 2025 Jogjagem. All rights reserved.
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
