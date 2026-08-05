'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { MapPin, Star, ChevronRight, ArrowLeft, Filter } from 'lucide-react';
import Header from '@/components/Header';
import { toSlug } from '@/lib/slug';
import { useLocale } from '@/contexts/LocaleContext';

interface Destination {
  id: string;
  name: string;
  tagline: string;
  category: string;
  sub_region: string;
  rating: number;
  review_count: number;
  images: Array<{ url: string }> | string[];
  badge?: string;
}

interface CategoryCount {
  category: string;
  count: number;
}

interface LocationData {
  region: string;
  region_slug: string;
  total_count: number;
  destinations: Destination[];
  categories: CategoryCount[];
}

const REGION_DISPLAY: Record<string, { id: string; en: string }> = {
  'kota-yogyakarta': { id: 'Kota Yogyakarta', en: 'Yogyakarta City' },
  'sleman':          { id: 'Sleman',          en: 'Sleman' },
  'bantul':          { id: 'Bantul',           en: 'Bantul' },
  'kulon-progo':     { id: 'Kulon Progo',      en: 'Kulon Progo' },
  'gunungkidul':     { id: 'Gunungkidul',      en: 'Gunungkidul' },
  'near-yogyakarta': { id: 'Dekat Yogyakarta', en: 'Near Yogyakarta' },
};

function getImageUrl(images: Destination['images']): string | null {
  if (!images || images.length === 0) return null;
  const first = images[0];
  if (typeof first === 'string') return first;
  return (first as { url: string }).url || null;
}

export default function LocationPageClient({
  region,
  locale,
  initialData,
}: {
  region: string;
  locale: string;
  initialData: LocationData | null;
}) {
  const router = useRouter();
  const { t } = useLocale();
  const isEn = locale === 'en';
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const data = initialData;
  const regionName = REGION_DISPLAY[region]?.[isEn ? 'en' : 'id'] ?? region;
  const destinations = data?.destinations ?? [];
  const categories = data?.categories ?? [];

  const filtered = destinations.filter((d) => {
    const matchCat = !activeCategory || d.category === activeCategory;
    const matchSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <Header activeTab="discover" setActiveTab={() => router.push('/')} savedCount={0} isOverHero={false} />

      {/* Hero */}
      <section className="relative bg-royal-950 pt-10 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(214,161,71,0.10)_0%,_transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.push('/destinations')}
            className="flex items-center gap-1.5 text-gold-400/70 hover:text-gold-300 transition-colors mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium">
              {isEn ? 'All Destinations' : 'Semua Destinasi'}
            </span>
          </button>

          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-gold-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
              {isEn ? 'Region' : 'Wilayah'}
            </span>
          </div>
          <h1 className="font-manrope text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            {regionName}
          </h1>
          <p className="mt-2 text-white/50 text-sm">
            {data?.total_count ?? 0} {isEn ? 'destinations' : 'destinasi'}
          </p>
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-[64px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 overflow-x-auto scrollbar-none">
          <Filter className="h-3.5 w-3.5 text-stone-400 shrink-0" />
          <button
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              !activeCategory
                ? 'bg-royal-950 text-white border-royal-950'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
            }`}
          >
            {isEn ? 'All' : 'Semua'}
          </button>
          {categories.map(({ category, count }) => (
            <button
              key={category}
              onClick={() => setActiveCategory(activeCategory === category ? null : category)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${
                activeCategory === category
                  ? 'bg-royal-950 text-white border-royal-950'
                  : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
              }`}
            >
              {category} ({count})
            </button>
          ))}
          <div className="flex-1 min-w-[120px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEn ? 'Search...' : 'Cari...'}
              className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-royal-950/20 focus:border-royal-950/40 bg-stone-50"
            />
          </div>
        </div>
      </div>

      {/* Grid */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-400">
            <MapPin className="w-10 h-10 mx-auto mb-3 text-stone-300" />
            <p className="text-sm font-semibold">
              {isEn ? 'No destinations found' : 'Tidak ada destinasi ditemukan'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map((dest) => {
              const imgUrl = getImageUrl(dest.images);
              return (
                <button
                  key={dest.id}
                  onClick={() => router.push(`/destinations/${toSlug(dest.name)}`)}
                  className="group relative rounded-2xl overflow-hidden bg-stone-200 aspect-[3/4] text-left hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  {imgUrl && (
                    <Image
                      src={imgUrl}
                      alt={dest.name}
                      fill
                      sizes="(min-width: 1280px) 220px, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {dest.badge && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-teal-500 text-white text-[9px] font-bold uppercase tracking-wide">
                      {dest.badge}
                    </span>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-xs leading-tight line-clamp-2">{dest.name}</p>
                    {dest.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                        <span className="text-gold-400 text-[10px] font-bold">{dest.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-3 w-3 text-white" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
