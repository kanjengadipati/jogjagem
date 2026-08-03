'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import {
  Megaphone, Eye, MousePointerClick, ShieldCheck,
  ArrowRight, Layout, Sparkles, CheckCircle2,
  Building2, MapPin, Store, Compass, ChevronRight,
  BarChart2, BadgeCheck, Headphones,
} from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

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
}

function SlotCard({ featured, badge, badgeVariant, icon, title, description, formatLabel, preview, onSelect }: SlotCardProps) {
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
      return `${claimUrl}&placement=${encodeURIComponent(slotId)}`;
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
      icon: <Megaphone className="w-5 h-5 text-amber-600" />,
      bg: 'bg-amber-100',
      title: 'Promosi Lebih Luas',
      desc: 'Jangkau ribuan wisatawan setiap hari.',
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-emerald-600" />,
      bg: 'bg-emerald-100',
      title: 'Data & Insight',
      desc: 'Pantau performa dan pahami audiens Anda.',
    },
    {
      icon: <BadgeCheck className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-100',
      title: 'Terverifikasi',
      desc: 'Tingkatkan kepercayaan dengan klaim resmi mitra.',
    },
    {
      icon: <Headphones className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-100',
      title: 'Dukungan Mitra',
      desc: 'Tim kami siap membantu kesuksesan usaha Anda.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-stone-900 flex flex-col font-sans">
      <Header activeTab="ads" setActiveTab={() => {}} savedCount={0} />

      {/* ─── HERO SECTION ─── Full-bleed tugu, fade-out on text side ── */}
      <section className="relative overflow-hidden bg-[#FAF7F2]" style={{ minHeight: 560 }}>

        {/* Full-bleed background image */}
        <img
          src="/tugu.png"
          alt="Tugu Yogyakarta"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ objectPosition: '65% center' }}
        />

        {/* Gradient overlay: solid cream on left → transparent on right
            Extra bottom fade to blend into the section below */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(to right,
                #FAF7F2 0%,
                #FAF7F2 30%,
                rgba(250,247,242,0.92) 45%,
                rgba(250,247,242,0.60) 58%,
                rgba(250,247,242,0.15) 75%,
                transparent 100%
              ),
              linear-gradient(to top,
                #FAF7F2 0%,
                transparent 18%
              )
            `
          }}
        />

        {/* Content — aligned to same container as Header */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Top pill badges */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {placement && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-amber-200 text-amber-800 text-xs font-semibold shadow-xs backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Tertarik dengan slot <strong>{placement}</strong>? Lihat detail format di bawah.</span>
              </div>
            )}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 border border-stone-200 text-stone-500 text-xs font-semibold shadow-xs backdrop-blur-sm">
              <Megaphone className="w-3.5 h-3.5 text-stone-400" />
              <span>Jogjagem Business & Ads Platform</span>
            </div>
          </div>

          {/* Left column content only — image fills the right naturally */}
          <div className="max-w-xl flex flex-col gap-6 pb-6">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.75rem] font-extrabold text-stone-900 tracking-tight leading-[1.1]">
              Jangkau Ribuan Wisatawan & Pengunjung Jogja{' '}
              <span className="text-[#C2851C] inline-flex items-center gap-2">
                Setiap Hari
                <span className="text-[#E5A84B] text-3xl leading-none">✦</span>
              </span>
            </h1>

            <p className="text-stone-600 text-base leading-relaxed">
              Tingkatkan visibilitas destinasi, usaha kuliner, hotel, atau toko Anda di platform pariwisata paling interaktif di Yogyakarta.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href={primaryCtaUrl}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {primaryCtaIcon}
                <span>{primaryCtaText}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={secondaryCtaUrl}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-white/90 hover:bg-white border border-stone-200 text-stone-700 font-semibold text-sm shadow-xs transition-all backdrop-blur-sm"
              >
                <Building2 className="w-4 h-4 text-stone-400" />
                <span>{secondaryCtaText}</span>
              </Link>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-4 divide-x divide-stone-200 bg-white/90 backdrop-blur-sm rounded-2xl border border-stone-200 shadow-xs px-2 py-1 max-w-lg">
              <div className="flex flex-col items-center py-3 px-2 text-center">
                <Eye className="w-4 h-4 text-amber-500 mb-1.5" />
                <span className="font-display font-extrabold text-lg text-stone-900 leading-none">100K+</span>
                <span className="text-[10px] text-stone-400 font-medium mt-0.5">Tayangan / Bulan</span>
              </div>
              <div className="flex flex-col items-center py-3 px-2 text-center">
                <MousePointerClick className="w-4 h-4 text-emerald-500 mb-1.5" />
                <span className="font-display font-extrabold text-lg text-stone-900 leading-none">4.8%</span>
                <span className="text-[10px] text-stone-400 font-medium mt-0.5">Rata-rata CTR</span>
              </div>
              <div className="flex flex-col items-center py-3 px-2 text-center">
                <Compass className="w-4 h-4 text-blue-500 mb-1.5" />
                <span className="font-display font-extrabold text-lg text-stone-900 leading-none">85%</span>
                <span className="text-[10px] text-stone-400 font-medium mt-0.5">Wisatawan Aktif</span>
              </div>
              <div className="flex flex-col items-center py-3 px-2 text-center">
                <ShieldCheck className="w-4 h-4 text-purple-500 mb-1.5" />
                <span className="font-display font-extrabold text-lg text-stone-900 leading-none">Verified</span>
                <span className="text-[10px] text-stone-400 font-medium mt-0.5">Klaim Resmi Mitra</span>
              </div>
            </div>
          </div>

          {/* ── Feature strip (full width, below left content) ── */}
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white/85 backdrop-blur-sm rounded-2xl border border-stone-200/80 shadow-xs">
                <div className={`${f.bg} rounded-xl w-9 h-9 flex items-center justify-center shrink-0`}>
                  {f.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-800">{f.title}</div>
                  <div className="text-[11px] text-stone-400 leading-snug mt-0.5">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PLACEMENT SHOWCASE ─────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-stone-200/80">
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
            {/* ── 1. Homepage Hero ── */}
            <SlotCard
              featured={placement === 'homepage_hero' || !placement}
              badge="Impression Tertinggi"
              badgeVariant="accent"
              icon={<Layout className="w-4 h-4 text-blue-600" />}
              title="Homepage Hero Banner"
              description="Banner paling utama di halaman terdepan Jogjagem. Dilihat pertama kali oleh jutaan wisatawan yang sedang mencari ide petualangan di Jogja."
              formatLabel="1600×500 — 16:5"
              onSelect={() => { window.location.href = getSlotUrl('homepage_hero'); }}
              preview={
                <PreviewFrame>
                  <div className="h-[60px] bg-blue-500 flex items-center justify-center">
                    <span className="text-[10px] text-white font-semibold tracking-wide">✦ Iklanmu di sini</span>
                  </div>
                  <div className="p-2 space-y-1.5">
                    <div className="h-1.5 w-3/5 bg-gray-200 rounded" />
                    <div className="h-1.5 w-2/5 bg-gray-200 rounded" />
                    <div className="flex gap-1.5 mt-1">
                      <div className="h-8 w-1/3 bg-gray-100 rounded" />
                      <div className="h-8 w-1/3 bg-gray-100 rounded" />
                      <div className="h-8 w-1/3 bg-gray-100 rounded" />
                    </div>
                  </div>
                </PreviewFrame>
              }
            />

            {/* ── 2. Destination Detail ── */}
            <SlotCard
              featured={placement === 'destination_detail'}
              badge="Targeting Spesifik"
              badgeVariant="success"
              icon={<MapPin className="w-4 h-4 text-emerald-600" />}
              title="Destination Detail Sponsorship"
              description="Tampil eksklusif di dalam halaman detail destinasi wisata populer. Menjangkau calon pengunjung yang sedang aktif merencanakan kunjungan."
              formatLabel="1200×375 — 16:5 wide"
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

            {/* ── 3. Listing Top Priority ── */}
            <SlotCard
              featured={placement === 'listing_top'}
              badge="Konversi Tinggi"
              badgeVariant="pro"
              icon={<Sparkles className="w-4 h-4 text-purple-600" />}
              title="Listing Top Priority"
              description="Menempatkan bisnis Anda di urutan teratas hasil pencarian & katalog rekomendasi sesuai kategori — tanpa elemen visual baru."
              formatLabel="Native card — posisi #1"
              onSelect={() => { window.location.href = getSlotUrl('listing_top'); }}
              preview={
                <PreviewFrame>
                  <div className="p-2 space-y-1.5">
                    <div className="h-7 bg-purple-500 rounded flex items-center gap-2 px-2">
                      <div className="w-4 h-4 bg-white/40 rounded shrink-0" />
                      <span className="text-[8px] text-white font-semibold">Bisnismu · posisi #1</span>
                      <span className="ml-auto text-[7px] bg-white/20 text-white px-1 rounded">AD</span>
                    </div>
                    <div className="h-6 flex items-center gap-2 px-1">
                      <div className="w-4 h-4 bg-gray-200 rounded shrink-0" />
                      <div className="h-1.5 w-1/2 bg-gray-200 rounded" />
                    </div>
                    <div className="h-6 flex items-center gap-2 px-1">
                      <div className="w-4 h-4 bg-gray-200 rounded shrink-0" />
                      <div className="h-1.5 w-2/5 bg-gray-200 rounded" />
                    </div>
                    <div className="h-6 flex items-center gap-2 px-1">
                      <div className="w-4 h-4 bg-gray-200 rounded shrink-0" />
                      <div className="h-1.5 w-3/5 bg-gray-200 rounded" />
                    </div>
                  </div>
                </PreviewFrame>
              }
            />

            {/* ── 4. Native In-Feed ── */}
            <SlotCard
              featured={placement === 'listing_native'}
              badge="Seamless Experience"
              badgeVariant="warning"
              icon={<Store className="w-4 h-4 text-amber-600" />}
              title="Native In-Feed Ad"
              description="Banner yang menyatu secara seamless di antara daftar rekomendasi tempat menarik — tidak mengganggu kenyamanan eksplorasi pengunjung."
              formatLabel="480×360 — native card integration"
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
          </div>
        </div>
      </section>

      {/* ─── WHY JOGJAGEM ───────────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Target Audiens Tepat', desc: 'Pengunjung platform kami adalah wisatawan yang secara aktif sedang menyusun rencana perjalanan ke Yogyakarta.' },
            { title: 'Analitik Real-Time', desc: 'Pantau performa iklan Anda melalui Business Portal dengan statistik tayangan dan klik yang transparan.' },
            { title: 'Klaim Lisensi Resmi Mitra', desc: 'Dapatkan badge verifikasi resmi dan kelola penuh informasi bisnis Anda tanpa perantara.' },
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
      <section className="pb-16">
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
            className="shrink-0 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-sm shadow-md transition-all"
          >
            {primaryCtaText} →
          </Link>
        </div>
        </div>
      </section>

      <footer className="mt-auto py-8 border-t border-stone-200 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} Jogjagem Business & Ads Platform. All rights reserved.
      </footer>
    </div>
  );
}
