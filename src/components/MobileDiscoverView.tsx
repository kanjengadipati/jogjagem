'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, Bell, Star, Heart, ChevronRight,
  Grid2x2, Compass, Utensils, Calendar, MoreHorizontal,
  Mic, MicOff, Camera, Loader2,
} from 'lucide-react';
import { Destination, Festival } from '../types';
import { auth, ai } from '../lib/api';
import { useLocation } from '@/contexts/LocationContext';

// ─── Types ───────────────────────────────────────────────────────────────────

interface TrendingItem {
  type: 'destination' | 'event';
  id: string;
  badge: string;
  headline: string;
  imageUrl: string;
  rating: number;
  location: string;
}

interface AIPick {
  destinationId: string;
  badge: string;
  headline?: string;
  crowd: string;
  imageUrl?: string;
  rating: number;
}

interface MobileDiscoverViewProps {
  allDestinations: Destination[];
  allEvents: Festival[];
  trendingItems: TrendingItem[];
  aiPicks: AIPick[];
  onToggleSave: (dest: Destination) => void;
  isSaved: (id: string) => boolean;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

// ─── Category pill config ─────────────────────────────────────────────────────

const MOBILE_CATS = [
  { id: null,        label: 'Semua',    Icon: Grid2x2 },
  { id: 'heritage',  label: 'Destinasi', Icon: Compass },
  { id: 'culinary',  label: 'Kuliner',   Icon: Utensils },
  { id: 'adventure', label: 'Event',     Icon: Calendar },
  { id: '__more__',  label: 'Lainnya',   Icon: MoreHorizontal },
] as const;

// ─── All categories for "Lainnya" bottom sheet ───────────────────────────────

const ALL_CATS = [
  { id: 'hidden-gem', label: 'Hidden Gems' },
  { id: 'nature',     label: 'Alam' },
  { id: 'culinary',   label: 'Kuliner' },
  { id: 'heritage',   label: 'Warisan Budaya' },
  { id: 'adventure',  label: 'Petualangan' },
  { id: 'beach',      label: 'Pantai' },
  { id: 'family',     label: 'Keluarga' },
  { id: 'weekend',    label: 'Ide Akhir Pekan' },
] as const;

const DEFAULT_ORDER = [
  'keraton', 'kalibiru', 'tebingbreksi', 'timang',
  'pinusmangunan', 'ratuboko', 'prambanan', 'parangtritis',
  'goajomblang', 'malioboro', 'merapi', 'tamansari',
];

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function parseEventDate(raw: string): { day: string; month: string } {
  const ISO_RE = /(\d{4})-(\d{2})-(\d{2})/;
  const m = raw.match(ISO_RE);
  if (m) {
    const d = new Date(`${m[1]}-${m[2]}-${m[3]}`);
    return {
      day: String(d.getDate()).padStart(2, '0'),
      month: d.toLocaleString('id-ID', { month: 'short' }).toUpperCase().slice(0, 3),
    };
  }
  return { day: '--', month: '---' };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-3 px-4">
      <span className="text-white font-manrope font-bold text-[15px] tracking-tight">{title}</span>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className="flex items-center gap-0.5 text-gold-400 text-[11px] font-semibold"
        >
          Lihat Semua <ChevronRight className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MobileDiscoverView({
  allDestinations,
  allEvents,
  trendingItems,
  aiPicks,
  onToggleSave,
  isSaved,
  onOpenAuth,
}: MobileDiscoverViewProps) {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [showMoreCats, setShowMoreCats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/ai?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setSearchQuery(transcript);
        router.push(`/ai?q=${encodeURIComponent(transcript)}`);
      }
    };
    if (isListening) recognition.stop(); else recognition.start();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    setIsUploadingImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
      });
      const previewUrl = URL.createObjectURL(file);
      const res = await ai.imageSearch(base64Data, file.type);
      if (res.status === 'success' && res.data) {
        try {
          sessionStorage.setItem('ai_image_result', JSON.stringify({
            imageUrl: previewUrl,
            reply: res.data.reply,
            matchedDestinationIds: res.data.matchedDestinationIds,
          }));
        } catch { /* ignore */ }
        router.push('/ai');
      }
    } catch { /* ignore */ }
    finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = '';
    }
  };

  const { coords, permission, requestLocation } = useLocation();
  const [locationName, setLocationName] = useState('Yogyakarta');

  useEffect(() => {
    if (!coords) return;
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lng}&format=json&accept-language=id`,
      { headers: { 'User-Agent': 'jogjagem-app/1.0' } }
    )
      .then(r => r.json())
      .then(data => {
        // Prefer county (kabupaten/kota) level, fall back to city/state
        const a = data?.address;
        const name =
          a?.county ||        // e.g. Kabupaten Gunungkidul
          a?.city ||          // e.g. Kota Yogyakarta
          a?.town ||
          a?.village ||
          a?.state_district ||
          'Yogyakarta';
        // Strip "Kabupaten " / "Kota " prefix for brevity
        setLocationName(name.replace(/^(Kabupaten|Kota)\s+/i, ''));
      })
      .catch(() => {});
  }, [coords]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 11) return 'Selamat Pagi';
    if (h < 15) return 'Selamat Siang';
    if (h < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  })();

  // Popular destinations — fixed order, filtered by category
  const popularDests = (() => {
    if (selectedCat && selectedCat !== '__more__') {
      return allDestinations.filter(d => d.category === selectedCat).slice(0, 6);
    }
    return DEFAULT_ORDER
      .map(id => allDestinations.find(d => d.id === id))
      .filter((d): d is Destination => d !== undefined);
  })();

  const handleToggleSave = (e: React.MouseEvent, dest: Destination) => {
    e.stopPropagation();
    e.preventDefault();
    if (!auth.isLoggedIn()) { onOpenAuth('login'); return; }
    onToggleSave(dest);
  };

  // AI pick destinations
  const aiDestinations = (
    aiPicks.length > 0
      ? aiPicks.slice(0, 4)
      : allDestinations.slice(0, 4).map(d => ({
          destinationId: d.id,
          badge: 'AI Pick',
          crowd: 'Sepi',
          rating: d.rating,
        }))
  )
    .map(p => ({
      pick: p,
      dest: allDestinations.find(d => d.id === p.destinationId),
    }))
    .filter((x): x is { pick: AIPick; dest: Destination } => x.dest !== undefined);

  return (
    <div className="md:hidden min-h-screen bg-[#0f0e0c] pb-32">

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 bg-[#0f0e0c]/95 backdrop-blur-md px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <Image src="/logo-gold-new.png" alt="Jogjagem" width={24} height={24} className="h-6 w-auto" />
          <span className="font-manrope font-bold text-white text-[16px] tracking-widest uppercase">Jogjagem</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => permission !== 'granted' && requestLocation()}
            className="flex items-center gap-1 text-white/60 text-[11px] font-medium active:opacity-70"
          >
            <MapPin className="h-3.5 w-3.5 text-gold-400 shrink-0" />
            <span className="max-w-[100px] truncate">{locationName}</span>
          </button>
          <button className="relative p-1.5">
            <Bell className="h-5 w-5 text-white/70" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-gold-400" />
          </button>
        </div>
      </div>

      <div className="space-y-6 pt-4">

        {/* ── Hero greeting + AI card ── */}
        <div className="px-4">
          <p className="text-gold-400 text-[11px] font-semibold uppercase tracking-widest mb-1">
            {greeting}, Traveler! ✨
          </p>
          <div className="flex items-start justify-between gap-3">
            {/* Left: headline */}
            <div className="flex-1">
              <h1 className="font-manrope text-[26px] font-extrabold leading-tight text-white">
                Jelajahi <br />
                Yogyakarta <br />
                <span className="text-gold-400">Lebih Dalam</span>
              </h1>
              <p className="text-white/50 text-[11px] mt-1.5 leading-relaxed max-w-[180px]">
                Temukan destinasi terbaik, kuliner, event seru dan pengalaman tak terlupakan.
              </p>
            </div>

            {/* Right: AI recommendation mini-card */}
            {allDestinations.length > 0 && (() => {
              const rec = allDestinations.find(d => d.id === 'prambanan') || allDestinations[0];
              const img = rec.images?.[0]?.url || rec.ogImageUrl || '';
              return (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/destinations/${toSlug(rec.name)}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/destinations/${toSlug(rec.name)}`); }}
                  className="relative w-[120px] h-[130px] rounded-2xl overflow-hidden shrink-0 border border-gold-500/30 shadow-lg cursor-pointer"
                >
                  {img && <Image src={img} alt={rec.name} fill className="object-cover" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute top-2 left-2 bg-gold-500 text-royal-950 text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                    Jogjagem Rekom
                  </div>
                  <button
                    onClick={(e) => handleToggleSave(e, rec)}
                    className="absolute top-2 right-2 h-5 w-5 rounded-full bg-black/40 flex items-center justify-center"
                  >
                    <Heart className={`h-3 w-3 ${isSaved(rec.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 p-2 text-left">
                    <p className="text-white font-bold text-[11px] leading-tight line-clamp-1">{rec.name}</p>
                    <p className="text-white/50 text-[9px] mt-0.5">{rec.subRegion || rec.location}</p>
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                      <span className="text-gold-400 text-[9px] font-bold">{rec.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="px-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-2xl px-3 py-2">
            <Search className="h-4 w-4 text-white/40 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari destinasi, kuliner, atau aktivitas..."
              className="flex-1 bg-transparent text-white text-[13px] placeholder-white/35 outline-none font-medium min-w-0"
            />
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="h-7 w-7 flex items-center justify-center rounded-xl text-white/50 hover:text-white transition-colors disabled:opacity-40"
              >
                {isUploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`h-7 w-7 flex items-center justify-center rounded-xl transition-colors ${isListening ? 'text-red-400 animate-pulse' : 'text-white/50 hover:text-white'}`}
              >
                {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              </button>
              <button
                type="submit"
                className="h-7 w-7 flex items-center justify-center rounded-xl bg-gold-500 text-royal-950"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* ── Trending ── */}
        {trendingItems.length > 0 && (
          <div>
            <SectionHeader title="Sedang Trending" onSeeAll={() => router.push('/destinations')} />
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none px-4 snap-x snap-mandatory">
              {trendingItems.slice(0, 6).map(item => {
                const dest = item.type === 'destination'
                  ? allDestinations.find(d => d.id === item.id)
                  : null;
                return (
                  <button
                    key={`trend-${item.id}`}
                    onClick={() => {
                      if (dest) router.push(`/destinations/${toSlug(dest.name)}`);
                      else if (item.type === 'event') router.push(`/events/${item.id}`);
                    }}
                    className="shrink-0 snap-start w-[100px] rounded-2xl overflow-hidden bg-white/5 border border-white/8 text-left active:scale-95 transition-transform"
                  >
                    <div className="relative h-[72px]">
                      {item.imageUrl
                        ? <Image src={item.imageUrl} alt={item.headline} fill className="object-cover" referrerPolicy="no-referrer" />
                        : <div className="w-full h-full bg-white/10" />
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <span className="absolute bottom-1.5 left-2 text-white/50 text-[8px] font-mono">
                        {item.location}
                      </span>
                    </div>
                    <div className="p-2">
                      <p className="text-white text-[10px] font-bold leading-tight line-clamp-2">{item.headline}</p>
                      {item.rating > 0 && (
                        <div className="flex items-center gap-0.5 mt-1">
                          <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                          <span className="text-gold-400 text-[9px] font-bold">{item.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Category pills ── */}
        <div>
          <SectionHeader title="Jelajahi Kategori" />
          <div className="flex gap-2 overflow-x-auto scrollbar-none px-4">
            {MOBILE_CATS.map(({ id, label, Icon }) => {
              const active = id === '__more__' ? showMoreCats : selectedCat === id;
              return (
                <button
                  key={String(id)}
                  onClick={() => {
                    if (id === '__more__') { setShowMoreCats(true); return; }
                    setSelectedCat(active ? null : (id as string | null));
                  }}
                  className={`shrink-0 flex flex-col items-center gap-1.5 px-3.5 py-2.5 rounded-2xl border transition-all duration-200 min-w-[64px] ${
                    active
                      ? 'bg-gold-500 border-gold-500 text-royal-950'
                      : 'bg-white/6 border-white/10 text-white/70'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-royal-950' : 'text-gold-400'}`} />
                  <span className="text-[10px] font-bold whitespace-nowrap">{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Popular destinations ── */}
        <div>
          <SectionHeader title="Destinasi Populer" onSeeAll={() => router.push('/destinations')} />
          <div className="grid grid-cols-2 gap-2.5 px-4">
            {popularDests.slice(0, 6).map(dest => {
              const img = dest.images?.[0]?.url || dest.ogImageUrl || '';
              return (
                <div
                  key={dest.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/destinations/${toSlug(dest.name)}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/destinations/${toSlug(dest.name)}`); }}
                  className="relative rounded-[18px] overflow-hidden bg-white/5 border border-white/8 text-left cursor-pointer active:scale-[0.98] transition-transform"
                  style={{ aspectRatio: '1/1' }}
                >
                  {img && <Image src={img} alt={dest.name} fill className="object-cover" referrerPolicy="no-referrer" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <button
                    onClick={(e) => handleToggleSave(e, dest)}
                    className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10"
                  >
                    <Heart className={`h-3.5 w-3.5 ${isSaved(dest.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 p-2.5">
                    <p className="text-white font-bold text-[12px] leading-tight line-clamp-2">{dest.name}</p>
                    <p className="text-white/50 text-[9px] mt-0.5 truncate">{dest.subRegion || dest.location}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                      <span className="text-gold-400 text-[10px] font-bold">{dest.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Event & Festival ── */}
        {allEvents.length > 0 && (
          <div>
            <SectionHeader title="Event & Festival" onSeeAll={() => router.push('/events')} />
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none px-4 snap-x snap-mandatory">
              {allEvents.slice(0, 6).map(evt => {
                const { day, month } = parseEventDate(evt.date);
                return (
                  <button
                    key={evt.id}
                    onClick={() => router.push(`/events/${evt.id}`)}
                    className="shrink-0 snap-start w-[88px] rounded-2xl overflow-hidden bg-white/5 border border-white/8 text-left active:scale-95 transition-transform"
                  >
                    <div className="relative h-[80px]">
                      {evt.image
                        ? <Image src={evt.image} alt={evt.name} fill className="object-cover" referrerPolicy="no-referrer" />
                        : <div className="w-full h-full bg-white/10" />
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      {/* Date badge */}
                      <div className="absolute top-2 left-2 bg-gold-500 text-royal-950 rounded-xl px-1.5 py-0.5 text-center min-w-[28px]">
                        <p className="text-[11px] font-extrabold leading-none">{day}</p>
                        <p className="text-[7px] font-bold leading-none mt-0.5">{month}</p>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-white text-[10px] font-bold leading-tight line-clamp-2">{evt.name}</p>
                      <p className="text-white/40 text-[9px] mt-0.5 truncate">{evt.location}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── AI Picks ── */}
        {aiDestinations.length > 0 && (
          <div>
            <SectionHeader title="Pilihan AI Untukmu" onSeeAll={() => router.push('/ai')} />
            <div className="grid grid-cols-2 gap-2.5 px-4">
              {aiDestinations.slice(0, 4).map(({ pick, dest }) => {
                const img = (pick as any).imageUrl || dest.images?.[0]?.url || dest.ogImageUrl || '';
                return (
                  <div
                    key={dest.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/destinations/${toSlug(dest.name)}`)}
                    onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/destinations/${toSlug(dest.name)}`); }}
                    className="relative rounded-[18px] overflow-hidden bg-white/5 border border-white/8 text-left cursor-pointer active:scale-[0.98] transition-transform"
                    style={{ aspectRatio: '1/1' }}
                  >
                    {img && <Image src={img} alt={dest.name} fill className="object-cover" referrerPolicy="no-referrer" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <div className="absolute top-2.5 left-2.5 bg-amber-500/90 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide">
                      {pick.badge}
                    </div>
                    <button
                      onClick={(e) => handleToggleSave(e, dest)}
                      className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10"
                    >
                      <Heart className={`h-3.5 w-3.5 ${isSaved(dest.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    <div className="absolute bottom-0 inset-x-0 p-2.5">
                      <p className="text-white font-bold text-[12px] leading-tight line-clamp-1">{dest.name}</p>
                      <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-0.5">
                          <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                          <span className="text-gold-400 text-[10px] font-bold">
                            {(pick.rating || dest.rating || 0).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-white/40 text-[8px] font-mono">{pick.crowd}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

    {/* ── "Lainnya" category bottom sheet ── */}
    {showMoreCats && (
      <>
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMoreCats(false)}
        />
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#1a1814] rounded-t-3xl border-t border-white/10 px-4 pt-5 pb-[calc(24px+env(safe-area-inset-bottom,0px))]">
          <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />
          <p className="text-white font-manrope font-bold text-[15px] mb-4">Semua Kategori</p>
          <div className="grid grid-cols-4 gap-3">
            {ALL_CATS.map(cat => {
              const active = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCat(active ? null : cat.id);
                    setShowMoreCats(false);
                  }}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${
                    active
                      ? 'bg-gold-500 border-gold-500 text-royal-950'
                      : 'bg-white/6 border-white/10 text-white/70'
                  }`}
                >
                  <span className="text-[18px]">
                    {cat.id === 'hidden-gem' ? '💎' :
                     cat.id === 'nature'     ? '🌿' :
                     cat.id === 'culinary'   ? '🍜' :
                     cat.id === 'heritage'   ? '🏛️' :
                     cat.id === 'adventure'  ? '⛰️' :
                     cat.id === 'beach'      ? '🏖️' :
                     cat.id === 'family'     ? '👨‍👩‍👧' : '📅'}
                  </span>
                  <span className="text-[9px] font-bold text-center leading-tight px-1">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </>
    )}
    </div>
  );
}
