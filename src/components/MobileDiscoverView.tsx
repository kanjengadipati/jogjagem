'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, Bell, Star, Heart, ChevronRight,
  Grid2x2, Compass, Utensils, Calendar, MoreHorizontal, Bookmark,
  Mic, MicOff, Camera, Loader2,
} from 'lucide-react';
import { Destination, Festival } from '../types';
import { auth, ai } from '../lib/api';
import { useLocation } from '@/contexts/LocationContext';
import {
  TuguJogjaIcon,
  HiddenGemsIcon,
  NatureEscapesIcon,
  CulinaryLegendsIcon,
  HeritageIcon,
  AdventureIcon,
  BeachesIcon,
  FamilyFriendlyIcon,
  WeekendIdeasIcon,
} from './CategoryIcons';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';

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
  trendingLoading: boolean;
  aiPicks: AIPick[];
  onToggleSave: (dest: Destination) => void;
  isSaved: (id: string) => boolean;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

// ─── Category pill config ─────────────────────────────────────────────────────

const MOBILE_CATS = [
  { id: null,        label: 'Semua',      Icon: TuguJogjaIcon },
  { id: 'heritage',  label: 'Destinasi',  Icon: HeritageIcon },
  { id: 'culinary',  label: 'Kuliner',    Icon: CulinaryLegendsIcon },
  { id: 'adventure', label: 'Petualangan',Icon: AdventureIcon },
  { id: '__more__',  label: 'Lainnya',    Icon: WeekendIdeasIcon },
] as const;

// ─── All categories for "Lainnya" expanded row ───────────────────────────────

const MORE_CATS = [
  { id: 'hidden-gem', label: 'Hidden Gems', Icon: HiddenGemsIcon },
  { id: 'nature',     label: 'Alam',        Icon: NatureEscapesIcon },
  { id: 'beach',      label: 'Pantai',      Icon: BeachesIcon },
  { id: 'family',     label: 'Keluarga',    Icon: FamilyFriendlyIcon },
  { id: 'weekend',    label: 'Akhir Pekan', Icon: WeekendIdeasIcon },
] as const;

const DEFAULT_ORDER = [
  'keraton', 'kalibiru', 'tebingbreksi', 'timang',
  'pinusmangunan', 'ratuboko', 'prambanan', 'parangtritis',
  'goajomblang', 'malioboro', 'merapi', 'tamansari',
];

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const HERO_SLIDES = [
  { id: 'prambanan', name: 'Prambanan Temple', tagline: 'Candi Hindu abad ke-9 yang megah.', image: 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?auto=format&fit=crop&w=1200&q=80' },
  { id: 'parangtritis', name: 'Parangtritis Beach', tagline: 'Pasir vulkanik hitam dan sunset mistis.', image: 'https://images.unsplash.com/photo-1602137704924-9a038cfb5253?auto=format&fit=crop&w=1200&q=80' },
  { id: 'merapi', name: 'Mount Merapi', tagline: 'Petualangan jeep lava tour.', image: 'https://images.unsplash.com/photo-1556375403-b96342fc0ee2?auto=format&fit=crop&w=1200&q=80' },
  { id: 'tamansari', name: 'Taman Sari', tagline: 'Istana air kerajaan yang tersembunyi.', image: 'https://images.unsplash.com/photo-1625506276715-76ad63823181?auto=format&fit=crop&w=1200&q=80' },
  { id: 'goajomblang', name: 'Goa Jomblang', tagline: 'Cahaya surga di dalam gua.', image: 'https://images.unsplash.com/photo-1628047563315-d1e8b8d222b9?auto=format&fit=crop&w=1200&q=80' },
];

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
  trendingLoading,
  aiPicks,
  onToggleSave,
  isSaved,
  onOpenAuth,
}: MobileDiscoverViewProps) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLocale();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [recommendation, setRecommendation] = useState<{
    dest: Destination; headline: string; reason: string;
  } | null>(null);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [showMoreCats, setShowMoreCats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (allDestinations.length === 0) return;
    const hour = new Date().getHours();
    const timeOfDay = hour < 11 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const fallbackDest = allDestinations.find(d => d.id === 'merapi' || d.id === 'prambanan') || allDestinations[0];
    if (fallbackDest && !recommendation) {
      setRecommendation({ dest: fallbackDest, headline: '', reason: fallbackDest.tagline });
    }
    ai.recommend(timeOfDay).then(res => {
      if (res.status === 'success' && res.data) {
        const data = res.data;
        const recommendedDest = allDestinations.find(d => d.id?.toLowerCase() === data.destinationId?.toLowerCase());
        if (recommendedDest) {
          setRecommendation({ dest: recommendedDest, headline: data.headline, reason: data.reason });
        }
      }
    }).catch(() => {});
  }, [allDestinations]);

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

      {/* ═══ Full-bleed hero section (slideshow bg behind header → hero → search → trending) ═══ */}
      <div className="relative">
        {/* Background slideshow — covers entire first screen */}
        <div className="absolute inset-0 overflow-hidden -z-0">
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-70' : 'opacity-0'}`}
            >
              <Image src={slide.image} alt={slide.name} fill className="h-full w-full object-cover object-center brightness-90" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0f0e0c]/40 via-[#0f0e0c]/20 to-[#0f0e0c]" />
            </div>
          ))}
        </div>

        {/* ── Header ── */}
        <div className="sticky top-0 z-40 bg-[#0f0e0c]/70 backdrop-blur-md px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-white/5">
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

        <div className="relative z-10 space-y-6 pt-4 pb-6">

          {/* ── Hero greeting + Rec card ── */}
          <div className="px-4 flex items-center justify-between gap-3">
            {/* Left: greeting + headline */}
            <div className="flex-1">
              <p className="text-gold-400 text-[11px] font-semibold uppercase tracking-widest mb-1">
                {t('hero.good_morning', { name: isAuthenticated && user?.name ? user.name : 'Traveler' })}
              </p>
              <h1 className="font-manrope text-[26px] font-extrabold leading-tight text-white">
                Jelajahi <br />
                Yogyakarta <br />
                <span className="text-gold-400">Lebih Dalam</span>
              </h1>
              <p className="text-white/50 text-[11px] mt-1.5 leading-relaxed max-w-[180px]">
                Temukan destinasi terbaik, kuliner, event seru dan pengalaman tak terlupakan.
              </p>
            </div>

            {/* Right: AI recommendation card */}
            {recommendation && (() => {
              const img = recommendation.dest.images?.[0]?.url || recommendation.dest.ogImageUrl || '';
              return (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/destinations/${toSlug(recommendation.dest.name)}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/destinations/${toSlug(recommendation.dest.name)}`); }}
                  className="relative w-[156px] aspect-[2/3] rounded-2xl overflow-hidden shrink-0 border border-gold-500/30 shadow-lg cursor-pointer"
                >
                  {img && <Image src={img} alt={recommendation.dest.name} fill className="object-cover object-center" referrerPolicy="no-referrer" />}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/30 to-black/80" />
                  <div className="relative z-10 flex flex-col h-full px-2.5 pt-2.5 pb-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-gold-400 shrink-0"><path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor"/></svg>
                        <span className="text-[7px] font-bold tracking-widest uppercase text-gold-400">{t('hero.jogjagem_rekom')}</span>
                      </div>
                      <button
                        onClick={(e) => handleToggleSave(e, recommendation.dest)}
                        className="flex items-center justify-center h-4 w-4 rounded-full"
                      >
                        <Bookmark className={`h-2.5 w-2.5 ${isSaved(recommendation.dest.id) ? 'fill-gold-400 text-gold-400' : 'text-white/60'}`} />
                      </button>
                    </div>
                    <h3 className="text-[12px] font-bold text-white leading-tight mb-0.5 drop-shadow">{recommendation.dest.name}</h3>
                    <p className="text-[8px] text-white/70 leading-relaxed line-clamp-2 mb-auto drop-shadow">{recommendation.reason || recommendation.dest.tagline}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-0.5 text-[8px] font-bold text-gold-400">
                        <Star className="h-2 w-2 fill-gold-400" />{recommendation.dest.rating?.toFixed(1) ?? '4.9'}
                      </span>
                      <span className="text-[7px] text-white/40 font-mono">📍 {recommendation.headline ? t('hero.ai_recommendation') : recommendation.dest.subRegion || recommendation.dest.location}</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Slide tagline — below headline + card row */}
          <div className="px-4">
            <p className="text-white/50 text-[11px] mt-3 leading-relaxed">
              {HERO_SLIDES[currentSlide].tagline}
            </p>

            {/* Slide indicators */}
            <div className="flex items-center gap-1.5 mt-3">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-0.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide ? 'w-5 bg-gold-400' : 'w-2 bg-white/30'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
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
                placeholder={t('hero.search_placeholder_mobile')}
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
          {(trendingLoading || trendingItems.length > 0) && (
            <div>
              <SectionHeader title="Sedang Trending" onSeeAll={() => router.push('/destinations')} />
              <div className="flex gap-2.5 overflow-x-auto scrollbar-none px-4 snap-x snap-mandatory">
                {trendingLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="shrink-0 snap-start w-[100px] rounded-2xl overflow-hidden bg-white/5 border border-white/8 animate-pulse">
                        <div className="h-[72px] bg-white/10" />
                        <div className="p-2 space-y-1.5">
                          <div className="h-2 w-16 bg-white/10 rounded" />
                          <div className="h-2 w-10 bg-white/10 rounded" />
                        </div>
                      </div>
                    ))
                  : trendingItems.slice(0, 6).map(item => {
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

        </div>
      </div>

      {/* ═══ Rest of the page (no slideshow bg) ═══ */}
      <div className="space-y-6 pt-6">

        {/* ── Category pills ── */}
        <div>
          <SectionHeader title="Jelajahi Kategori" />
          {/* Main category pills row */}
          <div className="grid grid-cols-5 gap-2 px-4">
            {MOBILE_CATS.map(({ id, label, Icon }) => {
              const active = id === '__more__' ? showMoreCats : selectedCat === id;
              return (
                <button
                  key={String(id)}
                  onClick={() => {
                    if (id === '__more__') { setShowMoreCats(v => !v); return; }
                    setShowMoreCats(false);
                    setSelectedCat(active ? null : (id as string | null));
                  }}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl border transition-all duration-200 ${
                    active
                      ? 'bg-gold-500 border-gold-500'
                      : 'bg-white/6 border-white/10'
                  }`}
                >
                  <Icon className={`h-7 w-7 ${active ? 'text-royal-950' : 'text-gold-400'}`} />
                  <span className={`text-[9px] font-bold text-center leading-tight px-0.5 ${active ? 'text-royal-950' : 'text-white/60'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded "Lainnya" row — same pill style, 5-col grid to match main row */}
          {showMoreCats && (
            <div className="grid grid-cols-5 gap-2 px-4 mt-2">
              {MORE_CATS.map(cat => {
                const active = selectedCat === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCat(active ? null : cat.id);
                      setShowMoreCats(false);
                    }}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl border transition-all duration-200 ${
                      active ? 'bg-gold-500 border-gold-500' : 'bg-white/6 border-white/10'
                    }`}
                  >
                    <cat.Icon className={`h-7 w-7 ${active ? 'text-royal-950' : 'text-gold-400'}`} />
                    <span className={`text-[9px] font-bold text-center leading-tight px-0.5 ${active ? 'text-royal-950' : 'text-white/60'}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Popular destinations ── */}
        <div>
          <SectionHeader title="Destinasi Populer" onSeeAll={() => router.push('/destinations')} />
          <div className="grid grid-cols-2 gap-2.5 px-4">
            {popularDests.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-[18px] overflow-hidden bg-white/5 border border-white/8 animate-pulse" style={{ aspectRatio: '1/1' }}>
                    <div className="w-full h-full bg-white/10" />
                  </div>
                ))
              : popularDests.slice(0, 6).map(dest => {
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
        {(allEvents.length > 0 || trendingLoading) && (
          <div>
            <SectionHeader title="Event & Festival" onSeeAll={() => router.push('/events')} />
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none px-4 snap-x snap-mandatory">
              {allEvents.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="shrink-0 snap-start w-[88px] rounded-2xl overflow-hidden bg-white/5 border border-white/8 animate-pulse">
                      <div className="h-[80px] bg-white/10" />
                      <div className="p-2 space-y-1.5">
                        <div className="h-2 w-14 bg-white/10 rounded" />
                        <div className="h-2 w-10 bg-white/10 rounded" />
                      </div>
                    </div>
                  ))
                : allEvents.slice(0, 6).map(evt => {
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
        {(aiDestinations.length > 0 || trendingLoading) && (
          <div>
            <SectionHeader title="Pilihan AI Untukmu" onSeeAll={() => router.push('/ai')} />
            <div className="grid grid-cols-2 gap-2.5 px-4">
              {aiDestinations.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="rounded-[18px] overflow-hidden bg-white/5 border border-white/8 animate-pulse" style={{ aspectRatio: '1/1' }}>
                      <div className="w-full h-full bg-white/10" />
                    </div>
                  ))
                : aiDestinations.slice(0, 4).map(({ pick, dest }) => {
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
    </div>
  );
}
