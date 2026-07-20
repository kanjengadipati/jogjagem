'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search, MapPin, Bell, Star, Heart, ChevronRight,
  Grid2x2, Compass, Utensils, Calendar, MoreHorizontal, Bookmark,
  Mic, MicOff, Camera, Loader2, Sparkles,
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
import { AIPickCard } from './AIPickCard';

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

const ALL_CATEGORIES = [
  { id: null,         tKey: 'category.all_journeys', Icon: TuguJogjaIcon },
  { id: 'hidden-gem', tKey: 'category.hidden_gem',   Icon: HiddenGemsIcon },
  { id: 'culinary',   tKey: 'category.culinary',     Icon: CulinaryLegendsIcon },
  { id: 'adventure',  tKey: 'category.adventure',    Icon: AdventureIcon },
  { id: 'heritage',   tKey: 'category.heritage',     Icon: HeritageIcon },
  { id: 'nature',     tKey: 'category.nature',       Icon: NatureEscapesIcon },
  { id: 'beach',      tKey: 'category.beach',        Icon: BeachesIcon },
  { id: 'family',     tKey: 'category.family',       Icon: FamilyFriendlyIcon },
  { id: 'weekend',    tKey: 'category.weekend',      Icon: WeekendIdeasIcon },
] as const;

const PRIMARY_CATS = ALL_CATEGORIES.slice(0, 4);
const MORE_CATS = ALL_CATEGORIES.slice(4);

const DEFAULT_ORDER = [
  'keraton', 'kalibiru', 'tebingbreksi', 'timang',
  'pinusmangunan', 'ratuboko', 'prambanan', 'parangtritis',
  'goajomblang', 'malioboro', 'merapi', 'tamansari',
];

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const HERO_SLIDES = [
  { id: 'prambanan',    name: 'Candi Prambanan',   tagline: 'Candi Hindu abad ke-9 yang megah.',         image: 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?auto=format&fit=crop&w=1200&q=80', subRegion: 'Sleman',    latitude: -7.7520, longitude: 110.4914 },
  { id: 'parangtritis', name: 'Pantai Parangtritis', tagline: 'Pasir vulkanik hitam dan sunset mistis.',  image: 'https://images.unsplash.com/photo-1602137704924-9a038cfb5253?auto=format&fit=crop&w=1200&q=80', subRegion: 'Bantul',    latitude: -8.0257, longitude: 110.3348 },
  { id: 'merapi',       name: 'Gunung Merapi',       tagline: 'Petualangan jeep lava tour.',             image: 'https://images.unsplash.com/photo-1556375403-b96342fc0ee2?auto=format&fit=crop&w=1200&q=80', subRegion: 'Sleman',    latitude: -7.5400, longitude: 110.4460 },
  { id: 'tamansari',    name: 'Taman Sari',          tagline: 'Istana air kerajaan yang tersembunyi.',   image: 'https://images.unsplash.com/photo-1625506276715-76ad63823181?auto=format&fit=crop&w=1200&q=80', subRegion: 'Yogyakarta', latitude: -7.8106, longitude: 110.3593 },
  { id: 'goajomblang',  name: 'Goa Jomblang',        tagline: 'Cahaya surga di dalam gua.',             image: 'https://images.unsplash.com/photo-1628047563315-d1e8b8d222b9?auto=format&fit=crop&w=1200&q=80', subRegion: 'Gunungkidul', latitude: -7.9356, longitude: 110.6505 },
];

const MAX_SLIDES = 10;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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
  dark,
}: {
  title: string;
  onSeeAll?: () => void;
  dark?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-3 px-4">
      <span className={`${dark ? 'text-white' : 'text-royal-950'} font-manrope font-bold text-[15px] tracking-tight`}>{title}</span>
      {onSeeAll && (
        <button
          onClick={onSeeAll}
          className={`flex items-center gap-0.5 ${dark ? 'text-gold-400' : 'text-gold-600'} text-[11px] font-semibold`}
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

  const heroSlides = allDestinations.length > 0
    ? [...allDestinations]
        .filter(d => d.images?.[0]?.url && d.category !== 'event' && d.category !== 'weekend' && d.category !== 'culinary')
        .sort((a, b) => b.rating - a.rating)
        .slice(0, MAX_SLIDES)
        .map(d => ({
          id: d.id,
          name: d.name,
          tagline: d.tagline || d.description?.slice(0, 80) || '',
          image: d.images[0].url,
          subRegion: d.subRegion || (d as any).sub_region || '',
          latitude: d.latitude,
          longitude: d.longitude,
        }))
    : HERO_SLIDES;

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % heroSlides.length), 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  useEffect(() => {
    if (allDestinations.length === 0) return;
    const hour = new Date().getHours();
    const timeOfDay = hour < 11 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const fallbackDest = allDestinations.find(d => d.id === 'merapi' || d.id === 'prambanan') || allDestinations[0];
    if (fallbackDest && !recommendation) {
      setRecommendation({ dest: fallbackDest, headline: '', reason: fallbackDest.tagline });
    }
    ai.recommendMulti(timeOfDay).then(res => {
      if (res.status === 'success' && res.data?.items?.length) {
        const data = res.data.items[0];
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

  const handleToggleSave = (e: React.MouseEvent | undefined, dest: Destination) => {
    e?.stopPropagation();
    e?.preventDefault();
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
    <div className="md:hidden min-h-screen bg-[#F5F0E8] text-white">

      {/* ═══ Full-bleed hero section (slideshow bg behind header → hero → search → trending) ═══ */}
      <div className="relative bg-[#1a1814] h-svh flex flex-col overflow-hidden shrink-0">
        {/* Background slideshow — covers entire first screen */}
        <div className="absolute inset-0 overflow-hidden -z-0">
          {heroSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-70' : 'opacity-0'}`}
            >
              <Image src={slide.image} alt={slide.name} fill sizes="100vw" className="h-full w-full object-cover object-center brightness-90" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a1814]/50 via-[#1a1814]/20 via-60% to-[#1a1814]/95" />
            </div>
          ))}
        </div>

        {/* ── Header ── */}
        <div className="z-40 bg-[#1a1814]/75 backdrop-blur-md px-4 pt-3 pb-2.5 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2">
            <Image src="/logo-gold-new.png" alt="Jogjagem" width={24} height={24} className="h-6 w-auto" style={{ width: 'auto' }} />
            <span className="font-manrope font-bold text-white text-[16px] tracking-widest uppercase">Jogjagem</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => permission !== 'granted' && requestLocation()}
              className="flex items-center gap-1 text-white/60 text-[11px] font-medium active:opacity-70"
            >
              <MapPin className="h-3.5 w-3.5 text-gold-500 shrink-0" />
              <span className="max-w-[100px] truncate">{locationName}</span>
            </button>
            <button className="relative p-1.5">
              <Bell className="h-5 w-5 text-white/70" />
              <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-gold-500" />
            </button>
          </div>
        </div>

        {/* ── Hero body ── */}
        <div className="relative z-10 flex-1 flex flex-col pt-4 pb-24 px-4 min-h-0">

          {/* ── AI Card: absolute floating top-right ── */}
          {recommendation ? (
            <div className="absolute top-2 right-4 w-[184px] z-20 animate-[float_4s_ease-in-out_infinite]">
              <AIPickCard
                recommendation={recommendation}
                isSaved={isSaved}
                onToggleSave={(dest) => handleToggleSave(undefined, dest)}
                onExplore={(dest) => router.push(`/destinations/${toSlug(dest.name)}`)}
                className="relative w-full"
                sizes="180px"
              />
            </div>
          ) : (
            <div className="absolute top-2 right-4 w-[184px] aspect-[2/3] rounded-2xl border border-white/5 animate-pulse bg-white/5 z-20" />
          )}

          {/* ── Center block: greeting text ── */}
          <div className="flex-1 flex flex-col justify-center pr-[196px]">
            <p className="text-gold-400 text-[13px] font-semibold uppercase tracking-widest mb-2.5">
              {t('hero.good_morning', { name: isAuthenticated && user?.name ? user.name : 'Traveler' })}
            </p>
            <h1 className="font-manrope text-[32px] sm:text-[36px] font-extrabold leading-[1.15] text-white tracking-tight">
              Jelajahi<br />
              Yogyakarta<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-400 to-gold-500">Lebih Dalam</span>
            </h1>
            <p className="text-white/70 text-[13px] mt-3.5 leading-relaxed max-w-[220px]">
              Destinasi terbaik, kuliner legendaris, dan pengalaman otentik Yogyakarta.
            </p>
          </div>

          {/* ── Bottom: search + trending ── */}
          <div className="shrink-0 flex flex-col gap-3">
            {/* Slide info + dots */}
            <div className="px-1 flex items-center justify-between text-[10px] text-white/50">
              <div className="flex items-center gap-1.5 min-w-0">
                <span>📍</span>
                <span className="font-semibold text-white/75 truncate max-w-[120px]">{heroSlides[currentSlide].name}</span>
                {coords && heroSlides[currentSlide].latitude && heroSlides[currentSlide].longitude && (
                  <span className="shrink-0">({Math.round(haversineKm(coords.lat, coords.lng, heroSlides[currentSlide].latitude, heroSlides[currentSlide].longitude))} km)</span>
                )}
              </div>
              <div className="flex items-center gap-1 ml-auto shrink-0">
                {heroSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-0.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-4 bg-gold-400' : 'w-1.5 bg-white/30'}`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>

            <form onSubmit={handleSearchSubmit} className="relative flex items-center rounded-full border border-white/20 bg-black/40 hover:bg-black/50 backdrop-blur-md p-1 shadow-xl transition-all duration-300 focus-within:ring-2 focus-within:ring-gold-500/50 focus-within:border-gold-400 w-full">
              <Search className="ml-3.5 h-4 w-4 text-white/70 shrink-0" />
              <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('hero.search_placeholder')} className="flex-1 bg-transparent py-2.5 pl-2 pr-2 text-xs text-white placeholder-white/60 focus:outline-none font-sans min-w-0" />
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <div className="flex items-center gap-0.5 shrink-0 mr-1">
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploadingImage} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all disabled:opacity-50" title={t('hero.search_by_image')}>
                  {isUploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                </button>
                <button type="button" onClick={handleVoiceSearch} className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/10 text-white/70 hover:text-white'}`} title={t('hero.search_by_voice')}>
                  {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                </button>
                <button type="submit" className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-gold-400 to-amber-500 hover:from-gold-500 hover:to-amber-600 active:scale-95 text-white transition-all shadow-md">
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>

            {/* Trending */}
            {(trendingLoading || trendingItems.length > 0) && (
              <div className="shrink-0">
                <SectionHeader title="Sedang Trending" dark onSeeAll={() => router.push('/destinations')} />
                <div className="flex gap-3 overflow-x-auto scrollbar-none px-4 snap-x snap-mandatory pb-1">
                  {trendingLoading
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="shrink-0 snap-start w-[110px] rounded-2xl overflow-hidden bg-white/5 border border-white/10 animate-pulse">
                          <div className="h-[70px] bg-white/10" />
                          <div className="p-2 space-y-1.5">
                            <div className="h-2 w-16 bg-white/10 rounded" />
                            <div className="h-3 w-full bg-white/10 rounded" />
                          </div>
                        </div>
                      ))
                    : trendingItems.slice(0, 6).map((item, idx) => {
                        const dest = item.type === 'destination' ? allDestinations.find(d => d.id === item.id) : null;
                        return (
                          <button
                            key={`trend-${item.type}-${item.id}-${idx}`}
                            onClick={() => {
                              if (dest) router.push(`/destinations/${toSlug(dest.name)}`);
                              else if (item.type === 'event') router.push(`/events/${item.id}`);
                            }}
                            className="shrink-0 snap-start w-[110px] rounded-2xl overflow-hidden bg-[#1c1a17]/60 border border-white/10 text-left active:scale-95 transition-transform"
                          >
                            <div className="relative h-[70px] w-full">
                              {item.imageUrl
                                ? <Image src={item.imageUrl} alt={item.headline} fill sizes="110px" className="object-cover" referrerPolicy="no-referrer" />
                                : <div className="w-full h-full bg-white/10" />}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                            </div>
                            <div className="p-2">
                              <p className="text-white text-[10px] font-bold leading-tight line-clamp-2">{item.headline}</p>
                              {item.rating > 0 && (
                                <div className="flex items-center gap-0.5 mt-1">
                                  <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                                  <span className="text-gold-400 text-[9px] font-extrabold">{item.rating.toFixed(1)}</span>
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
      </div>

      {/* ═══ Rest of the page (no slideshow bg) ═══ */}
      <div className="bg-[#F5F0E8] space-y-6 pt-6 pb-32 relative z-20 -mt-4">

        {/* ── Category pills ── */}
        <div>
          <SectionHeader title="Jelajahi Kategori" />
          {/* Primary row: 4 cats + Lainnya button */}
          <div className="grid grid-cols-5 gap-2 px-4">
            {[...PRIMARY_CATS, { id: '__more__' as const, tKey: 'category.more', Icon: MoreHorizontal }].map(({ id, tKey, Icon }) => {
              const isMore = id === '__more__';
              const active = isMore ? showMoreCats : selectedCat === id;
              return (
                <button
                  key={String(id)}
                  onClick={() => {
                    if (isMore) { setShowMoreCats(v => !v); return; }
                    setShowMoreCats(false);
                    setSelectedCat(active ? null : id);
                  }}
                  className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl border transition-all duration-200 ${
                    active ? 'bg-gold-500 border-gold-500' : 'bg-white/6 border-white/10'
                  }`}
                >
                  <Icon className={`h-7 w-7 ${active ? 'text-royal-950' : 'text-gold-400'}`} />
                  <span className={`text-[9px] font-bold text-center leading-tight px-0.5 ${active ? 'text-royal-950' : 'text-white/60'}`}>
                    {t(tKey)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Expanded "Lainnya" row */}
          {showMoreCats && (
            <div className="grid grid-cols-5 gap-2 px-4 mt-2">
              {MORE_CATS.map(cat => {
                const active = selectedCat === cat.id;
                return (
                  <button
                    key={String(cat.id)}
                    onClick={() => { setSelectedCat(active ? null : cat.id); setShowMoreCats(false); }}
                    className={`flex flex-col items-center gap-1.5 py-2.5 rounded-2xl border transition-all duration-200 ${
                      active ? 'bg-gold-500 border-gold-500' : 'bg-white/6 border-white/10'
                    }`}
                  >
                    <cat.Icon className={`h-7 w-7 ${active ? 'text-royal-950' : 'text-gold-400'}`} />
                    <span className={`text-[9px] font-bold text-center leading-tight px-0.5 ${active ? 'text-royal-950' : 'text-white/60'}`}>
                      {t(cat.tKey)}
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
          <div className="grid grid-cols-2 gap-3 px-4">
            {popularDests.length === 0
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-[18px] overflow-hidden bg-royal-950/5 border border-royal-950/10 animate-pulse aspect-[3/4]" />
                ))
              : popularDests.slice(0, 6).map(dest => {
              const img = dest.images?.[0]?.url || dest.ogImageUrl || '';
              return (
                <div
                  key={dest.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/destinations/${toSlug(dest.name)}`)}
                  className="relative rounded-[20px] overflow-hidden bg-white border border-[#E8E0D5] text-left cursor-pointer active:scale-[0.98] transition-all duration-300 shadow-sm hover:shadow-md aspect-[3/4]"
                >
                  {img && <Image src={img} alt={dest.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-105" referrerPolicy="no-referrer" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 via-60% to-transparent" />
                  <button
                    onClick={(e) => handleToggleSave(e, dest)}
                    className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
                  >
                    <Heart className={`h-3.5 w-3.5 ${isSaved(dest.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 p-3">
                    <p className="text-white font-extrabold text-[13px] leading-tight line-clamp-2">{dest.name}</p>
                    <p className="text-white/60 text-[10px] mt-0.5 truncate flex items-center gap-0.5">
                      <span>📍</span> {dest.subRegion || dest.location}
                    </p>
                    <div className="flex items-center gap-0.5 mt-1">
                      <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                      <span className="text-gold-400 text-[11px] font-extrabold">{dest.rating.toFixed(1)}</span>
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
            <div className="flex gap-3.5 overflow-x-auto scrollbar-none px-4 snap-x snap-mandatory pb-1">
              {allEvents.length === 0
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="shrink-0 snap-start w-[140px] rounded-2xl overflow-hidden bg-royal-950/5 border border-royal-950/10 animate-pulse aspect-[3/4]" />
                  ))
                : allEvents.slice(0, 6).map(evt => {
                const { day, month } = parseEventDate(evt.date);
                return (
                  <button
                    key={evt.id}
                    onClick={() => router.push(`/events/${evt.id}`)}
                    className="shrink-0 snap-start w-[140px] rounded-2xl overflow-hidden bg-white border border-[#E8E0D5] text-left active:scale-95 transition-transform shadow-sm flex flex-col aspect-[3/4] relative"
                  >
                    <div className="relative h-[65%] w-full bg-stone-100">
                      {evt.image
                        ? <Image src={evt.image} alt={evt.name} fill sizes="140px" className="object-cover" referrerPolicy="no-referrer" />
                        : <div className="w-full h-full bg-white/10" />
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      {/* Date badge */}
                      <div className="absolute top-2.5 left-2.5 bg-gold-400 text-royal-950 rounded-xl px-2 py-1 text-center min-w-[32px] shadow-md border border-gold-300/30">
                        <p className="text-[12px] font-black leading-none text-[#1c1a17]">{day}</p>
                        <p className="text-[8px] font-bold leading-none mt-0.5 text-[#1c1a17]">{month}</p>
                      </div>
                    </div>
                    <div className="p-2.5 flex-1 flex flex-col justify-between bg-[#1c1a17]">
                      <p className="text-white text-[11px] font-extrabold leading-tight line-clamp-2">{evt.name}</p>
                      <p className="text-white/60 text-[9px] truncate flex items-center gap-0.5 mt-1">
                        <span>📍</span> {evt.location}
                      </p>
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
            <div className="flex gap-3.5 overflow-x-auto scrollbar-none px-4 snap-x snap-mandatory pb-1">
              {aiDestinations.length === 0
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="shrink-0 snap-start w-[240px] rounded-2xl overflow-hidden bg-royal-950/5 border border-royal-950/10 animate-pulse aspect-[16/10]" />
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
                    className="relative shrink-0 snap-start w-[240px] rounded-[22px] overflow-hidden bg-[#1c1a17] border border-[#E8E0D5]/20 text-left cursor-pointer active:scale-[0.98] transition-transform aspect-[16/10]"
                  >
                    {img && <Image src={img} alt={dest.name} fill sizes="240px" className="object-cover" referrerPolicy="no-referrer" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                    
                    <div className="absolute top-3 left-3 bg-amber-500/90 text-white text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                      {pick.badge || 'PILIHAN AI'}
                    </div>
                    
                    <button
                      onClick={(e) => handleToggleSave(e, dest)}
                      className="absolute top-3 right-3 h-7 w-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
                    >
                      <Heart className={`h-3.5 w-3.5 ${isSaved(dest.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                    </button>
                    
                    <div className="absolute bottom-0 inset-x-0 p-3.5 flex flex-col justify-end">
                      <h4 className="text-white font-extrabold text-[14px] leading-tight truncate">{dest.name}</h4>
                      <p className="text-white/70 text-[10px] line-clamp-1 mt-0.5 font-light">
                        {dest.tagline || dest.description?.slice(0, 60)}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-white/10">
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-0.5 text-gold-400 text-[11px] font-bold">
                            <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                            {(pick.rating || dest.rating || 0).toFixed(1)}
                          </span>
                          <span className="text-white/40 text-[9px]">•</span>
                          <span className="text-white/60 text-[9px] font-medium flex items-center gap-0.5">
                            <span>📍</span> {dest.subRegion || dest.location}
                          </span>
                        </div>
                        <span className="text-gold-400 text-[9px] font-extrabold bg-gold-400/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {pick.crowd}
                        </span>
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
