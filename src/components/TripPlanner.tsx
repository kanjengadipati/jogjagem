import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  CalendarDays, Trash,
  PlusCircle, CheckCircle, Info, Save, Loader2
} from 'lucide-react';
import { Destination, TripPlan, TripDay } from '../types';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import { trips as tripsApi, TripDayPayload, TripResponse } from '../lib/api';
import { getLocalItineraries, LocalItinerary, HERO_ROUTE_DRAFT_KEY } from '../lib/itinerary-storage';
import RouteLineDisplay from './RouteLineDisplay';

const BASE_SLOT_ENDS = ['10:00', '14:00', '18:00', '22:00'];
const BASE_SLOT_TIMES = ['07.00 AM', '12.00 PM', '03.30 PM', '07.30 PM'];
type PlannerDestination = Destination & {
  routeTime?: string;
  routeDistanceFromPrev?: number;
};

function getStoredPeriodIndex(slot: { scheduledPeriod?: number; time?: string; timeRange?: string; slotIndex: number }): number {
  if (typeof slot.scheduledPeriod === 'number') return slot.scheduledPeriod;
  const byRange = ['07:00 - 10:00 WIB', '12:00 - 14:00 WIB', '15:30 - 18:00 WIB', '19:30 - 22:00 WIB'].indexOf(slot.timeRange ?? '');
  if (byRange >= 0) return byRange;
  const byTime = ['07.00 AM', '12.00 PM', '03.30 PM', '07.30 PM'].indexOf(slot.time ?? '');
  if (byTime >= 0) return byTime;
  return slot.slotIndex % BASE_SLOT_ENDS.length;
}

function getHeroDraftItinerary(): LocalItinerary | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(HERO_ROUTE_DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as {
      slots?: Array<{
        status: string;
        index: number;
        scheduledPeriod?: number;
        node?: {
          id: string;
          title: string;
          category: string;
          image: string;
          location: string;
          subRegion?: string;
          rating: number;
          distanceFromPrev?: number;
          lat?: number;
          lng?: number;
          isTomorrow?: boolean;
          scheduledFor?: string;
        };
      }>;
      tripDate?: string | null;
      remoteTripId?: string | null;
    };
    const resolvedSlots = (draft.slots ?? []).filter((slot) => slot.status === 'resolved' && slot.node);
    if (resolvedSlots.length === 0) return null;
    const createdAt = new Date().toISOString();
    return {
      id: 'hero-route-draft',
      remoteTripId: draft.remoteTripId ?? undefined,
      title: 'Draft Rute dari Hero',
      createdAt,
      tripDate: draft.tripDate ?? undefined,
      slots: resolvedSlots.map((slot) => {
        const period = slot.scheduledPeriod ?? slot.index % BASE_SLOT_ENDS.length;
        const timeRanges = ['07:00 - 10:00 WIB', '12:00 - 14:00 WIB', '15:30 - 18:00 WIB', '19:30 - 22:00 WIB'];
        const times = ['07.00 AM', '12.00 PM', '03.30 PM', '07.30 PM'];
        return {
          slotIndex: slot.index,
          scheduledPeriod: period,
          time: times[period],
          timeRange: timeRanges[period],
          isTomorrow: slot.node!.isTomorrow ?? false,
          scheduledFor: slot.node!.scheduledFor,
          distanceFromPrev: slot.node!.distanceFromPrev,
          lat: slot.node!.lat,
          lng: slot.node!.lng,
          destination: {
            id: slot.node!.id,
            title: slot.node!.title,
            category: slot.node!.category,
            image: slot.node!.image,
            location: slot.node!.subRegion || slot.node!.location,
            rating: slot.node!.rating,
          },
        };
      }),
    };
  } catch {
    return null;
  }
}

function buildPlannerDestination(
  slot: LocalItinerary['slots'][number],
  scheduledPeriod: number,
  found?: Destination
): PlannerDestination {
  return {
    ...(found ?? ({
      id: slot.destination.id,
      name: slot.destination.title,
      category: slot.destination.category,
      location: slot.destination.location,
      subRegion: slot.destination.location,
      images: slot.destination.image ? [{ url: slot.destination.image }] : [],
      rating: slot.destination.rating,
      reviewCount: 0,
      description: '',
      tagline: '',
      ticketPrice: '',
      openingHours: '',
      facilities: [],
      travelTips: [],
      bestTime: '',
      weather: {},
      latitude: 0,
      longitude: 0,
      reviews: [],
      partners: [],
      faqs: [],
    } as unknown as Destination)),
    routeTime: slot.time || BASE_SLOT_TIMES[scheduledPeriod],
    routeDistanceFromPrev: slot.distanceFromPrev,
  } as PlannerDestination;
}

/** Safely extract the first image URL regardless of whether images are
 *  plain strings or {url, credit} objects (both shapes come from the BE). */
function getImgUrl(dest: Destination): string {
  const imgs = dest.images as unknown[];
  if (!Array.isArray(imgs) || imgs.length === 0) return '';
  const first = imgs[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'url' in first) return (first as { url: string }).url ?? '';
  return '';
}

interface TripPlannerProps {
  savedDestinations: Destination[];
  allDestinations?: Destination[];
  onExploreDestination: (dest: Destination) => void;
  onRemoveFromSaved: (dest: Destination) => void;
}

export default function TripPlanner({ 
  savedDestinations,
  onExploreDestination,
  onRemoveFromSaved
}: TripPlannerProps) {
  const { isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  // remote BE id — null means trip hasn't been saved yet
  const [remoteId, setRemoteId] = useState<string | null>(null);

  // Local AI itineraries saved from home page wave control
  const [localItineraries, setLocalItineraries] = useState<LocalItinerary[]>([]);

  const refreshLocalItineraries = () => {
    const draft = getHeroDraftItinerary();
    const itineraries = draft ? [draft, ...getLocalItineraries()] : getLocalItineraries();
    setLocalItineraries(itineraries);
  };

  useEffect(() => {
    refreshLocalItineraries();
    // Re-read when user comes back to this tab (e.g. after building itinerary on home)
    window.addEventListener('focus', refreshLocalItineraries);
    document.addEventListener('visibilitychange', refreshLocalItineraries);
    // Also listen for storage events from other tabs
    window.addEventListener('storage', refreshLocalItineraries);
    return () => {
      window.removeEventListener('focus', refreshLocalItineraries);
      document.removeEventListener('visibilitychange', refreshLocalItineraries);
      window.removeEventListener('storage', refreshLocalItineraries);
    };
  }, []);

  const [tripPlan, setTripPlan] = useState<TripPlan>({
    id: 'my-custom-trip',
    title: 'My Royal Yogyakarta Escape',
    startDate: '2026-08-10',
    durationDays: 3,
    days: [
      { dayNumber: 1, destinations: [], notes: 'Cultural heritage immersion' },
      { dayNumber: 2, destinations: [], notes: 'Volcano thrills and hot coffee' },
      { dayNumber: 3, destinations: [], notes: 'Southern sunset beach mirror' },
    ],
  });

  const [activeDayIdx, setActiveDayIdx] = useState(0);

  useEffect(() => {
    const hasUnassignedRoute = localItineraries.some((item) => (item.slots ?? []).length > 0);
    const hasAllocatedDay = tripPlan.days.some((day) => day.destinations.length > 0);
    if (hasUnassignedRoute && !hasAllocatedDay) setActiveDayIdx(-1);
  }, [localItineraries, tripPlan.days]);

  // ── Load existing trip from BE on mount ────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    tripsApi.getAll().then((res) => {
      if (res.status !== 'success' || !res.data?.length) return;
      const remote = (res.data as TripResponse[])[0];
      setRemoteId(remote.id);
      // Rebuild days — dest objects are not stored on BE, only IDs.
      // We keep the structure; full dest objects re-attach from savedDestinations.
      const destMap = Object.fromEntries(savedDestinations.map((d) => [d.id, d]));
      const days: TripDay[] = (remote.days ?? []).map((d: TripDayPayload) => ({
        dayNumber: d.dayNumber,
        notes: d.notes ?? '',
        destinations: (d.destinationIds ?? [])
          .map((id: string) => destMap[id])
          .filter(Boolean) as Destination[],
      }));
      const hasRemoteDestinations = days.some((day) => day.destinations.length > 0);
      if (hasRemoteDestinations) {
        setTripPlan({
          id: remote.id,
          title: remote.title,
          startDate: remote.start_date ?? '',
          durationDays: remote.duration_days,
          days,
        });
      }
    }).catch(() => {});
  }, [isAuthenticated]);

  const handleAddDestinationToDay = (dest: Destination, dayNum: number) => {
    setTripPlan(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.dayNumber === dayNum) {
          if (day.destinations.some(d => d.id === dest.id)) return day;
          return { ...day, destinations: [...day.destinations, dest] };
        }
        return day;
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleRemoveFromDay = (destId: string, dayNum: number) => {
    setTripPlan(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.dayNumber === dayNum) {
          return { ...day, destinations: day.destinations.filter(d => d.id !== destId) };
        }
        return day;
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleAddDay = () => {
    setTripPlan(prev => {
      const newDayNum = prev.durationDays + 1;
      const newDay: TripDay = { dayNumber: newDayNum, destinations: [], notes: `Exploring Yogyakarta's beauties` };
      return { ...prev, durationDays: newDayNum, days: [...prev.days, newDay] };
    });
    setActiveDayIdx(tripPlan.days.length);
  };

  const unassignedRouteItinerary = localItineraries.find((item) => (item.slots ?? []).length > 0) ?? null;
  const unassignedRouteDestinations = unassignedRouteItinerary
    ? [...unassignedRouteItinerary.slots]
        .sort((a, b) => a.slotIndex - b.slotIndex)
        .map((slot) => buildPlannerDestination(slot, getStoredPeriodIndex(slot)))
    : [];
  const isUnassignedRouteTab = activeDayIdx === -1;
  const activeDay = isUnassignedRouteTab ? undefined : tripPlan.days[activeDayIdx];
  const displayedDestinations = isUnassignedRouteTab
    ? unassignedRouteDestinations
    : activeDay?.destinations ?? [];

  // Serialise local TripDay[] → TripDayPayload[] for the BE
  const buildPayload = () =>
    tripPlan.days.map((day) => ({
      dayNumber: day.dayNumber,
      destinationIds: day.destinations.map((d) => d.id),
      notes: day.notes ?? '',
    }));

  const handleSavePlan = async () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    setSaveFeedback('saving');
    try {
      const payload = {
        title: tripPlan.title,
        start_date: tripPlan.startDate,
        duration_days: tripPlan.durationDays,
        days: buildPayload(),
        status: 'draft',
      };

      if (remoteId) {
        // Update existing
        const res = await tripsApi.update(remoteId, payload);
        if (res.status === 'success') {
          setSaveFeedback('saved');
        } else {
          setSaveFeedback('error');
        }
      } else {
        // Create new
        const res = await tripsApi.create(payload);
        if (res.status === 'success' && res.data) {
          setRemoteId((res.data as TripResponse).id);
          setSaveFeedback('saved');
        } else {
          setSaveFeedback('error');
        }
      }
    } catch {
      setSaveFeedback('error');
    } finally {
      setTimeout(() => setSaveFeedback('idle'), 2500);
    }
  };

  return (
    <div id="trip-planner-page" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gold-100 pb-5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-royal-950 text-gold-300 shadow-md">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-manrope text-2xl font-bold text-royal-950">{tripPlan.title}</h1>
            <p className="text-xs text-royal-700/80 font-light">
              Craft your customizable itinerary, reorder visits, and review local transportation guides.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Plan button */}
          <button
            onClick={handleSavePlan}
            className={`flex items-center space-x-1.5 rounded-full px-5 py-2.5 text-xs font-semibold active:scale-95 transition-all shadow-md ${
              saveFeedback === 'saved'
                ? 'bg-green-600 text-white'
                : saveFeedback === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-white border border-gold-300 text-gold-800 hover:bg-gold-50'
            }`}
          >
            {saveFeedback === 'saved' ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span>Plan Saved!</span>
              </>
            ) : saveFeedback === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving…</span>
              </>
            ) : saveFeedback === 'error' ? (
              <>
                <Save className="h-4 w-4" />
                <span>Retry Save</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Plan</span>
              </>
            )}
          </button>

          <button
            onClick={handleAddDay}
            className="flex items-center space-x-1.5 rounded-full bg-gold-800 text-gold-50 px-5 py-2.5 text-xs font-semibold hover:bg-gold-700 active:scale-95 transition-all shadow-md"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Day</span>
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Pane: Saved Favorites Bank */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-gold-100 bg-white p-5 space-y-4">
            <h3 className="font-manrope text-base font-bold text-royal-950 flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-100 text-xs text-gold-700 font-mono">
                {savedDestinations.length}
              </span>
              <span>Saved Discoveries</span>
            </h3>
            
            <p className="text-xs text-royal-700/70 font-light">
              Click the plus button to allocate these authentic spots into your daily trip slots.
            </p>

            {savedDestinations.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gold-200 rounded-2xl bg-gold-50/20 p-4">
                <Info className="h-8 w-8 text-gold-500 mx-auto mb-2" />
                <span className="block text-xs font-medium text-royal-950">No saved favorites yet</span>
                <span className="block text-[10px] text-royal-700/60 font-light mt-1">
                  Explore Yogyakarta destinations and click the heart icon on cards to save them.
                </span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {savedDestinations.map(dest => (
                  <div 
                    key={dest.id}
                    id={`planner-saved-card-${dest.id}`}
                    className="flex items-center justify-between rounded-2xl border border-gold-50 bg-white p-3 hover:border-gold-300 hover:shadow-sm transition-all"
                  >
                    <div 
                      onClick={() => onExploreDestination(dest)}
                      className="flex items-center space-x-3 cursor-pointer flex-1"
                    >
                      <Image src={getImgUrl(dest)} alt={dest.name} width={48} height={48} className="h-12 w-12 rounded-xl object-cover border border-gold-100" />
                      <div>
                        <h4 className="font-manrope font-bold text-xs text-royal-950 hover:text-gold-700 transition-colors">
                          {dest.name}
                        </h4>
                        <span className="block text-[10px] font-mono text-royal-700/50">{dest.subRegion}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 ml-2">
                      <div className="flex items-center space-x-1 border border-gold-100 rounded-full px-2 py-1 bg-gold-50/30">
                        <span className="text-[9px] font-mono font-semibold text-royal-950">Add to:</span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddDestinationToDay(dest, parseInt(e.target.value));
                              e.target.value = '';
                            }
                          }}
                          className="text-[9px] font-mono bg-transparent text-gold-700 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="">Choose Day</option>
                          {tripPlan.days.map(day => (
                            <option key={day.dayNumber} value={day.dayNumber}>Day {day.dayNumber}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => onRemoveFromSaved(dest)}
                        className="rounded-full p-1.5 text-royal-700/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Local Javanese transportation tips */}
          <div className="rounded-3xl bg-gold-50/40 border border-gold-100/40 p-5 space-y-3">
            <h4 className="font-manrope text-sm font-bold text-royal-950">Transportation Guide</h4>
            <div className="space-y-2 text-xs text-royal-700 font-light leading-relaxed">
              <p>
                <strong>• Royal Andong (Chariots):</strong> Best for relaxing rides around Malioboro and central heritage quarters. Negotiate fares beforehand (usually IDR 50k-100k).
              </p>
              <p>
                <strong>• TransJogja Bus:</strong> Air-conditioned public buses connecting major hubs (Sleman, Malioboro, Prambanan) for just IDR 3,600!
              </p>
              <p>
                <strong>• Car/Jeep Rentals:</strong> Highly recommended for trips to high areas (Mount Merapi) or deep coastal cliffs (Parangtritis). Available with English-speaking guides.
              </p>
            </div>
          </div>
        </div>

        {/* Right Pane: Customized Daily Slots Itinerary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Day selection tabs */}
          <div id="trip-planner-days" className="flex space-x-2 border-b border-gold-100 pb-3 overflow-x-auto">
            {unassignedRouteDestinations.length > 0 && (
              <button
                onClick={() => setActiveDayIdx(-1)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors shrink-0 ${
                  isUnassignedRouteTab
                    ? 'bg-royal-950 text-gold-300 shadow-sm'
                    : 'bg-white text-royal-700/60 hover:bg-gold-50 border border-gold-100'
                }`}
              >
                Route
              </button>
            )}
            {tripPlan.days.map((day, idx) => (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDayIdx(idx)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors shrink-0 ${
                  activeDayIdx === idx
                    ? 'bg-gold-800 text-gold-50 shadow-sm'
                    : 'bg-white text-royal-700/60 hover:bg-gold-50 border border-gold-100'
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {/* Active day detail planner card */}
          {(isUnassignedRouteTab || activeDay) && (
            <div className="rounded-3xl border border-gold-100 bg-white p-6 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-gold-600 font-semibold">Scheduled Itinerary</span>
                  <h3 className="font-manrope text-lg font-bold text-royal-950">
                    {isUnassignedRouteTab ? 'Route Sequence' : `Day ${activeDay?.dayNumber} Slots`}
                  </h3>
                </div>
                <span className="text-xs font-mono font-medium text-royal-700/60">
                  {displayedDestinations.length} {isUnassignedRouteTab ? 'Stops' : 'Allocated'}
                </span>
              </div>

              {/* Daily allocated spots list */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="block text-[10px] font-sans uppercase tracking-[0.08em] text-royal-700/70 font-semibold">Route Sequence</span>
                  {displayedDestinations.length > 0 && (
                    <span className="text-[10px] font-mono font-semibold text-royal-700/50">
                      {displayedDestinations.length} stops
                    </span>
                  )}
                </div>
                
                {displayedDestinations.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-gold-100 rounded-2xl bg-gold-50/20 text-xs text-royal-700/60 font-light">
                    {isUnassignedRouteTab
                      ? 'Route dari hero belum tersedia.'
                      : `Add destinations from your Saved Discoveries to design Day ${activeDay?.dayNumber}.`}
                  </div>
                ) : (
                  <div className="relative space-y-0">
                    {displayedDestinations.map((dest, idx) => {
                      const routeDest = dest as PlannerDestination;
                      const isLastStop = idx === displayedDestinations.length - 1;
                      return (
                        <div 
                          key={dest.id}
                          id={`planner-route-card-${dest.id}`}
                          className="relative pl-14 pb-4 last:pb-0"
                        >
                          {!isLastStop && (
                            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gold-200/80" />
                          )}
                          {/* Number tracker on route */}
                          <div className="absolute left-2.5 top-5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-royal-950 text-gold-300 font-mono text-[11px] font-bold border border-gold-400 shadow-md">
                            {idx + 1}
                          </div>

                        <div className="rounded-2xl border border-gold-100 bg-white p-3 hover:border-gold-300 transition-all shadow-sm">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 min-w-0">
                              <Image src={getImgUrl(dest)} alt={dest.name} width={56} height={56} className="h-14 w-14 rounded-xl object-cover border border-gold-100" />
                              <div className="min-w-0">
                                <div className="mb-1 flex items-center gap-2">
                                  {routeDest.routeTime && (
                                    <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[9px] font-mono font-bold text-gold-800">
                                      {routeDest.routeTime}
                                    </span>
                                  )}
                                  {routeDest.routeDistanceFromPrev != null && (
                                    <span className="rounded-full bg-royal-950 px-2 py-0.5 text-[9px] font-mono font-bold text-gold-300">
                                      {routeDest.routeDistanceFromPrev.toFixed(1)} km
                                    </span>
                                  )}
                                </div>
                                <h4 className="font-manrope font-bold text-sm text-royal-950 hover:text-gold-700 transition-colors truncate cursor-pointer" onClick={() => onExploreDestination(dest)}>
                                  {dest.name}
                                </h4>
                                <span className="block text-[10px] font-mono text-royal-700/50 truncate">{dest.subRegion || dest.location}</span>
                              </div>
                            </div>
                            {!isUnassignedRouteTab && activeDay && (
                              <button
                                onClick={() => handleRemoveFromDay(dest.id, activeDay?.dayNumber ?? 0)}
                                className="rounded-full p-2 text-royal-700/30 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                                aria-label={`Remove ${dest.name}`}
                              >
                                <Trash className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Route line visual */}
              {displayedDestinations.length > 1 && (
                <RouteLineDisplay destinations={displayedDestinations} />
              )}

            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />
    </div>
  );
}
