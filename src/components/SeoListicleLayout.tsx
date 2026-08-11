'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import AdBanner from '@/components/AdBanner';
import type { Destination } from '@/types';
import { toSlug } from '@/lib/slug';

export interface SeoListicleItemCustomizer {
  customBadge?: (d: Destination, index: number) => string | null;
  customSubTitle?: (d: Destination, index: number) => string | null;
}

export interface SeoListicleLayoutProps {
  destinations: Destination[];
  locale: string;
  breadcrumbLabel: string;
  eyebrowText: string;
  headlineTitle: React.ReactNode;
  introText: string;
  updateBadgeText?: string;
  ctaText?: string;
  ctaHref?: string;
  activeTab?: string;
  adPlacement?: string;
  customItemBadge?: (d: Destination, index: number) => string | null;
  customSubTitle?: (d: Destination, index: number) => string | null;
  heroBgImage?: string;
}

const BADGE_LABEL: Record<string, { id: string; en: string }> = {
  trending: { id: 'Trending', en: 'Trending' },
  hidden_gem: { id: 'Hidden Gem', en: 'Hidden Gem' },
  culinary: { id: 'Kuliner', en: 'Culinary' },
  nature: { id: 'Wisata Alam', en: 'Nature' },
  culture: { id: 'Budaya & Sejarah', en: 'Culture & History' },
  family: { id: 'Keluarga', en: 'Family' },
  sunset: { id: 'Spot Sunset', en: 'Sunset Spot' },
  photo: { id: 'Spot Foto', en: 'Photo Spot' },
};

export default function SeoListicleLayout({
  destinations,
  locale,
  breadcrumbLabel,
  eyebrowText,
  headlineTitle,
  introText,
  updateBadgeText,
  ctaText,
  ctaHref,
  activeTab = 'discover',
  adPlacement = 'seo_listicle',
  customItemBadge,
  customSubTitle,
  heroBgImage = '/bg-hero-per-clue.png',
}: SeoListicleLayoutProps) {
  const router = useRouter();
  const isEn = locale === 'en';
  const localePrefix = isEn ? '/en' : '';

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gold-50">
        <Header activeTab={activeTab} setActiveTab={() => router.push('/')} savedCount={0} isOverHero={false} />

        {/* ── Masthead ─────────────────────────────────────────────────────── */}
        <header className="relative border-b border-gold-200 overflow-hidden">
          {heroBgImage && (
            <div className="absolute inset-0 pointer-events-none select-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroBgImage}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-gold-50/20 via-gold-50/50 to-gold-50" />
            </div>
          )}
          <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-12 pb-10 md:pt-16 md:pb-14">
            {/* Breadcrumb */}
            <nav
              className="font-mono text-[10px] tracking-[0.2em] uppercase text-gold-700/80 mb-6"
              aria-label="Breadcrumb"
            >
              <Link href={`${localePrefix}/`} className="hover:text-royal-900 transition-colors">
                {isEn ? 'Home' : 'Beranda'}
              </Link>
              <span className="mx-2 text-gold-300">/</span>
              <span className="text-royal-700">
                {breadcrumbLabel}
              </span>
            </nav>

            {/* Eyebrow */}
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-gold-700 mb-4">
              {eyebrowText}
            </p>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-royal-900 leading-[1.05] mb-6">
              {headlineTitle}
            </h1>

            {/* Intro */}
            <p className="font-sans text-lg text-royal-700/85 leading-relaxed max-w-xl">
              {introText}
            </p>

            {/* Refresh / Update indicator */}
            {updateBadgeText && (
              <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-400/20 text-teal-700 text-xs font-semibold font-mono tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-60" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400" />
                </span>
                {updateBadgeText}
              </div>
            )}
          </div>
        </header>


        {/* ── Listicle — Kraton Ledger Layout ───────────────────────────────────── */}
        <main className="max-w-3xl mx-auto px-4 sm:px-6">
          <ol className="divide-y divide-gold-200">
            {destinations.map((d, i) => {
              const slug = toSlug(d.name);
              const badgeKey = d.badge?.toLowerCase().replace(/\s+/g, '_');
              const defaultBadgeLabel =
                badgeKey && BADGE_LABEL[badgeKey]
                  ? isEn ? BADGE_LABEL[badgeKey].en : BADGE_LABEL[badgeKey].id
                  : (d.category ? (BADGE_LABEL[d.category.toLowerCase()]?.[isEn ? 'en' : 'id'] || d.category) : null);

              const badgeLabel = customItemBadge ? customItemBadge(d, i) : defaultBadgeLabel;
              const subTitle = customSubTitle ? customSubTitle(d, i) : null;
              const image = d.images?.[0]?.url;
              const summary = d.description || d.tagline;

              return (
                <li key={d.id || `dest-${i}`} className="scroll-mt-24 py-10 md:py-14" id={`item-${i + 1}`}>
                  <div className="grid grid-cols-[64px_1fr] md:grid-cols-[96px_1fr] gap-4 md:gap-8 items-start">

                    {/* Ghost ordinal numeral */}
                    <span
                      className="font-display italic text-gold-200 leading-none select-none pt-1"
                      style={{ fontSize: 'clamp(48px, 8vw, 80px)' }}
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="min-w-0">
                      {subTitle && (
                        <p className="font-mono text-xs text-gold-600 font-semibold uppercase tracking-wider mb-1">
                          {subTitle}
                        </p>
                      )}

                      {/* Name + badge */}
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5 mb-4">
                        <h2 className="font-manrope text-2xl md:text-3xl font-bold text-royal-900">
                          <Link
                            href={`${localePrefix}/destinations/${slug}`}
                            className="hover:text-gold-700 transition-colors"
                          >
                            {d.name}
                          </Link>
                        </h2>
                        {badgeLabel && (
                          <span className="font-mono text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full border border-gold-300 text-gold-700 whitespace-nowrap">
                            {badgeLabel}
                          </span>
                        )}
                      </div>

                      {/* Cover image */}
                      {image && (
                        <Link
                          href={`${localePrefix}/destinations/${slug}`}
                          className="block mb-5 group"
                        >
                          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gold-100">
                            <Image
                              src={image}
                              alt={d.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 700px"
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                              loading={i < 3 ? 'eager' : 'lazy'}
                            />
                          </div>
                        </Link>
                      )}

                      {/* Summary */}
                      {summary && (
                        <p className="font-sans text-royal-700/90 leading-relaxed mb-4">
                          {summary}
                        </p>
                      )}

                      {/* Read more */}
                      <Link
                        href={`${localePrefix}/destinations/${slug}`}
                        className="inline-flex items-center gap-1.5 font-mono text-xs tracking-[0.15em] uppercase text-gold-700 hover:text-royal-900 hover:gap-2.5 transition-all duration-150"
                      >
                        {isEn ? 'Read more' : 'Selengkapnya'}
                        <ArrowUpRight size={14} strokeWidth={2.5} />
                      </Link>
                    </div>
                  </div>

                  {/* Ad slot every 8th item */}
                  {(i + 1) % 8 === 0 && (
                    <div className="mt-8 ml-[72px] md:ml-[112px]">
                      <AdBanner placement={adPlacement} variant="native" showHouseAdFallback />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {/* ── Closing CTA ───────────────────────────────────────────────── */}
          <div className="py-16 md:py-24 text-center border-t border-gold-200">
            <p className="font-display italic text-xl md:text-2xl text-royal-900 mb-8">
              {ctaText || (isEn ? 'Want to explore more of Yogyakarta?' : 'Mau jelajahi lebih banyak destinasi Jogja?')}
            </p>
            <Link
              href={ctaHref || `${localePrefix}/destinations`}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-royal-900 text-gold-100 font-manrope font-semibold text-sm tracking-wide hover:bg-royal-700 transition-colors"
            >
              {isEn ? 'Browse all destinations' : 'Lihat semua destinasi'}
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}
