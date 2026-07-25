import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { 
  Sun, Utensils, Leaf, Moon, Star, CalendarDays, MapPin, 
  Landmark, Waves, Compass, Sparkles, Navigation, ExternalLink, Clock, Calendar 
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

function getHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

export default function RouteMapItinerary({
  destinations,
  events,
  coords,
  onExploreDestination,
  className = '',
}: RouteMapItineraryProps) {
  const { t } = useLocale();
  const router = useRouter();

  // Active node ID for popup
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [apiData, setApiData] = useState<{
    headerTitle: string;
    timeRange: string;
    nodes: Array<any>;
  } | null>(null);

  const userLat = coords?.lat || DEFAULT_LAT;
  const userLng = coords?.lng || DEFAULT_LNG;

  const currentHour = new Date().getHours();

  useEffect(() => {
    let savedIds: string[] = [];
    try {
      const raw = localStorage.getItem('explore_jogja_saved_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          savedIds = parsed.map((item: any) => item.id).filter(Boolean);
        }
      }
    } catch { /* ignore */ }

    ai.getRouteTimeline(userLat, userLng, currentHour, savedIds, selectedMood)
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setApiData(res.data);
        }
      })
      .catch(() => {});
  }, [userLat, userLng, currentHour, selectedMood]);

  const MOOD_OPTIONS = [
    { id: 'all', label: 'Semua Mood' },
    { id: 'nature', label: '🌲 Alam' },
    { id: 'beach', label: '🏖️ Pantai' },
    { id: 'cultural', label: '🏛️ Budaya' },
    { id: 'culinary', label: '🍲 Kuliner' },
  ];

  const todayStr = new Date().toISOString().slice(0, 10);

  const getCurrentPeriod = (h: number) => {
    if (h >= 5 && h < 11) return 0;
    if (h >= 11 && h < 15) return 1;
    if (h >= 15 && h < 19) return 2;
    return 3;
  };
  const currentPeriod = getCurrentPeriod(currentHour);

  // Compute fallback nodes if API is not yet loaded
  const baseSlots = [
    { label: t('home.morning'), name: 'Pagi', time: '07.00 AM', timeRange: '07:00 - 10:00 WIB', duration: '~2.5 jam', icon: Sun, color: '#F59E0B', periodIndex: 0 },
    { label: t('home.lunch'), name: 'Siang', time: '12.00 PM', timeRange: '12:00 - 14:00 WIB', duration: '~1.5 jam', icon: Utensils, color: '#10B981', periodIndex: 1 },
    { label: t('home.afternoon'), name: 'Sore', time: '03.30 PM', timeRange: '15:30 - 18:00 WIB', duration: '~2.5 jam', icon: Leaf, color: '#3B82F6', periodIndex: 2 },
    { label: t('home.night'), name: 'Malam', time: '07.30 PM', timeRange: '19:30 - 22:00 WIB', duration: '~3 jam', icon: Moon, color: '#8B5CF6', periodIndex: 3 },
  ];

  const usedDestinationIds = new Set<string>();

  const fallbackNodes = [0, 1, 2, 3].map((offset) => {
    const periodIdx = (currentPeriod + offset) % 4;
    const isTomorrow = (currentPeriod + offset) >= 4;
    const slot = baseSlots[periodIdx];

    const dest = destinations.find((d) => !usedDestinationIds.has(d.id)) || destinations[0];
    if (dest) usedDestinationIds.add(dest.id);

    const dist = dest ? getHaversineKm(userLat, userLng, dest.latitude, dest.longitude) : 1.5;

    return {
      id: dest?.id || slot.label,
      title: dest?.name || 'Jogja Destination',
      type: 'destination' as const,
      category: dest?.category || 'General',
      image: dest?.images?.[0]?.url || '',
      location: dest?.subRegion || dest?.location || 'Yogyakarta',
      subRegion: dest?.subRegion || dest?.location || 'Yogyakarta',
      rating: dest?.rating || 4.8,
      distanceKm: dist,
      isPast: false,
      isCurrent: offset === 0,
      isTomorrow,
      dayLabel: isTomorrow ? 'BESOK' : 'HARI INI',
      displayTime: isTomorrow ? `Besok ${slot.time}` : slot.time,
      timeSlot: slot.name,
      duration: slot.duration,
      rawItem: dest,
    };
  });

  const routeNodes = apiData?.nodes && apiData.nodes.length === 4
    ? apiData.nodes.map((node, idx) => {
        const rawDest = destinations.find((d) => d.id === node.id);
        const slot = baseSlots.find((s) => s.name === node.timeSlot) || baseSlots[idx % 4];
        return {
          ...node,
          slot,
          rawItem: rawDest,
          subRegion: node.subRegion || node.location || rawDest?.subRegion || 'Yogyakarta',
        };
      })
    : fallbackNodes;

  const timeRangeLabel = apiData?.timeRange || `${routeNodes[0]?.displayTime || '07.00 AM'} → ${routeNodes[3]?.displayTime || '07.30 PM'}`;

  return (
    <div className={`w-full max-w-[500px] sm:max-w-[560px] ml-0 bg-transparent ${className}`}>
      {/* HEADER TITLE WITH LIVE TIMELINE BADGE */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-gold-400 animate-pulse" />
          <h3 className="text-[11px] font-bold text-white/90 tracking-wide uppercase flex items-center gap-1">
            <span>Rute & Timeline</span>
            <span className="text-gold-400 font-extrabold">({timeRangeLabel})</span>
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-400/40 text-[9px] font-extrabold">
            <Clock className="h-2.5 w-2.5 animate-spin" />
            <span>Rute 1 Hari</span>
          </div>
          <button
            onClick={() => {
              const ids = routeNodes.map((n) => n.id).join(',');
              router.push(`/planner?destinations=${encodeURIComponent(ids)}`);
            }}
            className="text-[10px] font-semibold text-gold-400 hover:text-gold-300 transition-colors flex items-center gap-0.5"
          >
            <span>AI Planner</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* TOMORROW MOOD CHIPS SELECTOR */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-1 scrollbar-none px-1">
        <span className="text-[8.5px] font-bold text-white/60 shrink-0 mr-0.5">Mood Besok:</span>
        {MOOD_OPTIONS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => setSelectedMood(mood.id)}
            className={`px-2 py-0.5 rounded-full text-[8.5px] font-bold tracking-tight transition-all shrink-0 border ${
              selectedMood === mood.id
                ? 'bg-gold-500 text-royal-950 border-gold-400 font-extrabold shadow-sm scale-105'
                : 'bg-black/40 text-gold-300/80 border-gold-400/30 hover:bg-black/70 hover:text-gold-200'
            }`}
          >
            {mood.label}
          </button>
        ))}
      </div>

      {/* SHORT ROUTE & TIMELINE LINE CONTAINER */}
      <div className="relative bg-transparent" onMouseLeave={() => setActiveNodeId(null)}>

        {/* WAVY SVG LINE — inline fixed height, path contained within viewBox */}
        <svg
          width="100%"
          height="54"
          viewBox="0 0 340 54"
          preserveAspectRatio="none"
          className="block w-full pointer-events-none"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          {/* Wave: y center=34, oscillates ±16 = [18,50], within 54px viewBox */}
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

        {/* Nodes: pulled up so circles sit on top of / aligned with the wave */}
        <div className="-mt-[50px] grid grid-cols-4 gap-1 relative z-10">
          {routeNodes.map((node, index) => {
            const TypeIcon = getCategoryIcon(node.type, node.category);
            const isHovered = activeNodeId === node.id;

            const waveTranslateY = index % 2 === 0 ? '-translate-y-0.5' : 'translate-y-0.5';

            return (
              <div
                key={'pin-' + node.id + index}
                onMouseEnter={() => setActiveNodeId(node.id)}
                onClick={() => setActiveNodeId(activeNodeId === node.id ? null : node.id)}
                className={`relative flex flex-col items-center cursor-pointer group transition-transform ${waveTranslateY}`}
              >
                {/* Distance Badge + Day Tag (Hari Ini / Besok) */}
                <div className="mb-0.5 flex items-center gap-1">
                  <div className="px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-gold-400/40 text-[8px] font-bold text-gold-300 flex items-center gap-0.5 shadow-sm group-hover:scale-105 transition-transform">
                    <MapPin className="h-2 w-2 text-gold-400 shrink-0" />
                    <span>{node.distanceKm > 0 ? `${node.distanceKm.toFixed(1)}km` : 'Start'}</span>
                  </div>
                  {node.isTomorrow && (
                    <span className="px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40 text-[7px] font-mono font-bold">
                      BESOK
                    </span>
                  )}
                </div>

                {/* Glowing Pin Button with Active Timeline Badge */}
                <div
                  className={`relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full transition-all duration-300 shadow-md ${
                    isHovered
                      ? 'bg-gold-400 text-royal-950 scale-125 ring-2 ring-gold-400/80 shadow-[0_0_15px_rgba(234,179,8,0.9)] z-30'
                      : node.isCurrent
                        ? 'bg-gold-500 text-royal-950 ring-2 ring-gold-400/80 shadow-[0_0_12px_rgba(234,179,8,0.6)] animate-pulse'
                        : node.isPast
                          ? 'bg-black/60 text-gold-400/70 border border-gold-400/30 hover:bg-gold-400 hover:text-royal-950 hover:scale-110'
                          : 'bg-black/50 text-gold-400 border border-gold-400/50 hover:bg-gold-400 hover:text-royal-950 hover:scale-110'
                  }`}
                >
                  <TypeIcon className="h-3.5 w-3.5" />
                  
                  {/* Step Number */}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-gold-400 text-[7px] font-mono font-bold text-gold-300">
                    {index + 1}
                  </span>

                  {/* Active Now Live Indicator */}
                  {node.isCurrent && (
                    <span className="absolute -top-1 -left-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-500" />
                    </span>
                  )}
                </div>

                {/* TIMELINE TIME SLOT & TITLE */}
                <div className="mt-1 text-center max-w-[85px]">
                  <span className={`block text-[8px] font-bold uppercase tracking-wider ${node.isTomorrow ? 'text-amber-400/90' : 'text-gold-400'}`}>
                    {node.displayTime}
                  </span>
                  <span className="block text-[7.5px] font-medium text-white/50 leading-none mb-0.5">
                    {node.duration || node.slot?.duration}
                  </span>
                  <span className="block text-[9px] font-bold text-white/90 leading-tight truncate group-hover:text-gold-300">
                    {node.title}
                  </span>
                  <span className="block text-[7.5px] font-semibold text-gold-400/90 truncate mt-0.5">
                    📍 {node.subRegion || node.location}
                  </span>
                </div>

                {/* FLOATING POPUP CARD ANCHORED ABOVE THE PIN */}
                {isHovered && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (node.type === 'event') {
                        router.push(`/events/${node.id}`);
                      } else if (node.rawItem && onExploreDestination) {
                        onExploreDestination(node.rawItem as Destination);
                      }
                    }}
                    className={`absolute bottom-full mb-3 z-50 w-64 p-2.5 rounded-xl border border-gold-400/60 bg-royal-950/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] animate-fade-in transition-all ${
                      index === 0
                        ? 'left-0'
                        : index === 3
                          ? 'right-0'
                          : 'left-1/2 -translate-x-1/2'
                    }`}
                  >
                    {/* Arrow pointing down */}
                    <div className={`absolute -bottom-1.5 h-3 w-3 rotate-45 border-b border-r border-gold-400/60 bg-royal-950/95 ${
                      index === 0
                        ? 'left-4'
                        : index === 3
                          ? 'right-4'
                          : 'left-1/2 -translate-x-1/2'
                    }`} />

                    {/* Timeline Header Badge with Hari Ini / Besok */}
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10 text-[8.5px] font-bold">
                      <div className="flex items-center gap-1 text-gold-400">
                        <Calendar className="h-2.5 w-2.5 text-gold-400" />
                        <span className={node.isPast ? 'text-amber-400 font-extrabold' : 'text-gold-300'}>
                          {node.dayLabel} · {node.slot.timeRange}
                        </span>
                      </div>
                      <span className="text-white/60 bg-white/10 px-1.5 py-0.2 rounded">{node.slot.duration}</span>
                    </div>

                    <div className="flex items-center gap-2.5 relative z-10">
                      {/* Image Thumbnail */}
                      <div className="relative h-13 w-16 shrink-0 rounded-lg overflow-hidden border border-white/10">
                        <Image
                          src={node.image}
                          alt={node.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                        <div className="absolute top-0.5 left-0.5 px-1 py-0.2 bg-black/80 rounded text-[7px] font-bold text-gold-400">
                          {node.distanceKm.toFixed(1)} km
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center justify-between text-[8px] font-bold text-gold-400 mb-0.5">
                          <span>{node.displayTime}</span>
                          <span className="capitalize text-white/60">{node.category}</span>
                        </div>
                        <h4 className="text-[11px] font-bold text-white leading-tight truncate hover:text-gold-300">
                          {node.title}
                        </h4>
                        <p className="text-[9px] text-white/60 truncate mt-0.5">{node.location}</p>
                      </div>
                    </div>

                    {/* Bottom Action Line */}
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10 text-[9px] relative z-10">
                      <div className="flex items-center gap-1 font-bold text-gold-400">
                        <Star className="h-2.5 w-2.5 fill-gold-400 text-gold-400" />
                        <span>{node.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-gold-300 font-bold hover:underline">
                        <span>Buka Detail</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </div>
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
