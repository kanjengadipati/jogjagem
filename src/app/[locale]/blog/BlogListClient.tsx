'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { articles } from '@/lib/api';
import type { Article } from '@/types';
import { BookOpen, Clock, Search, ChevronRight, ArrowLeft } from 'lucide-react';

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

function formatDate(dateStr?: string, locale = 'id') {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function ArticleCard({
  article,
  locale,
  messages,
}: {
  article: Article;
  locale: string;
  messages: BlogMessages;
}) {
  const catKey = article.category ? CATEGORY_KEYS[article.category] : undefined;
  const catLabel = catKey ? messages[catKey] : article.category ?? '';

  return (
    <Link
      href={`/${locale}/blog/${article.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden"
    >
      {/* Cover */}
      <div className="relative w-full aspect-[16/9] bg-gray-100 overflow-hidden">
        {article.cover_image ? (
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <BookOpen className="w-10 h-10 text-primary/30" />
          </div>
        )}
        {catLabel && (
          <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-primary shadow-sm">
            {catLabel}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-3">
        <h2 className="text-base font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">{article.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between text-[11px] text-gray-400 font-medium pt-3 border-t border-gray-50">
          <div className="flex items-center gap-3">
            {article.read_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {article.read_time_minutes} {messages.min_read}
              </span>
            )}
            {article.author && (
              <span>{messages.by} {article.author}</span>
            )}
          </div>
          {article.published_at && (
            <span>{formatDate(article.published_at, locale)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

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

  const categories = Object.keys(CATEGORY_KEYS).filter(cat =>
    all.some(a => a.category === cat)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <Link href={`/${locale}`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition mb-6">
            <ArrowLeft className="w-4 h-4" />
            Jogjagem
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
            {messages.title}
          </h1>
          <p className="text-gray-500 text-base max-w-xl">{messages.subtitle}</p>

          {/* Search */}
          <div className="relative mt-6 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={messages.search_placeholder}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary outline-none text-sm font-medium bg-gray-50 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory('')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeCategory === ''
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
              }`}
            >
              {messages.all_articles}
            </button>
            {categories.map(cat => {
              const key = CATEGORY_KEYS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(activeCategory === cat ? '' : cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer capitalize ${
                    activeCategory === cat
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-primary hover:text-primary'
                  }`}
                >
                  {messages[key]}
                </button>
              );
            })}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-2">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span className="text-sm font-medium">{messages.loading}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <BookOpen className="w-10 h-10" />
            <p className="text-sm font-medium">{messages.empty}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                locale={locale}
                messages={messages}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
