'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Star, Heart, MapPin, Footprints, Thermometer,
  Sparkles, Bookmark, Navigation, Share2, X, ChevronRight,
} from 'lucide-react';
import { Destination } from '../types';
import { useLocale } from '@/contexts/LocaleContext';

// ─── Badge config ─────────────────────────────────────────────────────────────
// Badge ditentukan dari data destinasi (category, rating, reviewCount, bestTime)
// Urutan if-else menentukan prioritas — kriteria paling spesifik di atas.

interface Badge { label: string; color: string }

function getBadge(dest: Destination): Badge {
  const { category, rating, reviewCount, bestTime, openingHours } = dest;
  const bt = (bestTime || '').toLowerCase();
  const oh = (openingHours || '').toLowerCase();

  // Hidden Gem — kualitas tinggi tapi belum banyak yang tahu
  if (rating >= 4.5 && reviewCount < 100)
    return { label: 'Hidden Gem', color: 'bg-teal-600' };

  // Sunset Spot — pantai + waktu terbaik sore/sunset
  if (category === 'beach' && (bt.includes('sore') || bt.includes('sunset') || bt.includes('petang')))
    return { label: 'Sunset Spot', color: 'bg-orange-500' };

  // Instagramable — pantai atau hidden-gem dengan rating tinggi
  if ((category === 'beach' || category === 'hidden-gem') && rating >= 4.4)
    return { label: 'Instagramable', color: 'bg-pink-600' };

  // Perfect Morning — alam atau warisan, waktu terbaik pagi
  if ((category === 'nature' || category === 'heritage') && (bt.includes('pagi') || bt.includes('morning')))
    return { label: 'Perfect Morning', color: 'bg-amber-500' };

  // Night Vibes — buka malam / waktu terbaik malam
  if (bt.includes('malam') || bt.includes('night') || oh.includes('malam') || oh.includes('22') || oh.includes('23'))
    return { label: 'Night Vibes', color: 'bg-indigo-600' };

  // Best for Healing — alam dengan rating bagus
  if (category === 'nature' && rating >= 4.3)
    return { label: 'Best for Healing', color: 'bg-green-700' };

  // Cultural — warisan budaya
  if (category === 'heritage')
    return { label: 'Cultural', color: 'bg-amber-700' };

  // Adventure
  if (category === 'adventure')
    return { label: 'Adventure', color: 'bg-red-600' };

  // Culinary
  if (category === 'culinary')
    return { label: 'Kuliner', color: 'bg-yellow-600' };

  // Family Friendly
  if (category === 'family')
    return { label: 'Keluarga', color: 'bg-blue-600' };

  // Pantai fallback
  if (category === 'beach')
    return { label: 'Pantai', color: 'bg-cyan-700' };

  // Weekend Ideas
  if (category === 'weekend')
    return { label: 'Akhir Pekan', color: 'bg-purple-600' };

  // Fallback — category saja
  return { label: dest.category.replace(/-/g, ' '), color: 'bg-stone-600' };
}

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ─── Quick action config ──────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { id: 'save',   Icon: Heart,       label: 'Save',   bg: 'bg-gold-500' },
  { id: 'route',  Icon: Navigation,  label: 'Route',  bg: 'bg-blue-600' },
  { id: 'askai',  Icon: Sparkles,    label: 'Ask AI', bg: 'bg-purple-600' },
  { id: 'share',  Icon: Share2,      label: 'Share',  bg: 'bg-green-600' },
] as const;

const ACTION_WIDTH = 72; // px per quick action button
const SWIPE_THRESHOLD = 40; // px to trigger reveal

// ─── Props ────────────────────────────────────────────────────────────────────

interface MobileDestinationCardProps {
  destination: Destination;
  isSaved: boolean;
  onToggleSave: (dest: Destination) => void;
  onAuthRequired: () => void;
  /** Optional: estimated walk time in minutes */
  walkMinutes?: number;
  /** Optional: AI reason chip text */
  aiReason?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function MobileDestinationCard({
  destination,
  isSaved,
  onToggleSave,
  onAuthRequired,
  walkMinutes,
  aiReason,
}: MobileDestinationCardProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [swipeX, setSwipeX] = useState(0);  // negative = swiped left
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const badge = getBadge(destination);
  const img = destination.images?.[0]?.url || destination.ogImageUrl || '';
  const totalActions = QUICK_ACTIONS.length;
  const maxSwipe = -(totalActions * ACTION_WIDTH);
  const actionsRevealed = swipeX < -(SWIPE_THRESHOLD);

  // ── Touch handlers ──────────────────────────────────────────────────────────

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(false);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = e.touches[0].clientY - touchStartY.current;
    // Only hijack horizontal swipes
    if (!isSwiping && Math.abs(dy) > Math.abs(dx)) return;
    setIsSwiping(true);
    const newX = Math.min(0, Math.max(maxSwipe, swipeX + dx));
    touchStartX.current = e.touches[0].clientX;
    setSwipeX(newX);
  };

  const onTouchEnd = () => {
    touchStartX.current = null;
    touchStartY.current = null;
    setIsSwiping(false);
    // Snap: fully reveal if past threshold, else snap back
    if (swipeX < maxSwipe / 2) {
      setSwipeX(maxSwipe);
    } else {
      setSwipeX(0);
    }
  };

  const handleQuickAction = (id: typeof QUICK_ACTIONS[number]['id']) => {
    setSwipeX(0);
    if (id === 'save') {
      if (!destination) return;
      onToggleSave(destination);
    } else if (id === 'route') {
      if (destination.googleMapsUrl) window.open(destination.googleMapsUrl, '_blank');
    } else if (id === 'askai') {
      router.push(`/ai?q=${encodeURIComponent(destination.name)}`);
    } else if (id === 'share') {
      if (navigator.share) {
        navigator.share({ title: destination.name, url: `/destinations/${toSlug(destination.name)}` }).catch(() => {});
      }
    }
  };

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(destination);
  };

  const handleExpand = () => {
    if (swipeX !== 0) { setSwipeX(0); return; }
    setExpanded(v => !v);
  };

  const handleExplore = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/destinations/${toSlug(destination.name)}`);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(destination);
  };

  const temp = destination.weather?.temp || '24°C';
  const isOpen = destination.openingHours
    ? (() => {
        const now = new Date();
        const h = now.getHours();
        const match = destination.openingHours.match(/(\d{1,2})[.:h](\d{2})/g);
        if (match && match.length >= 2) {
          const [openH] = match[0].split(/[.:h]/).map(Number);
          const [closeH] = match[1].split(/[.:h]/).map(Number);
          return h >= openH && h < closeH;
        }
        return true;
      })()
    : true;

  return (
    <div className="relative overflow-hidden rounded-[20px]" ref={cardRef}>
      {/* ── Quick action backdrop ── */}
      <div className="absolute inset-y-0 right-0 flex items-stretch" style={{ width: totalActions * ACTION_WIDTH }}>
        {QUICK_ACTIONS.map(({ id, Icon, label, bg }) => (
          <button
            key={id}
            onClick={() => handleQuickAction(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1 ${bg} text-white active:opacity-80 transition-opacity`}
          >
            <Icon className={`h-5 w-5 ${id === 'save' && isSaved ? 'fill-white' : ''}`} />
            <span className="text-[9px] font-bold">{label}</span>
          </button>
        ))}
      </div>

      {/* ── Card (slides left on swipe) ── */}
      <div
        className="relative bg-[#1a1814] rounded-[20px] overflow-hidden cursor-pointer select-none"
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isSwiping ? 'none' : 'transform 0.25s ease',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={handleExpand}
      >
        {/* Image */}
        <div className="relative w-full h-[180px] overflow-hidden">
          {img
            ? <Image src={img} alt={destination.name} fill sizes="(max-width: 768px) 50vw, 33vw" className="object-cover transition-transform duration-500" referrerPolicy="no-referrer" />
            : <div className="w-full h-full bg-[#2a2724]" />
          }
          <div className={`absolute inset-0 bg-gradient-to-t ${expanded ? 'from-[#1a1814] via-black/40 to-transparent' : 'from-black/80 via-black/20 to-transparent'}`} />

          {/* Badge top-left */}
          <div className={`absolute top-2.5 left-2.5 flex items-center gap-1 ${badge.color} px-2 py-0.5 rounded-full`}>
            <Sparkles className="h-2.5 w-2.5 text-white" />
            <span className="text-[9px] font-bold text-white uppercase tracking-wide">{badge.label}</span>
          </div>

          {/* Heart top-right */}
          <button
            onClick={handleToggleSave}
            className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
          >
            <Heart className={`h-3.5 w-3.5 transition-all ${isSaved ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>

          {/* Swipe hint dot when actions revealed */}
          {actionsRevealed && (
            <button
              onClick={(e) => { e.stopPropagation(); setSwipeX(0); }}
              className="absolute top-2.5 left-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-black/50 flex items-center justify-center"
            >
              <X className="h-3 w-3 text-white/60" />
            </button>
          )}
        </div>

        {/* ── Default info ── */}
        <div className="px-3 pt-2.5 pb-3">
          <h3 className="font-manrope font-bold text-[13px] text-white leading-tight">{destination.name}</h3>

          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-2.5 w-2.5 text-gold-400 shrink-0" />
            <span className="text-[10px] text-white/50">{destination.subRegion || destination.location}</span>
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-2.5 mt-2">
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
              <span className="text-[11px] font-bold text-gold-400">{destination.rating.toFixed(1)}</span>
              {expanded && destination.reviewCount > 0 && (
                <span className="text-[9px] text-white/40">({destination.reviewCount})</span>
              )}
            </div>
            {walkMinutes && (
              <div className="flex items-center gap-1 text-white/50">
                <Footprints className="h-3 w-3" />
                <span className="text-[10px]">{walkMinutes} min</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-white/50">
              <Thermometer className="h-3 w-3" />
              <span className="text-[10px]">{temp}</span>
            </div>
          </div>

          {/* AI reason chip */}
          {aiReason && !expanded && (
            <div className="mt-2 flex items-center gap-1 bg-gold-500/10 border border-gold-500/20 rounded-full px-2.5 py-1 w-fit">
              <Sparkles className="h-2.5 w-2.5 text-gold-400 shrink-0" />
              <span className="text-[9px] text-gold-400 font-medium truncate max-w-[140px]">{aiReason}</span>
            </div>
          )}

          {/* ── Expanded state extra info ── */}
          {expanded && (
            <div className="mt-2.5 space-y-2.5">
              {/* Description */}
              {destination.tagline && (
                <p className="text-[11px] text-white/60 leading-relaxed line-clamp-3">{destination.tagline}</p>
              )}

              {/* Opening hours pill */}
              {destination.openingHours && (
                <div className="flex items-center gap-2 bg-white/6 rounded-xl px-3 py-2">
                  <div className={`h-2 w-2 rounded-full ${isOpen ? 'bg-green-400' : 'bg-red-400'}`} />
                  <span className="text-[10px] text-white/70 font-medium">
                    {isOpen ? 'Buka' : 'Tutup'} · {destination.openingHours}
                  </span>
                </div>
              )}

              {/* CTA row */}
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  onClick={handleExplore}
                  className="flex-1 flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-600 active:scale-[0.98] text-royal-950 font-bold text-[12px] py-2.5 rounded-xl transition-all"
                >
                  Explore <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleBookmark}
                  className="h-10 w-10 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-gold-400 text-gold-400' : 'text-white/60'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
