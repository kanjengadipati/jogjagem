'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { articles } from '@/lib/api';
import type { Article } from '@/types';
import {
  Search, Clock, ChevronRight, MapPin, UtensilsCrossed,
  Landmark, Calendar, Star, BookOpen, ArrowRight,
} from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BlogMessages {
  title: string;
  subtitle: string;
  all_articles: string;
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
}> = {
  panduan: {
    icon: <MapPin className="w-5 h-5" />,
    bg: 'bg-amber-50 text-amber-700',
    descId: 'Tempat yang belum banyak diketahui wisatawan.',
    descEn: "Places most tourists haven't discovered yet.",
  },
  kuliner: {
    icon: <UtensilsCrossed className="w-5 h-5" />,
    bg: 'bg-orange-50 text-orange-700',
    descId: 'Rasa lokal yang wajib kamu coba saat di Jogja.',
    descEn: 'Local flavors you must try in Jogja.',
  },
  budaya: {
    icon: <Landmark className="w-5 h-5" />,
    bg: 'bg-blue-50 text-blue-700',
    descId: 'Cerita, tradisi, dan warisan budaya Yogyakarta.',
    descEn: "Stories, traditions, and Yogyakarta's cultural heritage.",
  },
  itinerary: {
    icon: <Calendar className="w-5 h-5" />,
    bg: 'bg-green-50 text-green-700',
    descId: 'Rencana perjalanan siap pakai untuk semua tipe traveler.',
    descEn: 'Ready-to-use itineraries for every type of traveler.',
  },
  alam: {
    icon: <Star className="w-5 h-5" />,
    bg: 'bg-emerald-50 text-emerald-700',
    descId: 'Alam, perbukitan, dan suasana tenang untuk melepas penat.',
    descEn: 'Nature, hills, and peaceful scenery to unwind.',
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

// ─── Featured Article ──────────────────────────────────────────────────────────
function FeaturedArticle({ article, locale, messages }: {
  article: Article;
  locale: string;
  messages: BlogMessages;
}) {
  return (
    <Link
      href={`/${locale}/blog/${article.slug}`}
      className="group relative flex flex-col justify-end overflow-hidden rounded-2xl min-h-72 md:min-h-96 bg-royal-900"
    >
      {article.cover_image && (
        <Image
          src={article.cover_image}
          alt={article.title}
          fill
          className="object-cover opacity-70 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105 transition-transform"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      <div className="relative p-6 md:p-8 space-y-3">
        {article.category && (
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-gold-400 text-royal-900">
            {getCatLabel(article.category, messages, locale)}
          </span>
        )}
        <h2 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-sm text-white/70 leading-relaxed line-clamp-2 max-w-lg">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-white/50 pt-1">
          {article.read_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.read_time_minutes} {messages.min_read}
            </span>
          )}
          {article.published_at && (
            <span>• {formatDateShort(article.published_at, locale)}</span>
          )}
          <span className="ml-auto flex items-center gap-1 font-semibold text-gold-400 group-hover:gap-2 transition-all">
            {messages.read_more} <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Article Card ──────────────────────────────────────────────────────────────
function ArticleCard({ article, locale, messages }: {
  article: Article;
  locale: string;
  messages: BlogMessages;
}) {
  return (
    <Link
      href={`/${locale}/blog/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-white hover:shadow-md transition-all border border-gold-100/60"
    >
      <div className="relative aspect-[16/10] bg-gold-50 overflow-hidden">
        {article.cover_image ? (
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gold-100 to-gold-50">
            <BookOpen className="w-8 h-8 text-gold-300" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        {article.category && (
          <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-gold-400 text-royal-900">
            {getCatLabel(article.category, messages, locale)}
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="text-sm font-bold text-royal-900 leading-snug line-clamp-2 group-hover:text-gold-600 transition-colors">
          {article.title}
        </h3>
        <div className="mt-auto flex items-center gap-2 text-[10px] text-royal-700/50 font-medium pt-2">
          {article.read_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.read_time_minutes} {messages.min_read}
            </span>
          )}
          {article.published_at && (
            <span>• {formatDateShort(article.published_at, locale)}</span>
          )}
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
      className="group flex items-start gap-3 p-4 rounded-xl bg-white border border-gold-100/60 hover:border-gold-400 hover:shadow-sm transition-all text-left cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${meta?.bg ?? 'bg-gold-50 text-gold-700'}`}>
        {meta?.icon ?? <BookOpen className="w-5 h-5" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-royal-900 capitalize group-hover:text-gold-700 transition-colors">
            {label}
          </span>
          <ChevronRight className="w-4 h-4 text-gold-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
        </div>
        {desc && <p className="text-xs text-royal-700/60 mt-0.5 line-clamp-2 leading-relaxed">{desc}</p>}
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
  return (
    <Link
      href={`/${locale}/blog/${article.slug}`}
      className="group flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gold-100/60 hover:border-gold-400 hover:shadow-sm transition-all"
    >
      <div className="min-w-0">
        <p className="text-sm font-bold text-royal-900 leading-tight line-clamp-1 group-hover:text-gold-700 transition-colors">
          {article.title}
        </p>
        {article.excerpt && (
          <p className="text-xs text-royal-700/50 mt-0.5 line-clamp-1">{article.excerpt}</p>
        )}
        {article.read_time_minutes && (
          <span className="inline-flex items-center gap-1 mt-1.5 text-[10px] text-royal-700/40 font-medium">
            <Clock className="w-3 h-3" />
            {article.read_time_minutes} {messages.min_read}
          </span>
        )}
      </div>
      <ArrowRight className="w-4 h-4 text-gold-400 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
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
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const isSearching = search.length > 0 || activeCategory !== '';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await articles.getAll({ limit: 50 });
      const list = (res as { data?: Article[] }).data ?? [];
      setAll(list);
      setFiltered(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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
  const latestArticles = all.slice(0, 6);
  const itineraries = all.filter(a => a.category === 'itinerary').slice(0, 3);
  const categories = Object.keys(CATEGORY_KEYS).filter(cat => all.some(a => a.category === cat));

  const isEn = locale === 'en';

  function selectCategory(cat: string) {
    setActiveCategory(prev => prev === cat ? '' : cat);
    // Scroll to articles section
    document.getElementById('articles-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="min-h-screen" style={{ background: '#F7F3EE' }}>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gold-100">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: text + search + categories */}
            <div className="space-y-5">
              <Link href={`/${locale}`} className="text-xs text-royal-700/50 hover:text-gold-600 transition flex items-center gap-1">
                ← Jogjagem
              </Link>
              <div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-royal-900 leading-tight tracking-tight font-display">
                  {isEn ? (
                    <>Stories & Guides<br /><span className="text-gold-500">from Jogja</span></>
                  ) : (
                    <>Cerita & Panduan<br /><span className="text-gold-500">dari Jogja</span></>
                  )}
                </h1>
                <p className="mt-3 text-sm text-royal-700/60 leading-relaxed max-w-sm">
                  {messages.subtitle}
                </p>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-royal-700/30 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={messages.search_placeholder}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gold-200 focus:border-gold-400 outline-none text-sm font-medium bg-gold-50/50 focus:bg-white transition"
                />
              </div>

              {/* Category chips */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => {
                    const key = CATEGORY_KEYS[cat];
                    return (
                      <button
                        key={cat}
                        onClick={() => selectCategory(cat)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer capitalize border ${
                          activeCategory === cat
                            ? 'bg-gold-400 text-royal-900 border-gold-400'
                            : 'bg-white text-royal-700 border-gold-200 hover:border-gold-400'
                        }`}
                      >
                        {CATEGORY_META[cat]?.icon && (
                          <span className="w-3 h-3">{CATEGORY_META[cat].icon}</span>
                        )}
                        {messages[key]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right: hero image */}
            <div className="hidden md:block relative h-64 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1604999333679-b86d54738315?w=800&q=80"
                alt="Yogyakarta"
                fill
                className="object-cover"
                sizes="50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-white/20" />
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH/FILTER RESULTS ──────────────────────────────────────── */}
      {isSearching && (
        <section id="articles-section" className="max-w-6xl mx-auto px-4 pt-8 pb-4">
          <div className="flex items-center justify-between mb-4">
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
            <div className="flex items-center gap-2 py-12 justify-center text-royal-700/40">
              <div className="w-4 h-4 border-2 border-gold-300 border-t-gold-500 rounded-full animate-spin" />
              <span className="text-sm">{messages.loading}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-royal-700/40">
              <BookOpen className="w-8 h-8" />
              <p className="text-sm">{messages.empty}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(a => (
                <ArticleCard key={a.id} article={a} locale={locale} messages={messages} />
              ))}
            </div>
          )}
        </section>
      )}

      {!isSearching && (
        <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">

          {/* ── FEATURED ARTICLE ───────────────────────────────────────── */}
          {featured && !loading && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">
                  {isEn ? 'Featured Story' : 'Cerita Pilihan'}
                </span>
                <div className="flex-1 h-px bg-gold-200" />
              </div>
              <FeaturedArticle article={featured} locale={locale} messages={messages} />
            </section>
          )}

          {/* ── EXPLORE BY INTEREST ────────────────────────────────────── */}
          {categories.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">
                  {isEn ? 'Explore by Interest' : 'Jelajahi Berdasarkan Minat'}
                </span>
                <div className="flex-1 h-px bg-gold-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          {latestArticles.length > 0 && (
            <section id="articles-section">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">
                    {isEn ? 'Latest Articles' : 'Artikel Terbaru'}
                  </span>
                  <div className="w-16 h-px bg-gold-200" />
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
                <div className="flex items-center gap-2 py-12 justify-center text-royal-700/40">
                  <div className="w-4 h-4 border-2 border-gold-300 border-t-gold-500 rounded-full animate-spin" />
                  <span className="text-sm">{messages.loading}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {latestArticles.map(a => (
                    <ArticleCard key={a.id} article={a} locale={locale} messages={messages} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ── ITINERARY STRIP ────────────────────────────────────────── */}
          {itineraries.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gold-500">
                    {isEn ? 'Itinerary Inspiration' : 'Inspirasi Itinerary'}
                  </span>
                  <div className="w-16 h-px bg-gold-200" />
                </div>
                <button
                  onClick={() => selectCategory('itinerary')}
                  className="flex items-center gap-1 text-xs font-semibold text-gold-600 hover:text-gold-700 transition cursor-pointer"
                >
                  {isEn ? 'See all itineraries' : 'Lihat semua itinerary'}
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {itineraries.map(a => (
                  <ItineraryCard key={a.id} article={a} locale={locale} messages={messages} />
                ))}
              </div>
            </section>
          )}

          {/* ── CTA STRIP ──────────────────────────────────────────────── */}
          <section>
            <div className="rounded-2xl bg-royal-900 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <p className="text-base font-bold text-white">
                  {isEn ? "Didn't find what you're looking for?" : 'Belum menemukan yang dicari?'}
                </p>
                <p className="text-sm text-white/50 mt-1">
                  {isEn
                    ? 'Explore the best destinations in Yogyakarta and plan your trip now.'
                    : 'Temukan destinasi terbaik di Yogyakarta dan rencanakan perjalananmu sekarang.'}
                </p>
              </div>
              <Link
                href={`/${locale}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-400 text-royal-900 text-sm font-bold hover:bg-gold-300 transition whitespace-nowrap"
              >
                {isEn ? 'Explore Destinations' : 'Jelajahi Destinasi'} →
              </Link>
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
