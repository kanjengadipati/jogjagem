'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { articles } from '@/lib/api';
import type { Article } from '@/types';
import {
  Search, Clock, ChevronRight, MapPin, UtensilsCrossed,
  Landmark, Calendar, Star, BookOpen, ArrowRight, PenLine,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BlogMessages {
  title: string;
  subtitle: string;
  all_articles: string;
  load_more: string;
  read_more: string;
  min_read: string;
  by: string;
  loading: string;
  empty: string;
  search_placeholder: string;
  cat_panduan: string;
  cat_itinerary: string;
  cat_kuliner: string;
  cat_budaya: string;
  cat_alam: string;
  cat_tips: string;
  cat_lainnya: string;
}

const CATEGORY_KEYS: Record<string, keyof BlogMessages> = {
  panduan: 'cat_panduan',
  itinerary: 'cat_itinerary',
  kuliner: 'cat_kuliner',
  budaya: 'cat_budaya',
  alam: 'cat_alam',
  tips: 'cat_tips',
  lainnya: 'cat_lainnya',
};

// Category metadata — icon, description (bilingual), bg color
const CATEGORY_META: Record<string, {
  icon: React.ReactNode;
  bg: string;
  descId: string;
  descEn: string;
  fallbackImage: string;
}> = {
  panduan: {
    icon: <MapPin className="w-4 h-4" />,
    bg: 'bg-amber-50 text-amber-700',
    descId: 'Tempat yang belum banyak diketahui wisatawan.',
    descEn: "Places most tourists haven't discovered yet.",
    fallbackImage: '/bg-blog.jpg',
  },
  kuliner: {
    icon: <UtensilsCrossed className="w-4 h-4" />,
    bg: 'bg-orange-50 text-orange-700',
    descId: 'Rasa lokal yang wajib kamu coba saat di Jogja.',
    descEn: 'Local flavors you must try in Jogja.',
    fallbackImage: '/bg-blog.jpg',
  },
  budaya: {
    icon: <Landmark className="w-4 h-4" />,
    bg: 'bg-blue-50 text-blue-700',
    descId: 'Cerita, tradisi, dan warisan budaya Yogyakarta.',
    descEn: "Stories, traditions, and Yogyakarta's cultural heritage.",
    fallbackImage: '/bg-blog.jpg',
  },
  itinerary: {
    icon: <Calendar className="w-4 h-4" />,
    bg: 'bg-green-50 text-green-700',
    descId: 'Rencana perjalanan siap pakai untuk semua tipe traveler.',
    descEn: 'Ready-to-use itineraries for every type of traveler.',
    fallbackImage: '/merapi.jpg',
  },
  alam: {
    icon: <Star className="w-4 h-4" />,
    bg: 'bg-emerald-50 text-emerald-700',
    descId: 'Alam, perbukitan, dan suasana tenang untuk melepas penat.',
    descEn: 'Nature, hills, and peaceful scenery to unwind.',
    fallbackImage: '/merapi.jpg',
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatDateShort(dateStr?: string, locale = 'id') {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getCatLabel(cat: string | undefined, messages: BlogMessages, locale: string) {
  if (!cat) return '';
  const key = CATEGORY_KEYS[cat];
  return key ? messages[key] : cat;
}

// Stable pseudo-random card orientation so masonry stays consistent across renders
function orientationOf(id: string): 'landscape' | 'portrait' {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % 5 < 2 ? 'portrait' : 'landscape';
}

// ─── Category Badge ────────────────────────────────────────────────────────────
function CategoryBadge({ cat, messages, locale, className = '' }: {
  cat?: string;
  messages: BlogMessages;
  locale: string;
  className?: string;
}) {
  if (!cat) return null;
  return (
    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gold-400 text-royal-900 ${className}`}>
      {getCatLabel(cat, messages, locale)}
    </span>
  );
}

// ─── Meta Row ──────────────────────────────────────────────────────────────────
function MetaRow({ article, messages, locale, className = '', tone = 'dark' }: {
  article: Article;
  messages: BlogMessages;
  locale: string;
  className?: string;
  tone?: 'dark' | 'light';
}) {
  const toneClass = tone === 'light' ? 'text-white/70' : 'text-royal-700/50';
  return (
    <div className={`flex items-center gap-2 text-xs ${toneClass} ${className}`}>
      {article.published_at && <span>{formatDateShort(article.published_at, locale)}</span>}
      {article.read_time_minutes && (
        <>
          <span className="w-1 h-1 rounded-full bg-gold-400" />
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {article.read_time_minutes} {messages.min_read}
          </span>
        </>
      )}
    </div>
  );
}

// ─── Featured Article ──────────────────────────────────────────────────────────
function FeaturedArticle({ article, locale, messages }: {
  article: Article;
  locale: string;
  messages: BlogMessages;
}) {
  const catMeta = article.category ? CATEGORY_META[article.category] : undefined;
  const imgSrc = article.cover_image || catMeta?.fallbackImage || '/merapi.jpg';

  return (
    <Link
      href={`/${locale}/blog/${article.slug}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-3xl bg-royal-900 shadow-xl lg:min-h-[460px]"
      style={{ minHeight: '320px' }}
    >
      {imgSrc && (
        <Image
          src={imgSrc}
          alt={article.title}
          fill
          className="object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
          sizes="(max-width: 1024px) 100vw, 66vw"
          priority
        />
      )}
      {/* Bottom gradient — stronger */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 via-40% to-transparent" />

      <div className="relative p-6 md:p-9 space-y-3">
        <CategoryBadge cat={article.category} messages={messages} locale={locale} />
        <h2 className="font-manrope text-2xl md:text-3xl lg:text-4xl font-extrabold text-white leading-tight line-clamp-3 max-w-2xl group-hover:text-gold-200 transition-colors">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-sm md:text-[15px] text-white/70 leading-relaxed line-clamp-2 max-w-2xl">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-white/60 pt-1">
          {article.author && (
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-gold-400/20 text-gold-300 flex items-center justify-center">
                <PenLine className="w-3 h-3" />
              </span>
              {article.author}
            </span>
          )}
          {article.published_at && (
            <span>• {formatDateShort(article.published_at, locale)}</span>
          )}
          {article.read_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.read_time_minutes} {messages.min_read}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5 font-semibold text-gold-400 group-hover:gap-3 transition-all">
            {messages.read_more} <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Latest Article List Item (editorial sidebar) ──────────────────────────────
function LatestListItem({ article, locale, messages }: {
  article: Article;
  locale: string;
  messages: BlogMessages;
}) {
  const catMeta = article.category ? CATEGORY_META[article.category] : undefined;
  const imgSrc = article.cover_image || catMeta?.fallbackImage || null;

  return (
    <Link
      href={`/${locale}/blog/${article.slug}`}
      className="group flex items-center gap-4 p-3 -mx-3 rounded-2xl hover:bg-white transition-all"
    >
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-gold-50 flex-shrink-0">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="96px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold-100 to-gold-50">
            <BookOpen className="w-6 h-6 text-gold-300" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        {article.category && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-gold-600">
            {getCatLabel(article.category, messages, locale)}
          </span>
        )}
        <h3 className="font-manrope text-sm font-bold text-royal-900 leading-snug line-clamp-2 mt-0.5 group-hover:text-gold-600 transition-colors">
          {article.title}
        </h3>
        <div className="flex items-center gap-1.5 text-[11px] text-royal-700/50 mt-1.5">
          <span>{formatDateShort(article.published_at, locale)}</span>
          {article.read_time_minutes && (
            <>
              <span className="w-1 h-1 rounded-full bg-gold-400" />
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" /> {article.read_time_minutes} {messages.min_read}
              </span>
            </>
          )}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-gold-400 flex-shrink-0 -ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
    </Link>
  );
}

// ─── Article Card ──────────────────────────────────────────────────────────────
function ArticleCard({ article, locale, messages, orientation = 'landscape' }: {
  article: Article;
  locale: string;
  messages: BlogMessages;
  orientation?: 'landscape' | 'portrait';
}) {
  const catMeta = article.category ? CATEGORY_META[article.category] : undefined;
  const imgSrc = article.cover_image || catMeta?.fallbackImage || null;
  const minHeight = orientation === 'portrait' ? 400 : 270;

  return (
    <Link
      href={`/${locale}/blog/${article.slug}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-3xl bg-royal-900 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
      style={{ minHeight }}
    >
      {imgSrc ? (
        <Image
          src={imgSrc}
          alt={article.title}
          fill
          className="object-cover opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-royal-800 to-royal-900">
          <BookOpen className="w-10 h-10 text-gold-400/40" />
        </div>
      )}
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 via-35% to-black/5" />

      <div className="relative p-5 space-y-2">
        <CategoryBadge cat={article.category} messages={messages} locale={locale} />
        <h3 className="font-manrope text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-gold-200 transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-[13px] text-white/75 leading-relaxed line-clamp-2">
            {article.excerpt}
          </p>
        )}
        <div className="pt-2 border-t border-white/15 flex items-center justify-between">
          <MetaRow article={article} messages={messages} locale={locale} tone="light" />
          <span className="flex items-center gap-1 text-[11px] font-semibold text-gold-400 opacity-0 group-hover:opacity-100 transition-opacity">
            {messages.read_more} <ArrowRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Category Explore Card ─────────────────────────────────────────────────────
function CategoryCard({ cat, label, locale, meta, count, onSelect }: {
  cat: string;
  label: string;
  locale: string;
  meta: typeof CATEGORY_META[string] | undefined;
  count: number;
  onSelect: (cat: string) => void;
}) {
  const desc = meta
    ? (locale === 'en' ? meta.descEn : meta.descId)
    : '';
  return (
    <button
      onClick={() => onSelect(cat)}
      className="group relative overflow-hidden rounded-3xl bg-white border border-royal-900/5 p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-gold-400/50 transition-all duration-300 text-left cursor-pointer"
    >
      <div className="absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gold-100/60 blur-xl transition-opacity group-hover:opacity-100 opacity-60" />
      <div className={`relative w-11 h-11 rounded-2xl flex items-center justify-center ${meta?.bg ?? 'bg-gold-50 text-gold-700'}`}>
        {meta?.icon ?? <BookOpen className="w-4 h-4" />}
      </div>
      <div className="relative mt-4">
        <div className="flex items-center justify-between gap-2">
          <span className="font-manrope text-sm font-bold text-royal-900 capitalize group-hover:text-gold-700 transition-colors">
            {label}
          </span>
        </div>
        {desc && <p className="text-xs text-royal-700/60 mt-1 line-clamp-2 leading-relaxed">{desc}</p>}
        <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-gold-600">
          {locale === 'en' ? 'Explore' : 'Jelajahi'}
          <span className="flex items-center transition-transform group-hover:translate-x-0.5">
            <ArrowRight className="w-3 h-3" />
          </span>
          <span className="ml-auto text-[10px] text-royal-700/40 font-medium">{count} {locale === 'en' ? 'articles' : 'artikel'}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Itinerary Strip Card ──────────────────────────────────────────────────────
function ItineraryCard({ article, locale, messages }: {
  article: Article;
  locale: string;
  messages: BlogMessages;
}) {
  const catMeta = article.category ? CATEGORY_META[article.category] : undefined;
  const imgSrc = article.cover_image || catMeta?.fallbackImage || null;

  return (
    <Link
      href={`/${locale}/blog/${article.slug}`}
      className="group relative overflow-hidden rounded-3xl bg-royal-900 hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute inset-0">
        {imgSrc ? (
          <Image src={imgSrc} alt={article.title} fill className="object-cover opacity-40 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700" sizes="(max-width: 640px) 100vw, 33vw" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-royal-800 to-royal-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>
      <div className="relative p-5 min-h-[140px] flex flex-col justify-end">
        <span className="text-[9px] font-bold uppercase tracking-widest text-gold-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {getCatLabel('itinerary', messages, locale)}
        </span>
        <h3 className="mt-1.5 font-manrope text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-gold-200 transition-colors">
          {article.title}
        </h3>
        {article.read_time_minutes && (
          <span className="mt-2 flex items-center gap-1 text-[10px] text-white/50 font-medium">
            <Clock className="w-3 h-3" /> {article.read_time_minutes} {messages.min_read}
          </span>
        )}
      </div>
    </Link>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function BlogListClient({
  locale,
  messages,
}: {
  locale: string;
  messages: BlogMessages;
}) {
  const [all, setAll] = useState<Article[]>([]);
  const [filtered, setFiltered] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const isSearching = search.length > 0 || activeCategory !== '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await articles.getAll({ limit: 10, page: 1 });
      const list = (res as { data?: Article[] }).data ?? [];
      setAll(list);
      setFiltered(list);
      setPage(1);
      const meta = (res as { meta?: { total_pages?: number } }).meta;
      setTotalPages(meta?.total_pages ?? 1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadMore = async () => {
    if (loadingMore || page >= totalPages) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await articles.getAll({ limit: 10, page: nextPage });
      const list = (res as { data?: Article[] }).data ?? [];
      setAll(prev => [...prev, ...list]);
      setPage(nextPage);
      const meta = (res as { meta?: { total_pages?: number } }).meta;
      if (meta?.total_pages) setTotalPages(meta.total_pages);
    } catch {
      // silent
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    let list = all;
    if (activeCategory) list = list.filter(a => a.category === activeCategory);
    if (search) list = list.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.excerpt ?? '').toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [search, activeCategory, all]);

  const featured = all[0] ?? null;
  const gridArticles = featured ? all.filter(a => a.id !== featured.id) : all;
  const latestInSidebar = all.slice(1, 5);
  const itineraries = all.filter(a => a.category === 'itinerary').slice(0, 3);
  const categories = Object.keys(CATEGORY_KEYS).filter(cat => all.some(a => a.category === cat));

  const isEn = locale === 'en';

  function selectCategory(cat: string) {
    setActiveCategory(prev => prev === cat ? '' : cat);
    document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F3EE' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ minHeight: '420px' }}>
        <Image
          src="/pantai.png"
          alt="Yogyakarta"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(15,16,12,0.88) 0%, rgba(15,16,12,0.6) 35%, rgba(15,16,12,0.2) 65%, rgba(15,16,12,0) 100%), linear-gradient(to top, rgba(15,16,12,0.55) 0%, rgba(15,16,12,0.15) 45%, rgba(15,16,12,0) 80%)' }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-lg space-y-6">
            <Link href={`/${locale}`} className="text-xs text-white/40 hover:text-gold-400 transition flex items-center gap-1">
              ← Jogjagem
            </Link>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-400">
                {isEn ? 'The Jogjagem Journal' : 'Jurnal Jogjagem'}
              </span>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold text-white leading-[1.08] tracking-tight font-display">
                {isEn ? (
                  <>Stories & Guides<br />from <span className="text-gold-400">Jogja</span></>
                ) : (
                  <>Cerita & Panduan<br />dari <span className="text-gold-400">Jogja</span></>
                )}
              </h1>
              <p className="mt-4 text-sm text-white/60 leading-relaxed">
                {isEn
                  ? 'Discover places few tourists know, flavors worth trying, and how to enjoy Yogyakarta like a local.'
                  : 'Temukan tempat yang belum banyak diketahui, rasa yang layak dicoba, dan cara menikmati Yogyakarta seperti orang lokal.'}
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-royal-700/40 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={isEn ? 'Explore places, food, itinerary, or stories...' : 'Mau menjelajah apa hari ini? Cari tempat, kuliner, itinerary, atau cerita...'}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-white/10 focus:border-gold-400 outline-none text-sm font-medium bg-white/10 backdrop-blur-md focus:bg-white/15 text-white placeholder-white/40 transition shadow-lg shadow-black/20"
              />
            </div>

            {/* Category chips */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {categories.map(cat => {
                  const key = CATEGORY_KEYS[cat];
                  return (
                    <button
                      key={cat}
                      onClick={() => selectCategory(cat)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold transition cursor-pointer capitalize border ${
                        activeCategory === cat
                          ? 'bg-gold-400 text-royal-900 border-gold-400 shadow-lg shadow-gold-500/20'
                          : 'bg-white/5 text-white/70 border-white/10 hover:border-gold-400 hover:text-gold-400'
                      }`}
                    >
                      {CATEGORY_META[cat]?.icon && (
                        <span className="w-4 h-4 flex items-center justify-center flex-shrink-0">{CATEGORY_META[cat].icon}</span>
                      )}
                      <span>{messages[key]}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── SEARCH/FILTER RESULTS ──────────────────────────────────────── */}
      {isSearching && (
        <section id="articles-section" className="max-w-6xl mx-auto px-4 pt-10 pb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-royal-700/50">
              {filtered.length} {isEn ? 'results' : 'hasil'}
            </h2>
            <button
              onClick={() => { setSearch(''); setActiveCategory(''); }}
              className="text-xs font-semibold text-gold-600 hover:text-gold-700 transition cursor-pointer"
            >
              {isEn ? 'Clear filter' : 'Hapus filter'} ×
            </button>
          </div>
          {loading ? (
            <div className="flex items-center gap-2 py-16 justify-center text-royal-700/40">
              <div className="w-4 h-4 border-2 border-gold-300 border-t-gold-500 rounded-full animate-spin" />
              <span className="text-sm">{messages.loading}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-royal-700/40">
              <BookOpen className="w-9 h-9" />
              <p className="text-sm">{messages.empty}</p>
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
              {filtered.map(a => (
                <div key={a.id} className="mb-5 break-inside-avoid">
                  <ArticleCard article={a} locale={locale} messages={messages} orientation={orientationOf(a.id)} />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {!isSearching && (
        <div className="max-w-6xl mx-auto px-4 py-10 space-y-14">

          {/* ── FEATURED + LATEST EDITORIAL SPLIT ──────────────────────── */}
          {featured && !loading && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-600">
                  {isEn ? 'Featured Story' : 'Cerita Pilihan'}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-gold-300 to-transparent" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-6">
                <FeaturedArticle article={featured} locale={locale} messages={messages} />

                {latestInSidebar.length > 0 && (
                  <div className="bg-white/60 backdrop-blur-sm border border-royal-900/5 rounded-3xl p-4 lg:p-5 flex flex-col justify-center">
                    <div className="flex items-center gap-2 px-3 pt-1 pb-3">
                      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-royal-700/50">
                        {isEn ? 'Fresh Off the Press' : 'Terbaru dari Redaksi'}
                      </span>
                      <div className="flex-1 h-px bg-royal-900/5" />
                    </div>
                    <div className="divide-y divide-royal-900/5">
                      {latestInSidebar.map(a => (
                        <LatestListItem key={a.id} article={a} locale={locale} messages={messages} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── EXPLORE BY INTEREST ────────────────────────────────────── */}
          {categories.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-600">
                  {isEn ? 'Explore by Interest' : 'Jelajahi Berdasarkan Minat'}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-gold-300 to-transparent" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map(cat => (
                  <CategoryCard
                    key={cat}
                    cat={cat}
                    label={messages[CATEGORY_KEYS[cat]]}
                    locale={locale}
                    meta={CATEGORY_META[cat]}
                    count={all.filter(a => a.category === cat).length}
                    onSelect={selectCategory}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── LATEST ARTICLES ────────────────────────────────────────── */}
          {gridArticles.length > 0 && (
            <section id="articles-section">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-600">
                    {isEn ? 'Latest Articles' : 'Artikel Terbaru'}
                  </span>
                  <div className="w-16 h-px bg-gold-300" />
                </div>
                <button
                  onClick={() => setActiveCategory('')}
                  className="flex items-center gap-1 text-xs font-semibold text-gold-600 hover:text-gold-700 transition cursor-pointer"
                >
                  {messages.all_articles}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {loading ? (
                <div className="flex items-center gap-2 py-16 justify-center text-royal-700/40">
                  <div className="w-4 h-4 border-2 border-gold-300 border-t-gold-500 rounded-full animate-spin" />
                  <span className="text-sm">{messages.loading}</span>
                </div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">
                  {gridArticles.map(a => (
                    <div key={a.id} className="mb-5 break-inside-avoid">
                      <ArticleCard article={a} locale={locale} messages={messages} orientation={orientationOf(a.id)} />
                    </div>
                  ))}
                </div>
              )}

              {!loading && page < totalPages && (
                <div className="mt-10 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 disabled:opacity-50 text-white rounded-full font-semibold text-xs transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                        <span>{messages.loading}</span>
                      </>
                    ) : (
                      <span>{messages.load_more}</span>
                    )}
                  </button>
                </div>
              )}
            </section>
          )}

          {/* ── ITINERARY STRIP ────────────────────────────────────────── */}
          {itineraries.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-gold-600">
                    {isEn ? 'Itinerary Inspiration' : 'Inspirasi Itinerary'}
                  </span>
                  <div className="w-16 h-px bg-gold-300" />
                </div>
                <button
                  onClick={() => selectCategory('itinerary')}
                  className="flex items-center gap-1 text-xs font-semibold text-gold-600 hover:text-gold-700 transition cursor-pointer"
                >
                  {isEn ? 'See all itineraries' : 'Lihat semua itinerary'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {itineraries.map(a => (
                  <ItineraryCard key={a.id} article={a} locale={locale} messages={messages} />
                ))}
              </div>
            </section>
          )}

          {/* ── CTA STRIP ──────────────────────────────────────────────── */}
          <section>
            <div className="relative overflow-hidden rounded-3xl bg-royal-900 px-6 py-10 md:px-12 md:py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full bg-gold-500/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-10 w-64 h-64 rounded-full bg-gold-500/5 blur-3xl" />
              <div className="relative">
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-400">
                  {isEn ? 'Plan your trip' : 'Rencanakan Perjalananmu'}
                </span>
                <p className="mt-3 font-manrope text-2xl md:text-3xl font-extrabold text-white leading-tight">
                  {isEn ? "Didn't find what you're looking for?" : 'Belum menemukan yang dicari?'}
                </p>
                <p className="mt-2 text-sm text-white/50">
                  {isEn
                    ? 'Explore the best destinations in Yogyakarta and plan your trip now.'
                    : 'Temukan destinasi terbaik di Yogyakarta dan rencanakan perjalananmu sekarang.'}
                </p>
              </div>
              <Link
                href={`/${locale}`}
                className="relative flex items-center gap-2 px-6 py-3 rounded-2xl bg-gold-400 text-royal-900 text-sm font-bold hover:bg-gold-300 transition whitespace-nowrap shadow-lg shadow-gold-500/20 group"
              >
                {isEn ? 'Explore Destinations' : 'Jelajahi Destinasi'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
