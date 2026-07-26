import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { 
  Sun, Utensils, Leaf, Moon, Star, CalendarDays, MapPin, 
  Landmark, Waves, Compass, Sparkles, Navigation, ExternalLink, Clock, Calendar, HelpCircle, AlertTriangle, CheckCircle, X
} from 'lucide-react';
import { Destination, Festival } from '../types';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { ai, trips as tripsApi } from '@/lib/api';
import AuthModal from './AuthModal';
import { saveItineraryLocally, syncLocalItinerariesToDB, getLocalItineraries, generateLocalId, clearAllLocalItineraries, HERO_ROUTE_DRAFT_KEY } from '@/lib/itinerary-storage';
import { haversineKm } from '@/lib/geo';

interface RouteMapItineraryProps {
  destinations: Destination[];
  events: Festival[];
  coords?: { lat: number; lng: number } | null;
  onExploreDestination?: (dest: Destination) => void;
  className?: string;
}

const DEFAULT_LAT = -7.7828;
const DEFAULT_LNG = 110.3671;
const JOGJA_CENTER_LAT = -7.7926;
const JOGJA_CENTER_LNG = 110.3658;
const PLANNING_DISTANCE_THRESHOLD_KM = 50;

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
  { id: 'beach',    label: 'Pantai',            icon: '🏖️', category: 'beach' },
  { id: 'mountain', label: 'Gunung',            icon: '⛰️', category: 'nature' },
  { id: 'culinary', label: 'Kulineran',         icon: '🍲', category: 'culinary' },
  { id: 'show',     label: 'Nonton pertunjukan', icon: '🎭', category: 'cultural' },
  { id: 'valley',   label: 'Sungai/lembah',     icon: '🏞️', category: 'nature' },
  { id: 'hill',     label: 'Bukit',             icon: '🌄', category: 'nature' },
  { id: 'temple',   label: 'Candi',             icon: '🏛️', category: 'cultural' },
  { id: 'keraton',  label: 'Keraton',           icon: '👑', category: 'cultural' },
  { id: 'malioboro', label: 'Malioboro',        icon: '🛍️', category: 'cultural' },
  { id: 'batik',    label: 'Batik',             icon: '🧵', category: 'cultural' },
  { id: 'kopi',     label: 'Kopi sore',         icon: '☕', category: 'culinary' },
  { id: 'angkringan', label: 'Angkringan',      icon: '🍢', category: 'culinary' },
  { id: 'sunset',   label: 'Sunset',            icon: '🌅', category: 'beach' },
  { id: 'jeep',     label: 'Jeep Merapi',       icon: '🚙', category: 'nature' },
];

function getMoodIcon(mood: string) {
  return MOOD_OPTIONS.find((m) => m.id === mood)?.icon ?? '✨';
}

function destinationMatchesCategory(destination: Pick<Destination, 'category' | 'name' | 'tagline' | 'description'>, category: string): boolean {
  if (category === 'all') return true;
  const categoryText = destination.category.toLowerCase();
  const nameText = destination.name.toLowerCase();
  const summaryText = [destination.category, destination.name, destination.tagline].join(' ').toLowerCase();
  const fullText = [destination.category, destination.name, destination.tagline, destination.description].join(' ').toLowerCase();

  if (category === 'culinary') {
    return /culinary|kuliner|food|restaurant|resto|cafe|coffee|kopi/.test(categoryText) ||
      /gudeg|bakpia|angkringan|sate|kopi|coffee|cafe|resto|restaurant|warung|kuliner/.test(nameText);
  }
  if (category === 'cultural') {
    return /cultural|culture|heritage|temple|candi|keraton|museum|batik|budaya|sejarah|pertunjukan/.test(summaryText);
  }
  if (category === 'beach') {
    return /beach|pantai|sunset|coast|laut/.test(summaryText);
  }
  if (category === 'nature') {
    return /nature|alam|mountain|gunung|bukit|river|sungai|lembah|forest|hutan|adventure|jeep|merapi/.test(fullText);
  }
  return fullText.includes(category);
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
  distanceFromPrev?: number;
  lat?: number;
  lng?: number;
  mood: string;
  rawItem?: Destination;
  timeWarning?: string;
  isTomorrow?: boolean;
  requiresTomorrowSlot?: boolean;
  scheduledFor?: string;
  isDone?: boolean;
}

type SlotState =
  | { status: 'open'; index: number }
  | { status: 'loading'; index: number; mood: string }
  | { status: 'confirming'; index: number; node: ResolvedNode }
  | { status: 'resolved'; index: number; node: ResolvedNode; resolvedAt?: number; scheduledPeriod?: number }
  | { status: 'locked'; index: number };

const INITIAL_SLOTS: SlotState[] = [
  { status: 'open', index: 0 },
  { status: 'locked', index: 1 },
  { status: 'locked', index: 2 },
  { status: 'locked', index: 3 },
];

const BASE_SLOTS = [
  { name: 'Pagi',  time: '07.00 AM', timeRange: '07:00 - 10:00 WIB', duration: '~2.5 jam', icon: Sun,      periodIndex: 0 },
  { name: 'Siang', time: '12.00 PM', timeRange: '12:00 - 14:00 WIB', duration: '~1.5 jam', icon: Utensils, periodIndex: 1 },
  { name: 'Sore',  time: '03.30 PM', timeRange: '15:30 - 18:00 WIB', duration: '~2.5 jam', icon: Leaf,     periodIndex: 2 },
  { name: 'Malam', time: '07.30 PM', timeRange: '19:30 - 22:00 WIB', duration: '~3 jam',   icon: Moon,     periodIndex: 3 },
];

function getSlotEndDate(slotDate: Date, periodIndex: number): Date {
  const [endTime] = BASE_SLOTS[periodIndex].timeRange.split(' - ')[1].split(' ');
  const [hours, minutes] = endTime.split(':').map(Number);
  const endDate = new Date(slotDate);
  endDate.setHours(hours, minutes, 0, 0);
  return endDate;
}

function isSlotFinished(slotDate: Date, periodIndex: number, now = new Date()): boolean {
  const endDate = getSlotEndDate(slotDate, periodIndex);
  return now.getTime() > endDate.getTime();
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getStoredPeriodIndex(slot: { scheduledPeriod?: number; time?: string; timeRange?: string; slotIndex: number }, fallbackPeriod: number): number {
  if (typeof slot.scheduledPeriod === 'number') return slot.scheduledPeriod;
  const byTimeRange = BASE_SLOTS.findIndex((baseSlot) => baseSlot.timeRange === slot.timeRange);
  if (byTimeRange >= 0) return byTimeRange;
  const byTime = BASE_SLOTS.findIndex((baseSlot) => baseSlot.time === slot.time);
  if (byTime >= 0) return byTime;
  return fallbackPeriod;
}

/** Returns the day offset (0 = today, 1 = tomorrow, etc.) for a given slot. */
function getSlotDayOffset(firstSlotPeriod: number, slotIndex: number): number {
  return Math.floor((firstSlotPeriod + slotIndex) / 4);
}

/** Format a date offset from a base date as a short label. */
function formatDayLabel(baseDate: Date, dayOffset: number): string {
  if (dayOffset === 0) return '';
  const d = new Date(baseDate);
  d.setDate(d.getDate() + dayOffset);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

/** Enforce minimum percentage gap between consecutive positions. */
function enforceMinGap(positions: number[], minGapPct: number): number[] {
  const adjusted = [...positions];
  for (let i = 1; i < adjusted.length; i++) {
    if (adjusted[i] - adjusted[i - 1] < minGapPct) {
      adjusted[i] = adjusted[i - 1] + minGapPct;
    }
  }
  // If total exceeds 100% after adjustment, scale down proportionally
  const maxPos = adjusted[adjusted.length - 1];
  if (maxPos > 96) {
    const scale = 96 / maxPos;
    for (let i = 1; i < adjusted.length; i++) {
      adjusted[i] = adjusted[i] * scale;
    }
  }
  return adjusted;
}

function normalizeDraftSlots(slots: SlotState[]): SlotState[] {
  const normalized = slots.slice(0, INITIAL_SLOTS.length).map((slot) => {
    if (slot.status === 'loading' || slot.status === 'confirming') {
      return { status: 'open' as const, index: slot.index };
    }
    if (slot.status === 'resolved') {
      const { rawItem, ...node } = slot.node;
      return { ...slot, node };
    }
    return slot;
  });
  return [
    ...normalized,
    ...INITIAL_SLOTS.slice(normalized.length).map((slot) => ({ ...slot })),
  ];
}

function hasDraftProgress(slots: SlotState[]): boolean {
  return slots.some((slot) => slot.status === 'resolved' || slot.status === 'confirming' || slot.status === 'loading' || slot.index > 0 && slot.status === 'open');
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
  const { isAuthenticated } = useAuth();

  const distanceToJogjaKm = coords ? haversineKm(coords.lat, coords.lng, JOGJA_CENTER_LAT, JOGJA_CENTER_LNG) : 0;
  const isPlanningMode = !coords || distanceToJogjaKm > PLANNING_DISTANCE_THRESHOLD_KM;
  const userLat = isPlanningMode ? DEFAULT_LAT : coords?.lat ?? DEFAULT_LAT;
  const userLng = isPlanningMode ? DEFAULT_LNG : coords?.lng ?? DEFAULT_LNG;

  const currentHour = new Date().getHours();

  // Node 0 = user location (always shown as Start pin)
  // Nodes 1-4 = interactive slots, starting open → loading → confirming/resolved
  const [slots, setSlots] = useState<SlotState[]>(INITIAL_SLOTS);

  // Track which slots are strictly in "Night/Open destinations only" filter mode (disabling nature/beach/etc.)
  const [nightOnlySlots, setNightOnlySlots] = useState<Record<number, boolean>>({});

  // Which node's mood picker is expanded (click to open)
  const [activeMoodPicker, setActiveMoodPicker] = useState<number | null>(null);
  
  // Hover & Pinned states for resolved node popups (click pins popup open until explicitly closed)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [pinnedNodeId, setPinnedNodeId] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ visible: boolean; synced: boolean } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  // Tracks whether current all-resolved state came from a resume (not user picks)
  const isResumedRef = React.useRef(false);
  // Track the ID of the itinerary saved for this session — prevents duplicate saves
  const savedItineraryIdRef = React.useRef<string | null>(null);
  const tripDateRef = React.useRef<string | null>(null);
  const remoteTripIdRef = React.useRef<string | null>(null);
  const hasHydratedRouteRef = React.useRef(false);
  const skipNextDraftWriteRef = React.useRef(false);

  const getCurrentPeriod = (h: number) => {
    if (h >= 5 && h < 11) return 0;
    if (h >= 11 && h < 15) return 1;
    if (h >= 15 && h < 19) return 2;
    return 3;
  };
  const currentPeriod = isPlanningMode ? 3 : getCurrentPeriod(currentHour);
  const firstSlotPeriod = isPlanningMode ? 0 : (currentPeriod + 1) % 4;
  const startsTomorrow = isPlanningMode || currentHour >= 19;

  // Resume itinerary — silently hydrate slots from the most recent localStorage entry on mount
  useEffect(() => {
    let didHydrateStoredRoute = false;
    try {
      const rawDraft = localStorage.getItem(HERO_ROUTE_DRAFT_KEY);
      if (rawDraft) {
        const draft = JSON.parse(rawDraft) as {
          slots?: SlotState[];
          tripDate?: string | null;
          remoteTripId?: string | null;
          savedItineraryId?: string | null;
          isPlanningMode?: boolean;
        };
        if (Array.isArray(draft.slots) && hasDraftProgress(draft.slots)) {
          tripDateRef.current = draft.tripDate ?? null;
          remoteTripIdRef.current = draft.remoteTripId ?? null;
          savedItineraryIdRef.current = draft.savedItineraryId ?? null;
          isResumedRef.current = true;
          didHydrateStoredRoute = true;
          skipNextDraftWriteRef.current = true;
          setSlots(normalizeDraftSlots(draft.slots));
          setActiveMoodPicker(null);
          return;
        }
      }

      const saved = getLocalItineraries();
      if (!saved.length) return;
      const latest = saved[0];
      if (!latest.slots || latest.slots.length === 0) return;
      didHydrateStoredRoute = true;
      remoteTripIdRef.current = latest.remoteTripId ?? null;

      const nowDate = new Date();
      const createdDate = latest.createdAt ? new Date(latest.createdAt) : nowDate;
      const savedPeriod = getCurrentPeriod(createdDate.getHours());
      const tripDate = latest.tripDate ? new Date(`${latest.tripDate}T00:00:00`) : new Date(createdDate);
      tripDateRef.current = latest.tripDate ?? tripDate.toISOString().split('T')[0];

      const hydrated: SlotState[] = latest.slots.map((s) => {
        const scheduledPeriod = getStoredPeriodIndex(s, (savedPeriod + 1 + s.slotIndex) % 4);
        return {
          status: 'resolved' as const,
          index: s.slotIndex,
          scheduledPeriod,
          node: {
            id: s.destination.id,
            title: s.destination.title,
            category: s.destination.category,
            image: s.destination.image,
            location: s.destination.location,
            subRegion: s.destination.location,
            rating: s.destination.rating,
            distanceKm: 0,
            distanceFromPrev: s.distanceFromPrev,
            lat: s.lat,
            lng: s.lng,
            mood: 'all',
            isTomorrow: s.isTomorrow,
            scheduledFor: s.scheduledFor,
            isDone: false,
          },
        };
      });

      if (hydrated.length >= 3) {
        const normalizedSlots: SlotState[] = [
          ...hydrated.slice(0, 4),
          ...Array.from({ length: Math.max(0, 4 - hydrated.length) }, (_, i) => {
            const index = hydrated.length + i;
            const previousResolved = index > 0 && hydrated[index - 1]?.status === 'resolved';
            return previousResolved
              ? { status: 'open' as const, index }
              : { status: 'locked' as const, index };
          }),
        ];
        isResumedRef.current = true;
        skipNextDraftWriteRef.current = true;
        setSlots(normalizedSlots);
        setActiveMoodPicker(null);
      }
    } catch {
      // ignore
    } finally {
      hasHydratedRouteRef.current = true;
      if (!didHydrateStoredRoute) {
        setActiveMoodPicker(0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasHydratedRouteRef.current) return;
    if (skipNextDraftWriteRef.current) {
      skipNextDraftWriteRef.current = false;
      return;
    }
    try {
      if (!hasDraftProgress(slots)) {
        localStorage.removeItem(HERO_ROUTE_DRAFT_KEY);
        return;
      }
      localStorage.setItem(HERO_ROUTE_DRAFT_KEY, JSON.stringify({
        slots: normalizeDraftSlots(slots),
        tripDate: tripDateRef.current,
        remoteTripId: remoteTripIdRef.current,
        savedItineraryId: savedItineraryIdRef.current,
        isPlanningMode,
      }));
    } catch {
      // ignore
    }
  }, [slots]);

  // Live timer: recalculate isDone for resolved slots every 60s
  useEffect(() => {
    const tick = () => {
      const now = new Date();

      setSlots((prev) =>
        prev.map((s) => {
          if (s.status !== 'resolved' || s.node.isDone) return s;
          if (tripDateRef.current) return s;
          const periodIndex = s.scheduledPeriod ?? (currentPeriod + s.index + 1) % 4;
          const slotDate = tripDateRef.current ? new Date(`${tripDateRef.current}T00:00:00`) : new Date();
          if (!tripDateRef.current && s.node.isTomorrow) slotDate.setDate(slotDate.getDate() + 1);
          if (isSameCalendarDay(slotDate, now)) return s;
          if (isSlotFinished(slotDate, periodIndex, now)) {
            return { ...s, node: { ...s.node, isDone: true } };
          }
          return s;
        })
      );
    };

    const interval = setInterval(tick, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Auto-save + auto-sync + toast when all slots resolved by user (not on resume)
  useEffect(() => {
    const allResolved = slots.length > 0 && slots.every((s) => s.status === 'resolved');
    if (!allResolved) return;
    if (isResumedRef.current) {
      isResumedRef.current = false;
      return;
    }
    // Already saved this exact set of slots — skip
    if (savedItineraryIdRef.current) return;

    const timer = setTimeout(async () => {
      const resolvedSlots = slots
        .filter((s) => s.status === 'resolved')
        .map((s) => {
          if (s.status !== 'resolved') return null;
          const scheduledPeriod = s.scheduledPeriod ?? s.index;
          const baseSlot = BASE_SLOTS[scheduledPeriod] ?? BASE_SLOTS[BASE_SLOTS.length - 1];
          return {
            slotIndex: s.index,
            scheduledPeriod,
            time: baseSlot.time,
            timeRange: baseSlot.timeRange,
            isTomorrow: s.node.isTomorrow ?? false,
            scheduledFor: s.node.scheduledFor,
            distanceFromPrev: s.node.distanceFromPrev,
            lat: s.node.lat,
            lng: s.node.lng,
            destination: {
              id: s.node.id,
              title: s.node.title,
              category: s.node.category,
              image: s.node.image,
              location: s.node.location,
              rating: s.node.rating,
            },
          };
        })
        .filter(Boolean) as any[];

      if (resolvedSlots.length === 0) return;

      // Determine start date — use today unless all slots are tomorrow
      const tripDateObj = new Date();
      const tripDateStr = tripDateObj.toISOString().split('T')[0]; // YYYY-MM-DD
      tripDateRef.current = tripDateStr;
      const formattedDate = tripDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      const itineraryTitle = `Perjalananku di Jogja — ${formattedDate}`;

      // Group slots by day for multi-day itineraries
      const dayGroups: Record<number, string[]> = {};
      let maxDay = 0;
      for (const s of resolvedSlots) {
        const dayOffset = getSlotDayOffset(firstSlotPeriod, s.slotIndex);
        if (!dayGroups[dayOffset]) dayGroups[dayOffset] = [];
        dayGroups[dayOffset].push(s.destination.id);
        if (dayOffset > maxDay) maxDay = dayOffset;
      }
      const durationDays = maxDay + 1;
      const days = Object.entries(dayGroups).map(([dayOffset, destinationIds]) => ({
        dayNumber: Number(dayOffset) + 1,
        destinationIds,
        notes: '',
      }));
      // Compute end_date based on duration
      const endDateObj = new Date(tripDateObj);
      endDateObj.setDate(endDateObj.getDate() + durationDays - 1);
      const endDateStr = endDateObj.toISOString().split('T')[0];

      const newId = generateLocalId();
      // Always save locally first
      saveItineraryLocally({
        id: newId,
        title: itineraryTitle,
        createdAt: new Date().toISOString(),
        tripDate: tripDateStr,
        slots: resolvedSlots,
      });
      // Mark as saved so subsequent re-renders don't create duplicates
      savedItineraryIdRef.current = newId;

      // If logged in, also auto-sync to DB in background
      let syncedToCloud = false;
      if (isAuthenticated) {
        try {
          const res = await tripsApi.create({
            title: itineraryTitle,
            start_date: tripDateStr,
            end_date: endDateStr,
            duration_days: durationDays,
            days,
            status: 'draft',
          });
          if (res.status === 'success' && res.data?.id) {
            remoteTripIdRef.current = res.data.id;
            saveItineraryLocally({
              id: newId,
              remoteTripId: res.data.id,
              title: itineraryTitle,
              createdAt: new Date().toISOString(),
              tripDate: tripDateStr,
              slots: resolvedSlots,
            });
            localStorage.setItem(HERO_ROUTE_DRAFT_KEY, JSON.stringify({
              slots: normalizeDraftSlots(slots),
              tripDate: tripDateRef.current,
              remoteTripId: res.data.id,
              savedItineraryId: newId,
              isPlanningMode,
            }));
            syncedToCloud = true;
          }
        } catch {
          // DB sync failed — local copy still exists, no error shown
        }
      }

      setToast({ visible: true, synced: syncedToCloud });
      // Auto-dismiss toast after 6 seconds
      setTimeout(() => setToast(null), 6000);
    }, 500);

    return () => clearTimeout(timer);
  }, [slots, isAuthenticated]);


  const getResolvedIds = () =>
    slots.flatMap((s) => (s.status === 'resolved' || s.status === 'confirming' ? [s.node.id] : []));

  function resetSlot(slotIndex: number) {
    setHoveredNodeId(null);
    setPinnedNodeId(null);
    savedItineraryIdRef.current = null; // allow new save after reset
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

  async function clearItinerary() {
    const remoteTripId = remoteTripIdRef.current ?? getLocalItineraries()[0]?.remoteTripId;
    if (isAuthenticated && remoteTripId) {
      try {
        await tripsApi.delete(remoteTripId);
      } catch {
        // Keep clearing the local route even if remote delete fails.
      }
    }
    clearAllLocalItineraries();
    localStorage.removeItem(HERO_ROUTE_DRAFT_KEY);
    savedItineraryIdRef.current = null;
    tripDateRef.current = null;
    remoteTripIdRef.current = null;
    isResumedRef.current = false;
    setHoveredNodeId(null);
    setPinnedNodeId(null);
    setToast(null);
    setNightOnlySlots({});
    setSlots(INITIAL_SLOTS.map((slot) => ({ ...slot })));
    setActiveMoodPicker(null);
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
        // Assign tomorrow node to the next slot (suppress amber warning banner on tomorrow slot)
        next[nextSlotIdx] = {
          status: 'resolved',
          index: nextSlotIdx,
          node: {
            ...node,
            isTomorrow: false,
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
      setActiveMoodPicker(null);
    } else {
      setSlots((prev) => {
        const next = [...prev];
        next[slotIndex] = {
          status: 'resolved',
          index: slotIndex,
          node: {
            ...node,
            isTomorrow: false,
          },
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
      const selectedMood = MOOD_OPTIONS.find((option) => option.id === mood);
      const apiCategory = selectedMood?.category ?? mood;
      const res = await ai.getNextStop(userLat, userLng, apiCategory, excludeIds, isPlanningMode ? 7 : currentHour);
      if (res.data) {
        const apiRawDest = destinations.find((d) => d.id === res.data!.id)
          ?? destinations.find((d) => d.id.toLowerCase() === res.data!.id.toLowerCase());
        const apiResultMatchesMood = apiRawDest
          ? destinationMatchesCategory(apiRawDest, apiCategory)
          : apiCategory === 'all';
        const fallbackDest = apiResultMatchesMood
          ? undefined
          : destinations.find((destination) =>
              !excludeIds.includes(destination.id) &&
              destination.id !== res.data!.id &&
              destinationMatchesCategory(destination, apiCategory)
            );
        const rawDest = fallbackDest ?? apiRawDest;
        const destLat = rawDest?.latitude;
        const destLng = rawDest?.longitude;
        const nodeSource = fallbackDest
          ? {
              id: fallbackDest.id,
              title: fallbackDest.name,
              category: fallbackDest.category,
              image: fallbackDest.images?.[0]?.url ?? res.data.image,
              location: fallbackDest.location,
              subRegion: fallbackDest.subRegion,
              rating: fallbackDest.rating,
              distanceKm: haversineKm(userLat, userLng, fallbackDest.latitude, fallbackDest.longitude),
              isTomorrow: false,
            }
          : res.data!;
        const resolvedData: ResolvedNode = {
          ...nodeSource,
          mood,
          rawItem: rawDest,
          lat: destLat,
          lng: destLng,
        };

        const isTargetSlotTomorrow = isPlanningMode || (currentPeriod + slotIndex + 1) >= 4;

        if (nodeSource.isTomorrow && !isTargetSlotTomorrow) {
          // Ask user confirmation ONLY if picking an unreachable mood on a TODAY slot
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
          // Directly resolve & unlock next node. On tomorrow slots, popup is 100% normal
          setSlots((prev) => {
            const next = [...prev];

            // Calculate distance from previous resolved destination
            let distanceFromPrev: number | undefined;
            const newLat = resolvedData.lat;
            const newLng = resolvedData.lng;
            if (newLat != null && newLng != null) {
              // Find the closest previously resolved slot with valid coordinates
              for (let i = slotIndex - 1; i >= 0; i--) {
                const prevSlot = next[i];
                if (prevSlot?.status === 'resolved') {
                  const prevLat = prevSlot.node.lat;
                  const prevLng = prevSlot.node.lng;
                  if (prevLat != null && prevLng != null) {
                    distanceFromPrev = haversineKm(prevLat, prevLng, newLat, newLng);
                    break;
                  }
                }
              }
              // If no previous resolved slot, use user location
              if (distanceFromPrev === undefined) {
                distanceFromPrev = haversineKm(userLat, userLng, newLat, newLng);
              }
            }
            // Fallback: use API distanceKm if coordinates unavailable
            if (distanceFromPrev === undefined && resolvedData.distanceKm > 0) {
              distanceFromPrev = resolvedData.distanceKm;
            }

            next[slotIndex] = {
              status: 'resolved',
              index: slotIndex,
              resolvedAt: Date.now(),
              scheduledPeriod: (firstSlotPeriod + slotIndex) % 4,
              node: {
                ...resolvedData,
                distanceFromPrev,
                isTomorrow: isTargetSlotTomorrow,
                requiresTomorrowSlot: nodeSource.isTomorrow,
              },
            };
            if (slotIndex + 1 < next.length) {
              if (next[slotIndex + 1].status === 'locked') {
                next[slotIndex + 1] = { status: 'open', index: slotIndex + 1 };
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

  // Build the 3 display nodes (index maps to slot 1,2,3 on the wave)
  const waveNodes = [null, ...slots];

  // Compute trip date label from the most recent saved itinerary
  const getTripDateLabel = (): { dateStr: string; isToday: boolean; isTomorrow: boolean } | null => {
    try {
      if (isPlanningMode && !tripDateRef.current) {
        const tomorrowDate = new Date();
        tomorrowDate.setDate(tomorrowDate.getDate() + 1);
        return {
          dateStr: tomorrowDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          isToday: false,
          isTomorrow: true,
        };
      }
      const saved = getLocalItineraries();
      if (!saved.length) return null;
      const latest = saved[0];
      let tripDate: Date;
      if (latest.tripDate) {
        tripDate = new Date(latest.tripDate + 'T00:00:00');
      } else {
        const created = latest.createdAt ? new Date(latest.createdAt) : new Date();
        const hasTomorrow = latest.slots?.some((s) => s.isTomorrow) || created.getHours() >= 19;
        tripDate = new Date(created);
        if (hasTomorrow) tripDate.setDate(tripDate.getDate() + 1);
      }
      const today = new Date();
      const isToday =
        tripDate.getFullYear() === today.getFullYear() &&
        tripDate.getMonth() === today.getMonth() &&
        tripDate.getDate() === today.getDate();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const isTomorrow =
        tripDate.getFullYear() === tomorrow.getFullYear() &&
        tripDate.getMonth() === tomorrow.getMonth() &&
        tripDate.getDate() === tomorrow.getDate();
      const dateStr = tripDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      return { dateStr, isToday, isTomorrow };
    } catch {
      return null;
    }
  };

  const tripDateInfo = getTripDateLabel();
  // Compute max day offset across all resolved slots
  const maxDayOffset = slots.reduce((max, slot) => {
    if (slot.status !== 'resolved') return max;
    const offset = getSlotDayOffset(firstSlotPeriod, slot.index);
    return offset > max ? offset : max;
  }, 0);
  const hasMultipleDays = maxDayOffset > 0;
  const resolvedSegmentDistances = slots.map((slot) =>
    slot.status === 'resolved' && slot.node.distanceFromPrev != null ? slot.node.distanceFromPrev : null
  );
  const measuredSegmentDistances = resolvedSegmentDistances.filter((dist): dist is number => typeof dist === 'number' && dist > 0);
  const hasMeasuredSegments = measuredSegmentDistances.length === slots.length;
  const routeStartX = 4;
  const routeEndX = 96;
  const routeSpanX = routeEndX - routeStartX;
  const MIN_NODE_GAP_PCT = 15; // minimum % gap between nodes to prevent label collision
  const routeNodePositions = hasMeasuredSegments
    ? enforceMinGap(
      (() => {
        const totalDistance = measuredSegmentDistances.reduce((sum, dist) => sum + dist, 0);
        let cumulativeDistance = 0;
        return [
          routeStartX,
          ...measuredSegmentDistances.map((dist) => {
            cumulativeDistance += dist;
            return routeStartX + (cumulativeDistance / totalDistance) * routeSpanX;
          }),
        ];
      })(),
      MIN_NODE_GAP_PCT,
    )
    : Array.from({ length: slots.length + 1 }, (_, index) =>
        routeStartX + (index / Math.max(1, slots.length)) * routeSpanX
      );
  const routeLineY = (waveIndex: number) => (waveIndex === 0 ? 43 : waveIndex % 2 === 0 ? 28 : 42);
  const routeLinePath = routeNodePositions.slice(1).reduce((path, x, index) => {
    const startX = routeNodePositions[index] ?? 12.5;
    const endY = routeLineY(index + 1);
    return `${path} C ${startX + (x - startX) * 0.35} ${index % 2 === 0 ? 20 : 54}, ${startX + (x - startX) * 0.65} ${index % 2 === 0 ? 54 : 20}, ${x} ${endY}`;
  }, `M ${routeNodePositions[0] ?? 4} ${routeLineY(0)}`);
  const nextDestinationSlotIndex = slots.findIndex((slot) => slot.status === 'resolved' && !slot.node.isDone);

  return (
    <div className={`w-full max-w-[500px] sm:max-w-[560px] lg:max-w-none ml-0 bg-transparent overflow-visible ${className}`}>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-1 px-1">
        <div className="flex items-center gap-1.5">
          <Navigation className="h-3.5 w-3.5 text-gold-400 animate-pulse" />
          <h3 className="text-[11px] font-bold text-white/90 tracking-wide uppercase flex items-center gap-1">
            <span>{t('route_map.title')}</span>
            {tripDateInfo && (
              <span className="flex items-center gap-1">
                <span className="text-[9px] font-mono text-gold-300/80 normal-case tracking-normal">
                  {tripDateInfo.dateStr}
                  {hasMultipleDays && (
                    <>
                      {' — '}
                      {formatDayLabel(new Date(tripDateInfo.dateStr + 'T00:00:00'), maxDayOffset)}
                    </>
                  )}
                </span>
                {tripDateInfo.isTomorrow && !hasMultipleDays && (
                  <span className="px-1 py-px rounded bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[8px] font-bold font-mono">
                    {t('route_map.tomorrow')}
                  </span>
                )}
                {tripDateInfo.isToday && !hasMultipleDays && (
                  <span className="px-1 py-px rounded bg-green-400/20 text-green-300 border border-green-400/40 text-[8px] font-bold font-mono">
                    {t('route_map.today')}
                  </span>
                )}
                {hasMultipleDays && (
                  <span className="px-1 py-px rounded bg-blue-400/20 text-blue-300 border border-blue-400/40 text-[8px] font-bold font-mono">
                    {maxDayOffset + 1} hari
                  </span>
                )}
              </span>
            )}
          </h3>
        </div>
        <button
          type="button"
          onClick={() => { void clearItinerary(); }}
          className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-black/30 text-white/45 hover:border-red-400/50 hover:bg-red-500/15 hover:text-red-300 transition-colors"
          aria-label="Clear itinerary"
          title="Clear itinerary"
        >
          <X className="h-3 w-3" />
        </button>
      </div>

      {/* WAVE + NODES */}
      <div className="relative h-[190px] lg:h-[126px] bg-transparent overflow-visible">
        {/* WAVY SVG LINE */}
        <svg
          width="100%"
          height="64"
          viewBox="0 0 100 64"
          preserveAspectRatio="none"
          className="absolute left-0 top-16 lg:top-0 block w-full pointer-events-none"
          style={{ display: 'block' }}
          aria-hidden="true"
        >
          <path
            d={routeLinePath}
            fill="none"
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeDasharray="6,4"
            strokeLinecap="round"
            strokeOpacity="0.9"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Distance labels — Absolute positioning di antara node */}
        <div className="absolute inset-x-0 top-16 bottom-0 lg:inset-0 z-20 pointer-events-none">
          {slots.map((slot, i) => {
            const dist = slot?.status === 'resolved' ? slot.node.distanceFromPrev : undefined;
            if (dist == null) return null;
            
            const leftPos = ((routeNodePositions[i] ?? 4) + (routeNodePositions[i + 1] ?? 96)) / 2;
            
            return (
              <span
                key={`dist-${i}`}
                className="absolute px-1.5 py-0.5 rounded-full bg-black/80 border border-gold-400/50 text-[7px] font-mono font-bold text-gold-300 whitespace-nowrap shadow-[0_2px_8px_rgba(0,0,0,0.45)]"
                style={{
                  left: `${leftPos}%`,
                  top: i % 2 === 0 ? '20px' : '28px',
                  transform: 'translateX(-50%)',
                }}
              >
                {dist.toFixed(1)} km
              </span>
            );
          })}
        </div>

        {/* Day dividers — vertical dashed line + label between nodes that cross day boundaries */}
        {hasMultipleDays && (
          <div className="absolute inset-x-0 top-16 bottom-0 lg:inset-0 z-15 pointer-events-none">
            {slots.map((slot, i) => {
              if (i === 0) return null;
              if (slot.status !== 'resolved') return null;
              const prevSlot = slots[i - 1];
              if (prevSlot?.status !== 'resolved') return null;
              const prevDay = getSlotDayOffset(firstSlotPeriod, prevSlot.index);
              const currDay = getSlotDayOffset(firstSlotPeriod, slot.index);
              if (currDay <= prevDay) return null;
              // Day boundary found — render divider at midpoint between these two nodes
              const midX = ((routeNodePositions[i] ?? 4) + (routeNodePositions[i + 1] ?? 96)) / 2;
              const baseDate = tripDateRef.current ? new Date(tripDateRef.current + 'T00:00:00') : new Date();
              const label = formatDayLabel(baseDate, currDay);
              return (
                <div
                  key={`daydiv-${i}`}
                  className="absolute flex flex-col items-center"
                  style={{ left: `${midX}%`, top: '0', bottom: '0', transform: 'translateX(-50%)' }}
                >
                  <div className="w-px h-full border-l border-dashed border-blue-400/40" />
                  {label && (
                    <span className="absolute top-0 px-1.5 py-0.5 rounded bg-blue-500/20 border border-blue-400/40 text-[7px] font-bold font-mono text-blue-300 whitespace-nowrap">
                      📅 {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Nodes: pulled up on top of wave */}
        <div className="absolute inset-x-0 top-16 bottom-0 lg:inset-0 z-10">
          {waveNodes.map((slot, waveIndex) => {
            const getNodeTop = () => {
              if (waveIndex === 0) return '21px';
              const lineY = routeLineY(waveIndex);
              if (slot && (slot.status === 'locked' || slot.status === 'open' || slot.status === 'loading' || slot.status === 'confirming')) {
                return `${lineY - 36}px`;
              }
              return `${lineY - 16}px`;
            };
            const nodeStyle = {
              left: `${routeNodePositions[waveIndex] ?? 4}%`,
              top: getNodeTop(),
              transform: 'translateX(-50%)',
            };
            const waveTranslateY = '';

            // ── Position 0: User Location ──
            if (slot === null) {
              return (
                <div
                  key="user-start"
                  className={`absolute flex flex-col items-center group ${waveTranslateY}`}
                  style={nodeStyle}
                >
                  {/* Distance badge */}
                  <div className="mb-0.5 flex items-center gap-1 h-2" />
                  {/* Pin */}
                  <div className="relative flex h-3 w-3 items-center justify-center rounded-full bg-gold-500 text-royal-950 ring-1 ring-gold-400/80 shadow-[0_0_5px_rgba(234,179,8,0.5)] transition-all duration-300 shadow-sm">
                    <MapPin className="h-1.5 w-1.5" />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-1.5 w-1.5 items-center justify-center rounded-full bg-royal-950 border border-gold-400 text-[3px] font-mono font-bold text-gold-300">
                      📍
                    </span>
                  </div>
                  {/* Label */}
                  <div className="mt-1 w-[70px] text-center">
                    <span className="block text-[7px] font-bold uppercase tracking-wider text-gold-400">
                      {isPlanningMode ? 'Titik Mulai' : 'Kamu'}
                    </span>
                  </div>
                </div>
              );
            }

            const slotIndex = slot.index;
            // Use stored scheduledPeriod for resolved nodes so time stays fixed
            const slotPeriod = (slot.status === 'resolved' && slot.scheduledPeriod != null)
              ? slot.scheduledPeriod
              : (firstSlotPeriod + slotIndex) % 4;
            const slotMeta = BASE_SLOTS[slotPeriod];
            const isMoodPickerOpen = activeMoodPicker === slotIndex && slot.status === 'open';

            // ── LOCKED ──
            if (slot.status === 'locked') {
              const canUnlockLockedSlot = slotIndex === 0 || slots.slice(0, slotIndex).every((s) => s.status === 'resolved' || s.status === 'open' || s.status === 'loading' || s.status === 'confirming');
              return (
                <div
                  key={`slot-locked-${slotIndex}`}
                  className={`absolute flex flex-col items-center group ${canUnlockLockedSlot ? 'cursor-pointer opacity-100' : 'opacity-65'} ${waveTranslateY}`}
                  style={nodeStyle}
                  onClick={() => {
                    if (!canUnlockLockedSlot) return;
                    setSlots((prev) => {
                      const next = [...prev];
                      next[slotIndex] = { status: 'open', index: slotIndex };
                      return next;
                    });
                    setActiveMoodPicker(slotIndex);
                  }}
                >
                  <div className="mb-0.5 flex items-center gap-1 h-5" />
                  <div className={`relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full shadow-md ${
                    canUnlockLockedSlot
                      ? 'bg-black/65 text-gold-400 border border-gold-400/55 hover:bg-gold-400 hover:text-royal-950'
                      : 'bg-black/45 text-white/45 border border-white/20'
                  }`}>
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border text-[7px] font-mono font-bold ${
                      canUnlockLockedSlot ? 'border-gold-400 text-gold-300' : 'border-white/25 text-white/45'
                    }`}>
                      {waveIndex}
                    </span>
                  </div>
                  <div className="mt-1 w-[80px] sm:w-[96px] text-center">
                    <span className={`block text-[8px] font-bold uppercase tracking-wider ${canUnlockLockedSlot ? 'text-gold-400' : 'text-white/45'}`}>
                      {slotMeta.time}
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
                  className={`absolute flex flex-col items-center cursor-pointer group ${waveTranslateY}`}
                  style={nodeStyle}
                  onClick={() => setActiveMoodPicker(isMoodPickerOpen ? null : slotIndex)}
                >
                  <div className="mb-0.5 flex items-center gap-1 h-5" />
                  {/* Pulsing ? pin */}
                  <div className="relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-black/50 text-gold-400 border border-gold-400/50 hover:bg-gold-400 hover:text-royal-950 hover:scale-110 transition-all duration-300 shadow-md">
                    <span className="text-[13px] font-black">?</span>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-gold-400 text-[7px] font-mono font-bold text-gold-300">
                      {waveIndex}
                    </span>
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-full bg-gold-400 opacity-20 animate-ping" />
                  </div>
                  <div className="mt-1 w-[80px] sm:w-[96px] text-center">
                    <span className="block text-[8px] font-bold uppercase tracking-wider text-gold-400">
                      {slotMeta.time}
                    </span>
                    <span className="hidden text-[9px] font-bold text-white/90 leading-tight group-hover:block group-hover:text-gold-300">
                      Tap pilih
                    </span>
                  </div>

                  {/* Mood Picker Dropdown */}
                  {isMoodPickerOpen && (
                    <div
                      className={`absolute bottom-[calc(100%-18px)] z-50 w-[236px] p-1.5 rounded-lg border border-gold-400/60 bg-royal-950/95 backdrop-blur-xl shadow-[0_8px_22px_rgba(0,0,0,0.85)] animate-fade-in lg:w-[min(360px,calc(100vw-32px))] lg:p-2 lg:rounded-xl ${
                        waveIndex <= 1 ? 'left-1/2 -translate-x-[35%] lg:left-0 lg:translate-x-0' : waveIndex >= 3 ? 'right-0' : 'left-1/2 -translate-x-1/2'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className={`absolute -bottom-1 h-2.5 w-2.5 rotate-45 border-b border-r border-gold-400/60 bg-royal-950/95 ${
                        waveIndex <= 1 ? 'left-[28%]' : waveIndex >= 3 ? 'left-[72%]' : 'left-1/2 -translate-x-1/2'
                      }`} />
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[8.5px] lg:text-[9.5px] font-bold text-gold-400 tracking-wide">
                          {t(startsTomorrow ? 'route_map.mood_title_tomorrow' : 'route_map.mood_title_today')}
                        </p>
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

                      <div className="flex gap-1 overflow-x-auto whitespace-nowrap pb-0.5 scrollbar-none">
                        {MOOD_OPTIONS.map((mood) => {
                          const isSlotTomorrow = isPlanningMode || (currentPeriod + slotIndex + 1) >= 4;
                          const isNatureOrBeach = mood.category === 'nature' || mood.category === 'beach';
                          const isCultural = mood.category === 'cultural';
                          // NOTE: This "closed after 17:00" rule is duplicated in the backend
                          // at tourist/handler.go (NextStop function, scoring + isTomorrow logic).
                          // If you change the categories or cutoff time here, update the backend too.
                          const isLateClosed = !isSlotTomorrow && currentHour >= 17 && (isNatureOrBeach || isCultural);

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
                              className={`flex shrink-0 items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[8px] lg:gap-1 lg:py-1 lg:text-[8.5px] font-bold transition-all ${
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
                  className={`absolute flex flex-col items-center group ${waveTranslateY}`}
                  style={nodeStyle}
                >
                  <div className="mb-0.5 flex items-center gap-1">
                    <div className="px-1.5 py-0.5 rounded-full bg-black/75 backdrop-blur-sm border border-gold-400/40 text-[8px] font-bold text-gold-300 flex items-center gap-0.5 shadow-sm">
                      <span>{getMoodIcon(slot.mood)}</span>
                    </div>
                  </div>
                  <div className="relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full bg-gold-500/30 text-gold-400 border border-gold-400/50 animate-pulse shadow-md">
                    <span className="text-sm">{getMoodIcon(slot.mood)}</span>
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-gold-400 text-[7px] font-mono font-bold text-gold-300">
                      {waveIndex}
                    </span>
                  </div>
                  <div className="mt-1 w-[92px] sm:w-[110px] text-center">
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
                  className={`absolute flex flex-col items-center cursor-pointer group ${waveTranslateY}`}
                  style={nodeStyle}
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
                      {waveIndex}
                    </span>
                  </div>
                  <div className="mt-1 w-[92px] sm:w-[110px] text-center">
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
            const nodeKey = node.id + slotIndex;
            const isPopupOpen = pinnedNodeId === nodeKey || hoveredNodeId === nodeKey;
            const isNextDestination = slotIndex === nextDestinationSlotIndex;

            return (
              <div
                key={`slot-resolved-${slotIndex}-${node.id}`}
                onMouseEnter={() => setHoveredNodeId(nodeKey)}
                onMouseLeave={() => setHoveredNodeId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  // Clicking the pin toggles pinned state (stays open!)
                  setPinnedNodeId(pinnedNodeId === nodeKey ? null : nodeKey);
                }}
                className={`absolute flex flex-col items-center cursor-pointer group transition-transform ${waveTranslateY}`}
                style={nodeStyle}
              >
                {/* Distance Badge + Tomorrow / Selesai Tag */}
                <div className="mb-0.5 flex items-center gap-1">
                  {node.isDone ? (
                    <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[7.5px] font-bold flex items-center gap-0.5 shadow-sm">
                      <CheckCircle className="h-2 w-2 text-emerald-400" /> SELESAI
                    </span>
                  ) : (
                    <>
                      {node.isTomorrow && (
                        <span className="px-1 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-400/50 text-[7px] font-mono font-bold">
                          BESOK
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Glowing Pin */}
                <div
                  className={`relative flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-full transition-all duration-300 shadow-md ${
                    node.isDone
                      ? isPopupOpen
                        ? 'bg-emerald-500 text-royal-950 scale-125 ring-2 ring-emerald-400/80 shadow-[0_0_15px_rgba(16,185,129,0.8)] z-30'
                        : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-royal-950 hover:scale-110'
                      : isPopupOpen
                        ? 'bg-gold-400 text-royal-950 scale-125 ring-2 ring-gold-400/80 shadow-[0_0_15px_rgba(234,179,8,0.9)] z-30'
                        : 'bg-black/50 text-gold-400 border border-gold-400/50 hover:bg-gold-400 hover:text-royal-950 hover:scale-110'
                  }`}
                >
                  {isNextDestination && !isPopupOpen && (
                    <span className="absolute inset-0 rounded-full bg-gold-400/25 animate-ping" />
                  )}
                  <TypeIcon className="h-3.5 w-3.5" />
                  <span className={`absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border text-[7px] font-mono font-bold ${
                    node.isDone ? 'border-emerald-400 text-emerald-300' : 'border-gold-400 text-gold-300'
                  }`}>
                    {waveIndex}
                  </span>
                </div>

                {/* Label */}
                <div className="mt-1 w-[78px] sm:w-[94px] text-center">
                  <span className={`block text-[8px] font-bold uppercase tracking-wider ${node.isDone ? 'text-emerald-400/80' : 'text-gold-400'}`}>
                    {slotMeta.time}
                  </span>
                  <span className={`block text-[9px] font-bold leading-tight truncate ${node.isDone ? 'text-white/50 line-through decoration-white/30' : 'text-white/90 group-hover:text-gold-300'}`}>
                    {node.title}
                  </span>
                  <span className="hidden text-[7.5px] font-semibold text-gold-400/90 truncate mt-0.5 group-hover:block">
                    📍 {node.subRegion || node.location}
                  </span>
                </div>

                {/* Floating Popup */}
                {isPopupOpen && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (node.rawItem && onExploreDestination) {
                        onExploreDestination(node.rawItem);
                      }
                    }}
                    className={`absolute bottom-full mb-3 z-50 w-64 p-2.5 rounded-xl border bg-royal-950/95 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.9)] animate-fade-in transition-all ${
                      node.isDone ? 'border-emerald-500/50' : 'border-gold-400/60'
                    } ${
                      waveIndex === 1
                        ? 'left-0'
                        : waveIndex === 3
                          ? 'right-0'
                          : 'left-1/2 -translate-x-1/2'
                    }`}
                  >
                    <div className={`absolute -bottom-1.5 h-3 w-3 rotate-45 border-b border-r bg-royal-950/95 ${
                      node.isDone ? 'border-emerald-500/50' : 'border-gold-400/60'
                    } ${
                      waveIndex === 1 ? 'left-4' : waveIndex === 3 ? 'right-4' : 'left-1/2 -translate-x-1/2'
                    }`} />

                    {/* Header with Close Button × */}
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-white/10 text-[8.5px] font-bold">
                      <div className="flex items-center gap-1 text-gold-400">
                        <Calendar className="h-2.5 w-2.5 text-gold-400" />
                        <span className="text-gold-300">{slotMeta.timeRange}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-white/60 bg-white/10 px-1.5 rounded">{slotMeta.duration}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPinnedNodeId(null);
                            setHoveredNodeId(null);
                          }}
                          className="flex items-center justify-center w-4 h-4 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white text-[10px] font-bold transition-all cursor-pointer"
                          aria-label="Tutup Popup"
                          title="Tutup"
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    {/* Finished Banner if slot period has passed */}
                    {node.isDone && (
                      <div className="mb-2 p-2 rounded-lg bg-emerald-500/15 border border-emerald-400/40 text-left flex items-center gap-1.5">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                        <div>
                          <p className="text-[9px] font-bold text-emerald-300 leading-none mb-0.5">Jadwal Telah Selesai</p>
                          <p className="text-[8px] text-emerald-200/80 leading-tight">Waktu kunjungan untuk slot ini sudah berlalu.</p>
                        </div>
                      </div>
                    )}

                    {/* Warning Banner if scheduled for tomorrow */}
                    {(node.isTomorrow || node.requiresTomorrowSlot) && !node.isDone && (
                      <div className="mb-2 p-2 rounded-lg bg-amber-500/15 border border-amber-400/40 text-left">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-amber-300 mb-0.5">
                          <span>📅</span>
                          <span>{node.scheduledFor || (node.isTomorrow ? 'Dijadwalkan Besok' : 'Direkomendasikan untuk Besok')}</span>
                        </div>
                        <p className="text-[8px] text-amber-200/90 leading-tight">
                          {node.timeWarning || (node.isTomorrow
                            ? 'Slot waktu ini jatuh di hari berikutnya dalam itinerary Anda.'
                            : 'Destinasi ini umumnya tutup malam hari, kami jadwalkan untuk besok.')}
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
                            {node.distanceFromPrev != null ? `${node.distanceFromPrev.toFixed(1)} km` : `${node.distanceKm.toFixed(1)} km`}
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
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10 text-[9px] relative z-10">
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Toast notification — shown after auto-save */}
      {toast?.visible && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            border: '1px solid rgba(255,196,0,0.3)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,196,0,0.1)',
            minWidth: '280px',
            maxWidth: '90vw',
          }}
        >
          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
          <span className="text-[12px] font-semibold text-white flex-1">
            {toast.synced ? 'Tersimpan ke akun ☁️' : 'Itinerary tersimpan!'}
          </span>
          <button
            onClick={() => router.push('/planner')}
            className="text-[11px] font-bold text-gold-400 hover:text-gold-300 transition-colors cursor-pointer whitespace-nowrap"
          >
            Lihat ↗
          </button>
          {!isAuthenticated && !toast.synced && (
            <button
              onClick={() => { setToast(null); setAuthModalOpen(true); }}
              className="text-[11px] font-bold text-white/60 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
            >
              Login & Sync ↑
            </button>
          )}
          <button
            onClick={() => setToast(null)}
            className="flex items-center justify-center w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white transition-all cursor-pointer flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Auth Modal — only for login flow from toast "Login & Sync" button (guest only) */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={async () => {
          setAuthModalOpen(false);
          await syncLocalItinerariesToDB();
        }}
      />
    </div>
  );
}
