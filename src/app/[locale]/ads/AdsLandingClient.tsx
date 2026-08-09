'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import {
  Megaphone,
  ArrowRight, Layout, Sparkles, CheckCircle2,
  Building2, MapPin, Store, ChevronRight,
  BarChart2, BadgeCheck, Headphones, TrendingUp, Layers,
  BedDouble, UtensilsCrossed, Activity, ShoppingBag, Car, Compass,
} from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { PLACEMENT_NAMES } from '@/lib/adPlacements';
import { fetchPlacementPricing, formatPrice, type PlacementPriceInfo } from '@/lib/businessAdPlacements';

// ─── Sub-components ──────────────────────────────────────────────────────────

type BadgeVariant = 'accent' | 'success' | 'pro' | 'warning';

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  accent:  { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200' },
  success: { bg: 'bg-green-50',  text: 'text-green-800',  border: 'border-green-200' },
  pro:     { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  warning: { bg: 'bg-amber-50',  text: 'text-amber-800',  border: 'border-amber-200' },
};

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      {/* Browser chrome dots */}
      <div className="h-4 bg-gray-50 border-b border-gray-200 flex items-center gap-1 px-2">
        <div className="w-1.5 h-1.5 rounded-full bg-red-300" />
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-300" />
        <div className="w-1.5 h-1.5 rounded-full bg-green-300" />
        <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-sm" />
      </div>
      {children}
    </div>
  );
}

function EcosystemRailPreview({ highlightLabel }: { highlightLabel: string }) {
  return (
    <PreviewFrame>
      <div className="p-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-20 bg-gray-200 rounded-full" />
          <div className="h-1.5 w-8 bg-gray-100 rounded-full" />
        </div>
        <div className="flex gap-1.5">
          <div className="rounded bg-gray-200" style={{ width: 52, height: 64 }} />
          <div className="rounded border-[1.5px] border-amber-400 bg-amber-50 p-0.5" style={{ width: 52, height: 64 }}>
            <div className="rounded-sm bg-amber-400 flex items-center justify-center" style={{ height: 40 }}>
              <Megaphone className="w-3 h-3 text-white" />
            </div>
            <p className="text-[5.5px] font-bold text-amber-700 text-center leading-tight mt-0.5">DISPONSORI</p>
          </div>
          <div className="rounded bg-gray-200" style={{ width: 52, height: 64 }} />
          <div className="rounded bg-gray-200" style={{ width: 52, height: 64 }} />
        </div>
      </div>
      <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-100">
        <p className="text-[9px] text-stone-400 leading-snug">{highlightLabel}</p>
      </div>
    </PreviewFrame>
  );
}

interface SlotCardProps {
  featured?: boolean;
  badge: string;
  badgeVariant: BadgeVariant;
  icon: React.ReactNode;
  title: string;
  description: string;
  formatLabel: string;
  preview: React.ReactNode;
  onSelect: () => void;
  price?: number;
  promoLabel?: string;
}

function SlotCard({ featured, badge, badgeVariant, icon, title, description, formatLabel, preview, onSelect, price, promoLabel }: SlotCardProps) {
  const bs = BADGE_STYLES[badgeVariant];
  return (
    <div className={`rounded-2xl overflow-hidden bg-white transition-all hover:shadow-md ${
      featured
        ? 'border-2 border-blue-500 shadow-sm'
        : 'border border-stone-200 hover:border-stone-300'
    }`}>
      {/* Badge strip */}
      <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${bs.bg} ${bs.text} border-b ${bs.border}`}>
        {badge}
      </div>
      {/* Mini preview */}
      <div className="p-3 bg-gray-50/80">
        {preview}
      </div>
      {/* Info */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-1.5">
          {icon}
          <span className="font-display font-semibold text-sm text-stone-900">{title}</span>
        </div>
        <p className="text-xs text-stone-500 leading-relaxed mb-3">{description}</p>
        {price != null && price > 0 && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-extrabold text-stone-900">
              {formatPrice(price)}
              <span className="text-[10px] font-semibold text-stone-400 ml-1">/bulan</span>
            </span>
            {promoLabel && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                {promoLabel}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-stone-100 pt-3">
          <span className="text-[11px] font-mono font-medium text-stone-400">{formatLabel}</span>
          <button
            onClick={onSelect}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 transition-colors"
          >
            Pilih slot ini <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdsLandingClient() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const slotsRef = React.useRef<HTMLElement>(null);
  const [pricing, setPricing] = React.useState<Record<string, PlacementPriceInfo>>({});

  React.useEffect(() => {
    fetchPlacementPricing().then(setPricing);
  }, []);

  const placement = searchParams.get('placement') || '';
  const type = searchParams.get('type') || searchParams.get('category') || 'destination';
  const listingId = searchParams.get('listingId') || '';
  const name = searchParams.get('name') || '';

  // Build claim link with pre-filled params
  let claimQuery = `type=${encodeURIComponent(type)}`;
  if (listingId) claimQuery += `&listingId=${encodeURIComponent(listingId)}`;
  if (name) claimQuery += `&name=${encodeURIComponent(name)}`;
  if (placement) claimQuery += `&placement=${encodeURIComponent(placement)}`;

  const claimUrl = `/business/claim?${claimQuery}`;
  const registerBusinessUrl = `/business?action=register`;
  const businessDashboardUrl = `/business`;

  const getSlotUrl = (slotId: string) => {
    if (listingId) {
      const slotClaimQuery = `type=${encodeURIComponent(type)}&listingId=${encodeURIComponent(listingId)}${name ? `&name=${encodeURIComponent(name)}` : ''}`;
      return `/business/claim?${slotClaimQuery}&placement=${encodeURIComponent(slotId)}`;
    }
    if (user) {
      return `${businessDashboardUrl}?placement=${encodeURIComponent(slotId)}`;
    }
    return `${registerBusinessUrl}&placement=${encodeURIComponent(slotId)}`;
  };

  // Dynamic CTA based on user state & params
  let primaryCtaText = 'Mulai Pasang Iklan Usaha';
  let primaryCtaUrl = registerBusinessUrl;
  let secondaryCtaText = 'Klaim Tempat Usaha yang Sudah Ada';
  let secondaryCtaUrl = claimUrl;
  let primaryCtaIcon = <Building2 className="w-4 h-4" />;

  if (user) {
    primaryCtaText = 'Kelola Iklan di Business Portal';
    primaryCtaUrl = businessDashboardUrl;
    secondaryCtaText = listingId ? `Klaim Tempat ${name ? `"${name}"` : ''}` : 'Klaim Listing Tempat Usaha';
    secondaryCtaUrl = claimUrl;
    primaryCtaIcon = <Megaphone className="w-4 h-4" />;
  } else if (listingId) {
    primaryCtaText = `Klaim ${name ? `"${name}"` : 'Tempat Ini'} & Pasang Iklan`;
    primaryCtaUrl = claimUrl;
    secondaryCtaText = 'Daftar Usaha Baru';
    secondaryCtaUrl = registerBusinessUrl;
    primaryCtaIcon = <BadgeCheck className="w-4 h-4" />;
  }




  const features = [
    {
      icon: <Megaphone className="w-5 h-5 text-amber-400" />,
      title: 'Promosi Lebih Luas',
      desc: 'Jangkau ribuan wisatawan setiap hari.',
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-emerald-400" />,
      title: 'Data & Insight',
      desc: 'Pantau performa dan pahami audiens Anda.',
    },
    {
      icon: <BadgeCheck className="w-5 h-5 text-blue-400" />,
      title: 'Terverifikasi',
      desc: 'Tingkatkan kepercayaan dengan klaim resmi mitra.',
    },
    {
      icon: <Headphones className="w-5 h-5 text-purple-400" />,
      title: 'Dukungan Mitra',
      desc: 'Tim kami siap membantu kesuksesan usaha Anda.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
      <Header activeTab="ads" setActiveTab={() => {}} savedCount={0} />

      {/* ─── HERO SECTION — dark, full-bleed Merapi ── */}
      <section className="relative overflow-hidden bg-[#0f100c]" style={{ minHeight: 580 }}>

        {/* Background image */}
        <img
          src="/merapi.jpg"
          alt="Gunung Merapi"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-35"
          style={{ objectPosition: '60% center' }}
        />

        {/* Dark gradient: opaque left, fade right, fade bottom */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to right,
                #0f100c 0%,
                #0f100c 25%,
                rgba(15,16,12,0.85) 45%,
                rgba(15,16,12,0.40) 65%,
                transparent 100%
              ),
              linear-gradient(to top,
                #0f100c 0%,
                transparent 20%
              )
            `
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* Top pill badges */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {placement && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Slot <strong>{PLACEMENT_NAMES[placement] || placement}</strong> — lihat detail di bawah</span>
              </div>
            )}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/8 border border-white/15 text-white/50 text-xs font-semibold backdrop-blur-sm">
              <Megaphone className="w-3.5 h-3.5 text-white/40" />
              <span>Jogjagem Business & Ads Platform</span>
            </div>
          </div>

          {/* Headline */}
          <div className="max-w-2xl flex flex-col gap-6 pb-6">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-white tracking-tight leading-[1.1]">
              Jangkau Ribuan Wisatawan{' '}
              <span className="text-amber-400 inline-flex items-center gap-2">
                Jogja Setiap Hari
                <span className="text-amber-500 text-3xl leading-none">✦</span>
              </span>
            </h1>

            <p className="text-white/55 text-base leading-relaxed max-w-lg">
              Tingkatkan visibilitas destinasi, usaha kuliner, hotel, atau toko Anda di platform pariwisata paling interaktif di Yogyakarta.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Primary — amber, paling menonjol */}
              <Link
                href={primaryCtaUrl}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 active:scale-[0.97] text-stone-950 font-extrabold text-sm shadow-[0_4px_24px_rgba(245,158,11,0.35)] transition-all hover:shadow-[0_4px_32px_rgba(245,158,11,0.50)]"
              >
                {primaryCtaIcon}
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Scroll-to-slots — ghost amber outline */}
              <button
                type="button"
                onClick={() => slotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-amber-400/50 text-amber-300 hover:border-amber-400 hover:text-amber-200 hover:bg-amber-400/8 font-semibold text-sm transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Pasang Iklan Sekarang</span>
              </button>

              {/* Secondary — muted glass */}
              <Link
                href={secondaryCtaUrl}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-white/6 hover:bg-white/10 border border-white/15 text-white/60 hover:text-white/80 font-medium text-sm transition-all backdrop-blur-sm"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{secondaryCtaText}</span>
              </Link>
            </div>
          </div>

          {/* Feature strip */}
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white/6 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="bg-white/10 rounded-xl w-9 h-9 flex items-center justify-center shrink-0">
                  {f.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-white/90">{f.title}</div>
                  <div className="text-[11px] text-white/40 leading-snug mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLACEMENT SHOWCASE ─────────────────────────────────────────── */}
      <section ref={slotsRef} className="py-16 bg-[#FAF7F2] border-t border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-stone-900">
              Pilihan Slot & Format Iklan
            </h2>
            <p className="mt-3 text-stone-500 text-sm sm:text-base">
              Pilih posisi terbaik yang paling sesuai dengan tujuan promosi usaha Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── 1. Homepage Hero AIPick Card ── */}
            <SlotCard
              featured={placement === 'homepage_hero_aicard' || !placement}
              badge="Impression Tertinggi"
              badgeVariant="accent"
              icon={<Layout className="w-4 h-4 text-blue-600" />}
              title="Homepage Hero AIPick Card"
              description="Card sponsor yang menempati slot 'Jogjagem's Pick' di hero. Setiap load halaman diundi 50:50 (coin-flip) — saat terpilih, iklanmu menggantikan rekomendasi AI organik di posisi paling pertama dilihat wisatawan."
              formatLabel="Portrait card — 2:3 (~210px)"
              price={pricing['homepage_hero_aicard']?.monthlyRate}
              promoLabel={pricing['homepage_hero_aicard']?.promoActive ? pricing['homepage_hero_aicard']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('homepage_hero_aicard'); }}
              preview={
                <PreviewFrame>
                  {/* Hero section dark block */}
                  <div className="bg-[#16140f] px-3 pt-3 pb-2.5 relative">
                    {/* Text placeholder lines */}
                    <div className="pr-[72px] space-y-1.5 mb-3">
                      <div className="h-1.5 w-[55%] bg-white/20 rounded-full" />
                      <div className="h-1.5 w-[72%] bg-white/20 rounded-full" />
                      <div className="h-1.5 w-[80%] bg-white/15 rounded-full" />
                    </div>

                    {/* AI Pick card — top right, sponsored */}
                    <div className="absolute top-3 right-3 w-[62px] bg-white rounded-lg overflow-hidden shadow-md">
                      <div className="h-8 bg-gray-200" />
                      <div className="px-1.5 py-1 flex items-center gap-1">
                        <Megaphone className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                        <span className="text-[7px] font-bold text-stone-600">disponsori</span>
                      </div>
                    </div>
                  </div>

                  {/* Caption below the preview */}
                  <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-100">
                    <p className="text-[9px] text-stone-400 leading-snug">
                      50:50 coin-flip — iklanmu menggantikan 'Jogjagem's Pick' saat terpilih
                    </p>
                  </div>
                </PreviewFrame>
              }
            />

            {/* ── 2. Homepage Hero Trending ── */}
            <SlotCard
              featured={placement === 'homepage_hero_trending'}
              badge="Auto-Geser"
              badgeVariant="warning"
              icon={<TrendingUp className="w-4 h-4 text-amber-600" />}
              title="Homepage Hero Trending"
              description="Card sponsor di posisi ke-3 & ke-8 carousel 'Sedang Trending' (10 item, auto-geser). Menyatu natural di antara destinasi yang sedang ramai dicari wisatawan."
              formatLabel="Carousel — posisi #3 & #8"
              price={pricing['homepage_hero_trending']?.monthlyRate}
              promoLabel={pricing['homepage_hero_trending']?.promoActive ? pricing['homepage_hero_trending']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('homepage_hero_trending'); }}
              preview={
                <PreviewFrame>
                  <div className="bg-[#16140f] px-3 pt-3 pb-2.5">
                    {/* Trending label */}
                    <div className="flex items-center gap-1 mb-1.5">
                      <svg className="w-2.5 h-2.5 text-red-400" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.66 11.2c-.23-.3-.51-.56-.77-.82-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32C8.24 6.1 7.1 9.33 8.05 12.41c.05.16.1.33.14.49-.41-.36-.64-.9-.68-1.43-.06-.83.12-1.66.22-2.48C6.6 10.09 6 11.32 6 12.55c-.01 3.05 2.3 5.65 5.3 6.15.69.11 1.39.11 2.06-.03C16.96 18 19 15.8 19 13.1c0-1.43-.45-2.85-1.34-3.9z"/>
                      </svg>
                      <span className="text-[8px] text-white/50 font-medium">sedang trending</span>
                    </div>

                    {/* Trending carousel: 8 cards, #3 and #8 highlighted */}
                    <div className="flex gap-1 pb-1.5 overflow-hidden">
                      {Array.from({ length: 8 }).map((_, i) => {
                        const pos = i + 1;
                        const isAd = pos === 3 || pos === 8;
                        return (
                          <div
                            key={i}
                            className={`shrink-0 rounded relative flex flex-col justify-end ${
                              isAd
                                ? 'border border-amber-400 bg-[#2a2510]'
                                : 'bg-[#252219]'
                            }`}
                            style={{ width: 28, height: 38 }}
                          >
                            {isAd && (
                              <span
                                className="absolute -top-0.5 -left-0.5 text-[6px] font-extrabold bg-amber-400 text-stone-900 rounded-sm px-0.5 leading-tight"
                              >
                                #{pos}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Caption below the preview */}
                  <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-100">
                    <p className="text-[9px] text-stone-400 leading-snug">
                      Posisi ke-3 &amp; ke-8 dari 10 item, auto-geser
                    </p>
                  </div>
                </PreviewFrame>
              }
            />

            {/* ── 3. Homepage Category Banner ── */}
            <SlotCard
              featured={placement === 'homepage_category_banner'}
              badge="Full-Width"
              badgeVariant="success"
              icon={<Layers className="w-4 h-4 text-emerald-600" />}
              title="Homepage Category Banner"
              description="Banner full-width tepat di bawah filter kategori halaman utama. Menjangkau wisatawan yang sudah memilih kategori dan siap menelusuri destinasi spesifik."
              formatLabel="16:5 — 1600×500px"
              price={pricing['homepage_category_banner']?.monthlyRate}
              promoLabel={pricing['homepage_category_banner']?.promoActive ? pricing['homepage_category_banner']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('homepage_category_banner'); }}
              preview={
                <PreviewFrame>
                  <div className="p-2 space-y-1.5">
                    {/* Category filter chips */}
                    <div className="flex gap-1">
                      <div className="h-2.5 w-10 bg-gray-200 rounded-full" />
                      <div className="h-2.5 w-8 bg-amber-300 rounded-full" />
                      <div className="h-2.5 w-10 bg-gray-200 rounded-full" />
                      <div className="h-2.5 w-9 bg-gray-200 rounded-full" />
                    </div>
                    <div className="h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-[8px] text-white font-semibold">✦ Iklanmu di sini</span>
                    </div>
                  </div>
                  <div className="px-2 py-1.5 bg-gray-50 border-t border-gray-100">
                    <p className="text-[9px] text-stone-400 leading-snug">
                      Full-width banner di bawah filter kategori
                    </p>
                  </div>
                </PreviewFrame>
              }
            />

            {/* ── 4. Destination Detail ── */}
            <SlotCard
              featured={placement === 'destination_detail'}
              badge="Targeting Spesifik"
              badgeVariant="success"
              icon={<MapPin className="w-4 h-4 text-emerald-600" />}
              title="Destination Detail Sponsorship"
              description="Tampil eksklusif di dalam halaman detail destinasi wisata populer. Menjangkau calon pengunjung yang sedang aktif merencanakan kunjungan."
              formatLabel="1200×375 — 16:5 wide"
              price={pricing['destination_detail']?.monthlyRate}
              promoLabel={pricing['destination_detail']?.promoActive ? pricing['destination_detail']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('destination_detail'); }}
              preview={
                <PreviewFrame>
                  <div className="p-2 space-y-1.5">
                    <div className="h-6 w-full bg-gray-200 rounded" />
                    <div className="h-1.5 w-3/4 bg-gray-200 rounded" />
                    <div className="h-9 bg-emerald-500 rounded flex items-center justify-center mt-0.5">
                      <span className="text-[9px] text-white font-semibold">✦ Iklanmu di sini</span>
                    </div>
                    <div className="h-1.5 w-1/2 bg-gray-200 rounded" />
                    <div className="h-1.5 w-2/3 bg-gray-200 rounded" />
                  </div>
                </PreviewFrame>
              }
            />

            {/* ── 5. Listing Top Priority ── */}
            <SlotCard
              featured={placement === 'listing_top'}
              badge="Konversi Tinggi"
              badgeVariant="pro"
              icon={<Sparkles className="w-4 h-4 text-purple-600" />}
              title="Listing Top Priority"
              description="Bisnis Anda menempati posisi #5 dan #10 di grid Destinasi Populer — kolom pertama tiap baris (landscape), section terpisah di luar hero, dilihat oleh wisatawan yang sedang aktif menelusuri destinasi."
              formatLabel="Grid 4 col — posisi #5 & #10, landscape (col span 2)"
              price={pricing['listing_top']?.monthlyRate}
              promoLabel={pricing['listing_top']?.promoActive ? pricing['listing_top']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('listing_top'); }}
              preview={
                <PreviewFrame>
                  <div className="p-2 bg-gray-50">
                    <p className="text-[8px] text-stone-400 mb-1.5 font-medium">
                      Destinasi populer — grid (section terpisah, di luar hero)
                    </p>

                    {/* Row 1: 4 portrait cards */}
                    <div className="grid grid-cols-4 gap-1 mb-1">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="rounded bg-gray-200" style={{ height: 48 }} />
                      ))}
                    </div>

                    {/* Row 2: portrait ad (col 1) + 3 portrait */}
                    <div className="grid grid-cols-4 gap-1 mb-1">
                      <div className="rounded border border-amber-400 bg-amber-50 relative" style={{ height: 48 }}>
                        <span className="absolute top-1 left-1 text-[6px] font-extrabold bg-amber-400 text-stone-900 rounded px-0.5 py-0.5 leading-none">AD</span>
                      </div>
                      {[0,1,2].map(i => (
                        <div key={i} className="rounded bg-gray-200" style={{ height: 48 }} />
                      ))}
                    </div>

                    {/* Row 3: 4 portrait cards */}
                    <div className="grid grid-cols-4 gap-1 mb-1">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="rounded bg-gray-200" style={{ height: 48 }} />
                      ))}
                    </div>

                    {/* Row 4: portrait ad (col 1) + 3 portrait */}
                    <div className="grid grid-cols-4 gap-1">
                      <div className="rounded border border-amber-400 bg-amber-50 relative" style={{ height: 48 }}>
                        <span className="absolute top-1 left-1 text-[6px] font-extrabold bg-amber-400 text-stone-900 rounded px-0.5 py-0.5 leading-none">AD</span>
                      </div>
                      {[0,1,2].map(i => (
                        <div key={i} className="rounded bg-gray-200" style={{ height: 48 }} />
                      ))}
                    </div>
                  </div>
                </PreviewFrame>
              }
            />

            {/* ── 6. Native In-Feed ── */}
            <SlotCard
              featured={placement === 'listing_native'}
              badge="Seamless Experience"
              badgeVariant="warning"
              icon={<Store className="w-4 h-4 text-amber-600" />}
              title="Native In-Feed Ad"
              description="Banner yang menyatu secara seamless di antara daftar rekomendasi tempat menarik — tidak mengganggu kenyamanan eksplorasi pengunjung."
              formatLabel="480×360 — native card integration"
              price={pricing['listing_native']?.monthlyRate}
              promoLabel={pricing['listing_native']?.promoActive ? pricing['listing_native']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('listing_native'); }}
              preview={
                <PreviewFrame>
                  <div className="p-2 grid grid-cols-2 gap-1.5">
                    <div className="space-y-1">
                      <div className="h-7 bg-gray-200 rounded" />
                      <div className="h-1 w-3/4 bg-gray-200 rounded" />
                    </div>
                    <div className="border-[1.5px] border-amber-500 rounded p-0.5 space-y-1">
                      <div className="h-7 bg-amber-500 rounded flex items-center justify-center">
                        <span className="text-[8px] text-white font-semibold">Iklanmu</span>
                      </div>
                      <div className="h-1 w-3/4 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-7 bg-gray-200 rounded" />
                      <div className="h-1 w-3/5 bg-gray-200 rounded" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-7 bg-gray-200 rounded" />
                      <div className="h-1 w-2/3 bg-gray-200 rounded" />
                    </div>
                  </div>
                </PreviewFrame>
              }
            />

            {/* ── 7–12. Rekomendasi Kebutuhan Traveler (Rel Sponsor) ── */}
            <div className="md:col-span-2 mt-8 pt-2 border-t-2 border-dashed border-stone-200">
              <h3 className="font-display text-xl font-extrabold text-stone-900">
                Rel Rekomendasi Kebutuhan Traveler
              </h3>
              <p className="mt-1 text-xs text-stone-500 max-w-2xl">
                Kartu sponsor di rail rekomendasi (Menginap / Kuliner / Vibe &amp; Aktivitas / Belanja / Transport / Guide Lokal) pada halaman detail destinasi. Slot memakai data listing yang sudah Anda klaim — pilih listing saat checkout, jangkau wisatawan yang sedang merencanakan kunjungan di destinasi target.
              </p>
            </div>

            <SlotCard
              featured={placement === 'ecosystem_stay'}
              badge="Berbasis Listing"
              badgeVariant="pro"
              icon={<BedDouble className="w-4 h-4 text-purple-600" />}
              title="Rel Rekomendasi — Menginap"
              description="Kartu sponsor naik ke urutan teratas rail 'Menginap' di halaman destinasi. Memakai foto & data hotel milik bisnis Anda; bisa diarahkan ke destinasi spesifik."
              formatLabel="Native card — data hotel"
              price={pricing['ecosystem_stay']?.monthlyRate}
              promoLabel={pricing['ecosystem_stay']?.promoActive ? pricing['ecosystem_stay']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('ecosystem_stay'); }}
              preview={<EcosystemRailPreview highlightLabel="Urutan teratas di tab 'Menginap' — pakai foto hotel Anda" />}
            />

            <SlotCard
              featured={placement === 'ecosystem_eat'}
              badge="Berbasis Listing"
              badgeVariant="pro"
              icon={<UtensilsCrossed className="w-4 h-4 text-purple-600" />}
              title="Rel Rekomendasi — Kuliner"
              description="Kartu sponsor di rail 'Kuliner' halaman destinasi, memakai data restoran/kafe milik bisnis Anda. Menarik wisatawan yang mencari tempat makan."
              formatLabel="Native card — data restoran"
              price={pricing['ecosystem_eat']?.monthlyRate}
              promoLabel={pricing['ecosystem_eat']?.promoActive ? pricing['ecosystem_eat']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('ecosystem_eat'); }}
              preview={<EcosystemRailPreview highlightLabel="Urutan teratas di tab 'Kuliner' — pakai foto restoran Anda" />}
            />

            <SlotCard
              featured={placement === 'ecosystem_experience'}
              badge="Berbasis Listing"
              badgeVariant="pro"
              icon={<Activity className="w-4 h-4 text-purple-600" />}
              title="Rel Rekomendasi — Vibe & Aktivitas"
              description="Kartu sponsor di rail 'Vibe & Aktivitas' halaman destinasi, memakai data rental/agen milik bisnis Anda. Jangkau traveler yang mencari pengalaman."
              formatLabel="Native card — data rental"
              price={pricing['ecosystem_experience']?.monthlyRate}
              promoLabel={pricing['ecosystem_experience']?.promoActive ? pricing['ecosystem_experience']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('ecosystem_experience'); }}
              preview={<EcosystemRailPreview highlightLabel="Urutan teratas di tab 'Vibe & Aktivitas'" />}
            />

            <SlotCard
              featured={placement === 'ecosystem_shop'}
              badge="Berbasis Listing"
              badgeVariant="pro"
              icon={<ShoppingBag className="w-4 h-4 text-purple-600" />}
              title="Rel Rekomendasi — Belanja"
              description="Kartu sponsor di rail 'Belanja' halaman destinasi, memakai data souvenir shop milik bisnis Anda. Ideal untuk toko oleh-oleh & kerajinan."
              formatLabel="Native card — data souvenir"
              price={pricing['ecosystem_shop']?.monthlyRate}
              promoLabel={pricing['ecosystem_shop']?.promoActive ? pricing['ecosystem_shop']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('ecosystem_shop'); }}
              preview={<EcosystemRailPreview highlightLabel="Urutan teratas di tab 'Belanja'" />}
            />

            <SlotCard
              featured={placement === 'ecosystem_move'}
              badge="Berbasis Listing"
              badgeVariant="pro"
              icon={<Car className="w-4 h-4 text-purple-600" />}
              title="Rel Rekomendasi — Transport"
              description="Kartu sponsor di rail 'Transport' halaman destinasi, memakai data rental/transport milik bisnis Anda. Jangkau wisatawan yang butuh mobilitas."
              formatLabel="Native card — data rental"
              price={pricing['ecosystem_move']?.monthlyRate}
              promoLabel={pricing['ecosystem_move']?.promoActive ? pricing['ecosystem_move']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('ecosystem_move'); }}
              preview={<EcosystemRailPreview highlightLabel="Urutan teratas di tab 'Transport'" />}
            />

            <SlotCard
              featured={placement === 'ecosystem_guide'}
              badge="Berbasis Listing"
              badgeVariant="pro"
              icon={<Compass className="w-4 h-4 text-purple-600" />}
              title="Rel Rekomendasi — Guide Lokal"
              description="Kartu sponsor di rail 'Guide Lokal' halaman destinasi, memakai data guide milik bisnis Anda dengan foto profil & tarif harian."
              formatLabel="Native card — data guide"
              price={pricing['ecosystem_guide']?.monthlyRate}
              promoLabel={pricing['ecosystem_guide']?.promoActive ? pricing['ecosystem_guide']?.promoLabel : undefined}
              onSelect={() => { window.location.href = getSlotUrl('ecosystem_guide'); }}
              preview={<EcosystemRailPreview highlightLabel="Urutan teratas di tab 'Guide Lokal'" />}
            />
          </div>
        </div>
      </section>

      {/* ─── WHY JOGJAGEM ───────────────────────────────────────────────── */}
      <section className="py-14 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Target Audiens Tepat', desc: 'Pengunjung platform kami adalah wisatawan yang secara aktif sedang menyusun rencana perjalanan ke Yogyakarta.' },
              { title: 'Analitik Real-Time', desc: 'Pantau performa iklan Anda melalui Business Portal dengan statistik tayangan dan klik yang transparan.' },
              { title: 'Verifikasi Resmi Mitra', desc: 'Dapatkan badge verifikasi resmi dan kelola penuh informasi bisnis Anda tanpa perantara.' },
            ].map((c, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h4 className="font-bold text-sm text-stone-800">{c.title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─────────────────────────────────────────────────── */}
      <section className="pb-16 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 rounded-3xl bg-stone-900 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
            <div className="space-y-1.5 text-center md:text-left">
              <h3 className="font-display text-2xl font-extrabold tracking-tight">
                Siap Memulai Promosi Bisnis Anda?
              </h3>
              <p className="text-stone-400 text-sm max-w-md">
                Klaim kepemilikan tempat usaha Anda atau daftarkan bisnis baru dalam hitungan menit.
              </p>
            </div>
            <Link
              href={primaryCtaUrl}
              className="shrink-0 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold text-sm shadow-md transition-all"
            >
              {primaryCtaText} →
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-auto py-8 bg-[#0a0b08] border-t border-white/8 text-center text-xs text-white/30">
        © {new Date().getFullYear()} Jogjagem Business & Ads Platform. All rights reserved.
      </footer>
    </div>
  );
}
