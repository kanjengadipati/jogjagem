'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from '@/i18n/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import AdBanner from '@/components/AdBanner';
import type { Destination } from '@/types';
import { toSlug } from '@/lib/slug';

interface WisataJogjaClientProps {
  destinations: Destination[];
  locale: string;
}

const BADGE_LABEL: Record<string, { id: string; en: string }> = {
  trending: { id: 'Trending', en: 'Trending' },
  hidden_gem: { id: 'Hidden Gem', en: 'Hidden Gem' },
};

export default function WisataJogjaClient({ destinations, locale }: WisataJogjaClientProps) {
  const router = useRouter();
  const isEn = locale === 'en';
  const localePrefix = isEn ? '/en' : '';
  const updatedAt = new Date().toLocaleDateString(isEn ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Header activeTab="discover" setActiveTab={() => router.push('/')} savedCount={0} isOverHero={false} />

        <main className="max-w-3xl mx-auto px-4 py-10">
          <nav className="text-sm text-gray-500 mb-4" aria-label="Breadcrumb">
            <Link href={`${localePrefix}/`} className="hover:text-purple-700">
              {isEn ? 'Home' : 'Beranda'}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{isEn ? 'Popular Destinations' : 'Wisata Jogja'}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {destinations.length}+ {isEn
              ? 'Most Popular Tourist Attractions in Yogyakarta (2026)'
              : 'Tempat Wisata Jogja Paling Populer (2026)'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {isEn ? 'Updated' : 'Diperbarui'} {updatedAt}
          </p>

          <p className="text-gray-700 leading-relaxed mb-10">
            {isEn
              ? 'Planning a trip to Yogyakarta? Here are the most popular places to visit right now, ranked by what travelers are actually searching for and rating highest — from iconic temples to beaches and trending hidden gems.'
              : 'Lagi rencanain liburan ke Jogja? Berikut tempat wisata paling populer saat ini, diurutkan berdasarkan apa yang paling banyak dicari dan dinilai tinggi oleh wisatawan — mulai dari candi ikonik, pantai, sampai hidden gem yang lagi trending.'}
          </p>

          <ol className="space-y-10">
            {destinations.map((d, i) => {
              const slug = toSlug(d.name);
              const badgeKey = d.badge?.toLowerCase().replace(/\s+/g, '_');
              const badgeLabel = badgeKey && BADGE_LABEL[badgeKey]
                ? (isEn ? BADGE_LABEL[badgeKey].en : BADGE_LABEL[badgeKey].id)
                : null;
              const image = d.images?.[0]?.url;
              const summary = d.description || d.tagline;

              return (
                <li key={d.id} className="scroll-mt-24" id={`item-${i + 1}`}>
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="text-2xl font-bold text-purple-700">{i + 1}.</span>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      <Link href={`${localePrefix}/destinations/${slug}`} className="hover:text-purple-700">
                        {d.name}
                      </Link>
                    </h2>
                    {badgeLabel && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        {badgeLabel}
                      </span>
                    )}
                  </div>

                  {image && (
                    <Link href={`${localePrefix}/destinations/${slug}`} className="block mb-3">
                      <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-100">
                        <Image
                          src={image}
                          alt={d.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 700px"
                          className="object-cover"
                          loading={i < 3 ? 'eager' : 'lazy'}
                        />
                      </div>
                    </Link>
                  )}

                  {summary && (
                    <p className="text-gray-700 leading-relaxed mb-2">{summary}</p>
                  )}

                  <Link
                    href={`${localePrefix}/destinations/${slug}`}
                    className="text-purple-700 font-medium text-sm hover:underline"
                  >
                    {isEn ? 'Read more →' : 'Selengkapnya →'}
                  </Link>

                  {/* Native ad slot every 8th item, matching hero-carousel sponsored cadence elsewhere in the app */}
                  {(i + 1) % 8 === 0 && (
                    <div className="mt-6">
                      <AdBanner placement="wisata_jogja_listicle" variant="native" showHouseAdFallback />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-3">
              {isEn
                ? 'Want to see everything Yogyakarta has to offer?'
                : 'Mau lihat semua destinasi wisata Jogja?'}
            </p>
            <Link
              href={`${localePrefix}/destinations`}
              className="inline-block px-6 py-3 rounded-full bg-purple-700 text-white font-semibold hover:bg-purple-800 transition"
            >
              {isEn ? 'Browse all destinations' : 'Lihat semua destinasi'}
            </Link>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
