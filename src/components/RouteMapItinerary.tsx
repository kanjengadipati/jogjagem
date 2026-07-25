import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { 
  Sun, Utensils, Leaf, Moon, Star, CalendarDays, MapPin, 
  Landmark, Waves, Compass, Sparkles, Navigation, ExternalLink, Clock, Calendar, HelpCircle, AlertTriangle
} from 'lucide-react';
import { Destination, Festival } from '../types';
import { useLocale } from '@/contexts/LocaleContext';
import { ai } from '@/lib/api';

interface RouteMapItineraryProps {
  destinations: Destination[];
  events: Festival[];
  coords?: { lat: number; lng: number } | null;
  onExploreDestination?: (dest: Destination) => void;
  className?: string;
}

const DEFAULT_LAT = -7.7828;
const DEFAULT_LNG = 110.3671;

function getCategoryIcon(type: string, category: string) {
  if (type === 'event') return CalendarDays;
  const cat = (category || '').toLowerCase();
  if (cat.includes('culinary') || cat.includes('food')) return Utensils;
  if (cat.includes('heritage') || cat.includes('cultural') || cat.includes('temple')) return Landmark;
  if (cat.includes('nature') || cat.includes('bukit') || cat.includes('desa')) return Leaf;
  if (cat.includes('beach') || cat.includes('pantai')) return Waves;
  if (cat.includes('adventure')) return Compass;
  return Sparkles;
}

const MOOD_OPTIONS = [
  { id: 'all',      label: 'Semua',   icon: '✨' },
  { id: 'nature',   label: 'Alam',    icon: '🌲' },
  { id: 'beach',    label: 'Pantai',  icon: '🏖️' },
  { id: 'cultural', label: 'Budaya',  icon: '🏛️' },
  { id: 'culinary', label: 'Kuliner', icon: '🍲' },
];

function getMoodIcon(mood: string) {
  return MOOD_OPTIONS.find((m) => m.id === mood)?.icon ?? '✨';
}

interface ResolvedNode {
  id: string;
  title: string;
  category: string;
  image: string;
  location: string;
  subRegion: string;
  rating: number;
  distanceKm: number;
  mood: string;
  rawItem?: Destination;
  timeWarning?: string;
  isTomorrow?: boolean;
  scheduledFor?: string;
}

type SlotState =
  | { status: 'open'; index: number }
  | { status: 'loading'; index: number; mood: string }
  | { status: 'confirming'; index: number; node: ResolvedNode }
  | { status: 'resolved'; index: number; node: ResolvedNode }
  | { status: 'locked'; index: number };

const BASE_SLOTS = [
  { name: 'Pagi',  time: '07.00 AM', timeRange: '07:00 - 10:00 WIB', duration: '~2.5 jam', icon: Sun,      periodIndex: 0 },
  { name: 'Siang', time: '12.00 PM', timeRange: '12:00 - 14:00 WIB', duration: '~1.5 jam', icon: Utensils, periodIndex: 1 },
  { name: 'Sore',  time: '03.30 PM', timeRange: '15:30 - 18:00 WIB', duration: '~2.5 jam', icon: Leaf,     periodIndex: 2 },
  { name: 'Malam', time: '07.30 PM', timeRange: '19:30 - 22:00 WIB', duration: '~3 jam',   icon: Moon,     periodIndex: 3 },
];

export default function RouteMapItinerary({
  destinations,
  events,
  coords,
  onExploreDestination,
  className = '',
}: RouteMapItineraryProps) {
  const { t } = useLocale();
  const router = useRouter();

  const userLat = coords?.lat || DEFAULT_LAT;
  const userLng = coords?.lng || DEFAULT_LNG;

  const currentHour = new Date().getHours();

  // Node 0 = user location (always shown as Start pin)
  // Nodes 1-3 = interactive slots, starting open → loading → confirming/resolved
  const [slots, setSlots] = useState<SlotState[]>([
    { status: 'open',   index: 0 },
    { status: 'locked', index: 1 },
    { status: 'locked', index: 2 },
  ]);

  // Track which slots are strictly in "Night/Open destinations only" filter mode (disabling nature/beach/etc.)
  const [nightOnlySlots, setNightOnlySlots] = useState<Record<number, boolean>>({});

  // Which node's mood picker is expanded (click to open)
  const [activeMoodPicker, setActiveMoodPicker] = useState<number | null>(0);
  // Which node popup is hovered (resolved nodes)
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const getResolvedIds = () =>
    slots.flatMap((s) => (s.status === 'resolved' || s.status === 'confirming' ? [s.node.id] : []));

  function resetSlot(slotIndex: number) {
    setActiveNodeId(null);
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = { status: 'open', index: slotIndex };
      // Only lock subsequent slots if they are not already resolved by user
      for (let i = slotIndex + 1; i < next.length; i++) {
        if (next[i].status !== 'resolved') {
          next[i] = { status: 'locked', index: i };
        }
      }
      return next;
    });
    setActiveMoodPicker(slotIndex);
  }

  function resetSlotWithNightFilter(slotIndex: number) {
    setNightOnlySlots((prev) => ({ ...prev, [slotIndex]: true }));
    resetSlot(slotIndex);
  }

  function cancelConfirmationWithNightFilter(slotIndex: number) {
    resetSlotWithNightFilter(slotIndex);
  }

  function confirmSlotTomorrow(slotIndex: number, node: ResolvedNode) {
    if (slotIndex + 1 < slots.length) {
      const nextSlotIdx = slotIndex + 1;
      setNightOnlySlots((prev) => ({ ...prev, [slotIndex]: true }));
      setSlots((prev) => {
        const next = [...prev];
        // Assign tomorrow node to the next slot
        next[nextSlotIdx] = {
          status: 'resolved',
          index: nextSlotIdx,
          node: {
            ...node,
            isTomorrow: true,
          },
        };
        // Keep current slot open for tonight's trip
        next[slotIndex] = {
          status: 'open',
          index: slotIndex,
        };
        // Unlock slot after next if available and locked
        if (nextSlotIdx + 1 < next.length && next[nextSlotIdx + 1].status === 'locked') {
          next[nextSlotIdx + 1] = { status: 'open', index: nextSlotIdx + 1 };
        }
        return next;
      });
      // Keep mood picker open on current slot for tonight
      setActiveMoodPicker(slotIndex);
    } else {
      setSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = {
          status: 'resolved',
          index: slotIndex,
          node,
        };
        return next;
      });
    }
  }

  async function resolveSlot(slotIndex: number, mood: string) {
    setActiveMoodPicker(null);
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = { status: 'loading', index: slotIndex, mood };
      return next;
    });

    try {
      const excludeIds = getResolvedIds();
      const res = await ai.getNextStop(userLat, userLng, mood, excludeIds, currentHour);
      if (res.data) {
        const rawDest = destinations.find((d) => d.id === res.data!.id);
        const resolvedData: ResolvedNode = {
          ...res.data!,
          mood,
          rawItem: rawDest,
        };

        if (res.data.isTomorrow) {
          // Do NOT directly move to resolved & unlock next node. Ask user confirmation first!
          setSlots((prev) => {
            const next = [...prev];
            next[slotIndex] = {
              status: 'confirming',
              index: slotIndex,
              node: resolvedData,
            };
            return next;
          });
        } else {
          // Directly resolve & unlock next node if it's currently locked
          setSlots((prev) => {
            const next = [...prev];
            next[slotIndex] = {
              status: 'resolved',
              index: slotIndex,
              node: resolvedData,
            };
            if (slotIndex + 1 < next.length) {
              if (next[slotIndex + 1].status === 'locked') {
                next[slotIndex + 1] = { status: 'open', index: slotIndex + 1 };
                setActiveMoodPicker(slotIndex + 1);
              }
            }
            return next;
          });
        }
      }
    } catch {
      setSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = { status: 'open', index: slotIndex };
        return next;
      });
      setActiveMoodPicker(slotIndex);
    }
  }

  const getCurrentPeriod = (h: number) => {
    if (h >= 5 && h < 11) return 0;
    if (h >= 11 && h < 15) return 1;
    if (h >= 15 && h < 19) return 2;
    return 3;
  };
  const currentPeriod = getCurrentPeriod(currentHour);

  // Build the 3 display nodes (index maps to slot 1,2,3 on the wave)
  const waveNodes = [null, ...slots];

  return (
    <div className={`w-full max-w-[500px] sm:max-w-[560px] ml-0 bg-transparent ${className}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-gold-400 animate-pulse" />
          <h3 className="text-[11px] font-bold text-white/90 tracking-wide uppercase flex items-center gap-1">
            <span>Perjalanan Selanjutnya</span>
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-400/40 text-[9px] font-extrabold">
            <Clock className="h-2.5 w-2.5" />
            <span>Pilih Mood</span>
          </div>
        </div>
      </div>

      {/* WAVE + NODES */}
      <div className="relative bg-transparent" onMouseLeave={() => setActiveNodeId(null)}>
        {/* WAVY SVG LINE */}
        <svg
          width="100%"
          height="54"
          viewBox="0 0 340 54"
          preserveAspectRatio="none"
          className="block w-full pointer-events-none"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <path
            d="M 40 34 C 80 18, 120 50, 170 34 C 220 18, 260 50, 300 34"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeDasharray="6,4"
            strokeLinecap="round"
            strokeOpacity="0.9"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Nodes: pulled up on top of wave */}
        <div className="-mt-[50px] grid grid-cols-4 gap-1 relative z-10">
          {waveNodes.map((slot, waveIndex) => {
            const waveTranslateY = waveIndex % 2 === 0 ? '-translate-y-0.5' : 'translate-y-0.5';

            // ── Position 0: User Location ──
            if (slot === null) {
              return (
                <div
                  key="user-start"
                  className={`relative flex flex-col items-center group ${waveTranslateY}`}
                >
                  {/* Distance badge */}
                  <div className="mb-0.5 flex items-center gap-1">
                    <div className="px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-gold-400/40 text-[8px] font-bold text-gold-300 flex items-center gap-0.5 shadow-sm">
                      <MapPin className="h-2 w-2 text-gold-400 shrink-0" />
                      <span>Start</span>
                    </div>
                  </div>
                  {/* Pin */}
                  <div className="relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-gold-500 text-royal-950 ring-2 ring-gold-400/80 shadow-[0_0_12px_rgba(234,179,8,0.6)] transition-all duration-300 shadow-md">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-gold-400 text-[7px] font-mono font-bold text-gold-300">
                      📍
                    </span>
                  </div>
                  {/* Label */}
                  <div className="mt-1 text-center max-w-[85px]">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-gold-400">
                      Kamu
                    </span>
                    <span className="block text-[9px] font-bold text-white/90 leading-tight truncate">
                      Lokasi Saat Ini
                    </span>
                  </div>
                </div>
              );
            }

            const slotIndex = slot.index;
            const slotMeta = BASE_SLOTS[(currentPeriod + slotIndex + 1) % 4];
            const isMoodPickerOpen = activeMoodPicker === slotIndex && slot.status === 'open';

            // ── LOCKED ──
            if (slot.status === 'locked') {
              return (
                <div
                  key={`slot-locked-${slotIndex}`}
                  className={`relative flex flex-col items-center group opacity-40 ${waveTranslateY}`}
                >
                  <div className="mb-0.5 flex items-center gap-1">
                    <div className="px-1.5 py-0.5 rounded-full bg-black/75 border border-white/10 text-[8px] font-bold text-white/30 flex items-center gap-0.5">
                      <span>—</span>
                    </div>
                  </div>
                  <div className="relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-black/40 text-white/30 border border-white/10 shadow-md">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-white/20 text-[7px] font-mono font-bold text-white/30">
                      {waveIndex + 1}
                    </span>
                  </div>
                  <div className="mt-1 text-center max-w-[85px]">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-white/30">
                      {slotMeta.time}
                    </span>
                    <span className="block text-[9px] font-bold text-white/30 leading-tight">
                      ?
                    </span>
                  </div>
                </div>
              );
            }

            // ── OPEN (mood picker) ──
            if (slot.status === 'open') {
              const isNightFiltered = !!nightOnlySlots[slotIndex];

              return (
                <div
                  key={`slot-open-${slotIndex}`}
                  className={`relative flex flex-col items-center cursor-pointer group ${waveTranslateY}`}
                  onClick={() => setActiveMoodPicker(isMoodPickerOpen ? null : slotIndex)}
                >
                  <div className="mb-0.5 flex items-center gap-1">
                    <div className="px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-gold-400/40 text-[8px] font-bold text-gold-300 flex items-center gap-0.5 shadow-sm">
                      <span>{slotMeta.time}</span>
                    </div>
                  </div>
                  {/* Pulsing ? pin */}
                  <div className="relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-black/50 text-gold-400 border border-gold-400/50 hover:bg-gold-400 hover:text-royal-950 hover:scale-110 transition-all duration-300 shadow-md">
                    <span className="text-[13px] font-black">?</span>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-gold-400 text-[7px] font-mono font-bold text-gold-300">
                      {waveIndex + 1}
                    </span>
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-full bg-gold-400 opacity-20 animate-ping" />
                  </div>
                  <div className="mt-1 text-center max-w-[85px]">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-gold-400">
                      {slotMeta.time}
                    </span>
                    <span className="block text-[9px] font-bold text-white/90 leading-tight group-hover:text-gold-300">
                      Tap pilih
                    </span>
                  </div>

                  {/* Mood Picker Dropdown */}
                  {isMoodPickerOpen && (
                    <div
                      className={`absolute bottom-full mb-3 z-50 w-56 p-2.5 rounded-xl border border-gold-400/60 bg-royal-950/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] animate-fade-in ${
                        waveIndex === 0 ? 'left-0' : waveIndex === 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="absolute -bottom-1.5 h-3 w-3 rotate-45 border-b border-r border-gold-400/60 bg-royal-950/95 left-1/2 -translate-x-1/2" />
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[9px] font-bold text-gold-400 uppercase tracking-wide">Pilih Mood Perjalanan</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveMoodPicker(null); }}
                          className="flex items-center justify-center w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                          aria-label="Tutup"
                        >
                          ×
                        </button>
                      </div>

                      {isNightFiltered && (
                        <p className="text-[8px] font-bold text-amber-400 mb-1.5 leading-tight">
                          🌙 Hanya menampilkan destinasi yang terjangkau malam ini
                        </p>
                      )}

                      <div className="flex flex-wrap gap-1">
                        {MOOD_OPTIONS.map((mood) => {
                          const isNatureOrBeach = mood.id === 'nature' || mood.id === 'beach';
                          const isCultural = mood.id === 'cultural';
                          const isLateClosed = (currentHour >= 17 && isNatureOrBeach) || (currentHour >= 20 && isCultural);

                          const isDisabled = isNightFiltered && isLateClosed;
                          const showWarningBadge = !isNightFiltered && isLateClosed;

                          return (
                            <button
                              key={mood.id}
                              disabled={isDisabled}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isDisabled) {
                                  resolveSlot(slotIndex, mood.id);
                                }
                              }}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold transition-all ${
                                isDisabled
                                  ? 'bg-white/5 text-white/20 border border-white/10 cursor-not-allowed line-through'
                                  : 'bg-black/40 text-gold-300/80 border border-gold-400/30 hover:bg-gold-500 hover:text-royal-950 hover:border-gold-400 active:scale-95 cursor-pointer'
                              }`}
                              title={isDisabled ? 'Destinasi ini sudah tutup malam ini' : undefined}
                            >
                              <span>{mood.icon}</span>
                              <span>{mood.label}</span>
                              {isDisabled && <span className="text-[7.5px] text-amber-500/70">🔒</span>}
                              {showWarningBadge && <span className="text-[7.5px] text-amber-400">⚠️</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            // ── LOADING ──
            if (slot.status === 'loading') {
              return (
                <div
                  key={`slot-loading-${slotIndex}`}
                  className={`relative flex flex-col items-center group ${waveTranslateY}`}
                >
                  <div className="mb-0.5 flex items-center gap-1">
                    <div className="px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-gold-400/40 text-[8px] font-bold text-gold-300 flex items-center gap-0.5 shadow-sm">
                      <span>{getMoodIcon(slot.mood)}</span>
                    </div>
                  </div>
                  <div className="relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-gold-500/30 text-gold-400 border border-gold-400/50 animate-pulse shadow-md">
                    <span className="text-sm">{getMoodIcon(slot.mood)}</span>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-gold-400 text-[7px] font-mono font-bold text-gold-300">
                      {waveIndex + 1}
                    </span>
                  </div>
                  <div className="mt-1 text-center max-w-[85px]">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-gold-400">
                      {slotMeta.time}
                    </span>
                    <span className="block text-[9px] font-bold text-white/50 leading-tight animate-pulse">
                      Mencari…
                    </span>
                  </div>
                </div>
              );
            }

            // ── CONFIRMING (Tomorrow scheduling popup before moving next) ──
            if (slot.status === 'confirming') {
              const node = slot.node;
              return (
                <div
                  key={`slot-confirming-${slotIndex}`}
                  className={`relative flex flex-col items-center cursor-pointer group ${waveTranslateY}`}
                >
                  <div className="mb-0.5 flex items-center gap-1">
                    <div className="px-1.5 py-0.5 rounded-full bg-amber-500/30 backdrop-blur-sm border border-amber-400/50 text-[8px] font-bold text-amber-300 flex items-center gap-0.5 shadow-sm">
                      <span>⚠️ Konfirmasi</span>
                    </div>
                  </div>
                  {/* Warning Pin */}
                  <div className="relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-amber-500 text-royal-950 ring-2 ring-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-pulse">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-amber-400 text-[7px] font-mono font-bold text-amber-300">
                      {waveIndex + 1}
                    </span>
                  </div>
                  <div className="mt-1 text-center max-w-[85px]">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-amber-400">
                      {slotMeta.time}
                    </span>
                    <span className="block text-[9px] font-bold text-amber-200 leading-tight">
                      Perlu Konfirmasi
                    </span>
                  </div>

                  {/* Confirmation Modal Card */}
                  <div
                    className={`absolute bottom-full mb-3 z-50 w-64 p-3 rounded-xl border border-amber-400/70 bg-royal-950/98 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.95)] animate-fade-in ${
                      waveIndex === 1 ? 'left-0' : waveIndex === 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className={`absolute -bottom-1.5 h-3 w-3 rotate-45 border-b border-r border-amber-400/70 bg-royal-950/98 ${
                      waveIndex === 1 ? 'left-4' : waveIndex === 3 ? 'right-4' : 'left-1/2 -translate-x-1/2'
                    }`} />

                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-amber-400/30">
                      <div className="flex items-center gap-1 text-amber-400 text-[9.5px] font-bold uppercase tracking-wide">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Destinasi Tutup Sore Ini</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelConfirmationWithNightFilter(slotIndex);
                        }}
                        className="text-white/40 hover:text-white text-[11px] font-bold px-1"
                        title="Batal"
                      >
                        ×
                      </button>
                    </div>

                    <p className="text-[8.5px] text-amber-200/90 leading-normal mb-2 text-left">
                      {node.timeWarning || 'Destinasi ini umumnya tutup setelah jam 17:00. Apakah kamu ingin menjadwalkannya untuk besok pagi?'}
                    </p>

                    {/* Preview of proposed destination */}
                    <div className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 border border-amber-400/20 mb-2.5 text-left">
                      {node.image && (
                        <div className="relative h-10 w-12 shrink-0 rounded overflow-hidden border border-white/10">
                          <Image src={node.image} alt={node.title} fill className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <span className="block text-[7.5px] font-bold text-amber-400 uppercase">
                          📅 {node.scheduledFor || 'Besok Pagi'}
                        </span>
                        <h5 className="text-[10px] font-bold text-white truncate leading-tight">{node.title}</h5>
                        <p className="text-[8px] text-white/60 truncate">📍 {node.subRegion}</p>
                      </div>
                    </div>

                    {/* Confirmation Actions */}
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmSlotTomorrow(slotIndex, node);
                        }}
                        className="w-full py-1.5 px-2 rounded-lg bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-royal-950 font-extrabold text-[9.5px] shadow-md active:scale-95 transition-all text-center cursor-pointer"
                      >
                        📅 Ya, Jadwalkan Besok
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          cancelConfirmationWithNightFilter(slotIndex);
                        }}
                        className="w-full py-1 px-2 rounded-lg bg-black/50 hover:bg-white/10 border border-white/20 text-white/80 hover:text-white text-[8.5px] font-semibold transition-all text-center cursor-pointer"
                      >
                        🌙 Tidak, Ubah ke Mood Lain
                      </button>
                    </div>
                  </div>
                </div>
              );
            }

            // ── RESOLVED ──
            const node = slot.node;
            const TypeIcon = getCategoryIcon('destination', node.category);
            const isHovered = activeNodeId === node.id + slotIndex;

            return (
              <div
                key={`slot-resolved-${slotIndex}-${node.id}`}
                onMouseEnter={() => setActiveNodeId(node.id + slotIndex)}
                onClick={() => setActiveNodeId(activeNodeId === node.id + slotIndex ? null : node.id + slotIndex)}
                className={`relative flex flex-col items-center cursor-pointer group transition-transform ${waveTranslateY}`}
              >
                {/* Distance Badge + Tomorrow Tag if scheduled tomorrow */}
                <div className="mb-0.5 flex items-center gap-1">
                  <div className="px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-gold-400/40 text-[8px] font-bold text-gold-300 flex items-center gap-0.5 shadow-sm group-hover:scale-105 transition-transform">
                    <MapPin className="h-2 w-2 text-gold-400 shrink-0" />
                    <span>{node.distanceKm > 0 ? `${node.distanceKm.toFixed(1)}km` : '—'}</span>
                  </div>
                  {node.isTomorrow && (
                    <span className="px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-400/50 text-[7px] font-mono font-bold">
                      BESOK
                    </span>
                  )}
                </div>

                {/* Glowing Pin */}
                <div
                  className={`relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full transition-all duration-300 shadow-md ${
                    isHovered
                      ? 'bg-gold-400 text-royal-950 scale-125 ring-2 ring-gold-400/80 shadow-[0_0_15px_rgba(234,179,8,0.9)] z-30'
                      : 'bg-black/50 text-gold-400 border border-gold-400/50 hover:bg-gold-400 hover:text-royal-950 hover:scale-110'
                  }`}
                >
                  <TypeIcon className="h-3.5 w-3.5" />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-gold-400 text-[7px] font-mono font-bold text-gold-300">
                    {waveIndex + 1}
                  </span>
                </div>

                {/* Label */}
                <div className="mt-1 text-center max-w-[85px]">
                  <span className="block text-[8px] font-bold uppercase tracking-wider text-gold-400">
                    {slotMeta.time}
                  </span>
                  <span className="block text-[7.5px] font-medium text-white/50 leading-none mb-0.5">
                    {slotMeta.duration}
                  </span>
                  <span className="block text-[9px] font-bold text-white/90 leading-tight truncate group-hover:text-gold-300">
                    {node.title}
                  </span>
                  <span className="block text-[7.5px] font-semibold text-gold-400/90 truncate mt-0.5">
                    📍 {node.subRegion || node.location}
                  </span>
                </div>

                {/* Floating Popup */}
                {isHovered && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (node.rawItem && onExploreDestination) {
                        onExploreDestination(node.rawItem);
                      }
                    }}
                    className={`absolute bottom-full mb-3 z-50 w-64 p-2.5 rounded-xl border border-gold-400/60 bg-royal-950/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] animate-fade-in transition-all ${
                      waveIndex === 1
                        ? 'left-0'
                        : waveIndex === 3
                          ? 'right-0'
                          : 'left-1/2 -translate-x-1/2'
                    }`}
                  >
                    <div className={`absolute -bottom-1.5 h-3 w-3 rotate-45 border-b border-r border-gold-400/60 bg-royal-950/95 ${
                      waveIndex === 1 ? 'left-4' : waveIndex === 3 ? 'right-4' : 'left-1/2 -translate-x-1/2'
                    }`} />

                    {/* Header */}
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10 text-[8.5px] font-bold">
                      <div className="flex items-center gap-1 text-gold-400">
                        <Calendar className="h-2.5 w-2.5 text-gold-400" />
                        <span className="text-gold-300">{slotMeta.timeRange}</span>
                      </div>
                      <span className="text-white/60 bg-white/10 px-1.5 rounded">{slotMeta.duration}</span>
                    </div>

                    {/* Warning Banner if scheduled for tomorrow */}
                    {node.isTomorrow && (
                      <div className="mb-2 p-2 rounded-lg bg-amber-500/15 border border-amber-400/40 text-left">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-amber-300 mb-0.5">
                          <span>📅</span>
                          <span>{node.scheduledFor || 'Dijadwalkan Besok'}</span>
                        </div>
                        <p className="text-[8px] text-amber-200/90 leading-tight">
                          {node.timeWarning || 'Destinasi ini umumnya tutup malam hari, kami jadwalkan untuk besok.'}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2.5 relative z-10">
                      {node.image && (
                        <div className="relative h-13 w-16 shrink-0 rounded-lg overflow-hidden border border-white/10">
                          <Image
                            src={node.image}
                            alt={node.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                          <div className="absolute top-0.5 left-0.5 px-1 bg-black/80 rounded text-[7px] font-bold text-gold-400">
                            {node.distanceKm.toFixed(1)} km
                          </div>
                        </div>
                      )}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between text-[8px] font-bold text-gold-400 mb-0.5">
                          <span>{getMoodIcon(node.mood)} {slotMeta.time}</span>
                          <span className="capitalize text-white/60">{node.category}</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-white leading-tight truncate hover:text-gold-300">
                          {node.title}
                        </h4>
                        <p className="text-[9px] text-white/60 truncate mt-0.5">📍 {node.subRegion}</p>
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="flex flex-col gap-1.5 mt-2 pt-1.5 border-t border-white/10 text-[9px] relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 font-bold text-gold-400">
                          <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                          <span>{node.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); resetSlot(slotIndex); }}
                            className="text-[9px] font-bold text-white/50 hover:text-amber-400 transition-colors cursor-pointer"
                          >
                            ↩ Ganti
                          </button>
                          <div className="flex items-center gap-0.5 text-gold-300 font-bold hover:underline cursor-pointer">
                            <span>Buka Detail</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </div>
                        </div>
                      </div>

                      {/* Prompt to change to night-accessible destinations */}
                      {node.isTomorrow && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            resetSlotWithNightFilter(slotIndex);
                          }}
                          className="w-full py-1 px-2 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[8.5px] font-bold transition-all text-center cursor-pointer"
                        >
                          🌙 Ganti ke yang bisa malam ini
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
