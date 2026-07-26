/**
 * itinerary-storage.ts
 * Helpers for local-first itinerary storage.
 * Itineraries are stored in localStorage under the key STORAGE_KEY as a
 * JSON array of LocalItinerary objects. When the user logs in,
 * syncLocalItinerariesToDB() uploads them to the backend trips API.
 */

import { trips } from './api';

export const STORAGE_KEY = 'explore_jogja_itineraries_v1';
export const HERO_ROUTE_DRAFT_KEY = 'explore_jogja_hero_route_draft_v1';

export interface LocalItinerarySlot {
  slotIndex: number;
  scheduledPeriod?: number;
  /** e.g. "07.00 AM" */
  time: string;
  timeRange: string;
  isTomorrow: boolean;
  scheduledFor?: string;
  distanceFromPrev?: number;
  lat?: number;
  lng?: number;
  destination: {
    id: string;
    title: string;
    category: string;
    image: string;
    location: string;
    rating: number;
  };
}

export interface LocalItinerary {
  /** nanoid-like uuid generated client-side */
  id: string;
  remoteTripId?: string;
  title: string;
  /** ISO date string of creation */
  createdAt: string;
  /** YYYY-MM-DD date when the trip is scheduled */
  tripDate?: string;
  slots: LocalItinerarySlot[];
}

// ─── Read / Write ────────────────────────────────────────────────────────────

export function getLocalItineraries(): LocalItinerary[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Deduplicate by slot destination IDs fingerprint — keep newest
    const seen = new Set<string>();
    const deduped = parsed.filter((item: LocalItinerary) => {
      const fingerprint = (item.slots ?? [])
        .map((s) => s.destination?.id ?? '')
        .sort()
        .join(',');
      if (seen.has(fingerprint)) return false;
      seen.add(fingerprint);
      return true;
    });
    // Persist deduplicated list back if it changed
    if (deduped.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
    }
    return deduped;
  } catch {
    return [];
  }
}

export function saveItineraryLocally(itinerary: LocalItinerary): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalItineraries();
    // Replace if same id exists, otherwise prepend
    const idx = existing.findIndex((i) => i.id === itinerary.id);
    if (idx >= 0) {
      existing[idx] = itinerary;
    } else {
      existing.unshift(itinerary);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // storage quota exceeded — ignore silently
  }
}

export function clearLocalItinerary(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getLocalItineraries();
    const filtered = existing.filter((i) => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch {}
}

export function clearAllLocalItineraries(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ─── DB Sync ─────────────────────────────────────────────────────────────────

/**
 * Sync all locally stored itineraries to the backend trips API.
 * Called after user successfully logs in.
 * Successfully synced items are removed from localStorage.
 */
export async function syncLocalItinerariesToDB(): Promise<void> {
  const itineraries = getLocalItineraries();
  if (itineraries.length === 0) return;

  for (const itinerary of itineraries) {
    try {
      // Use tripDate if stored, or calculate based on slots/createdAt
      let startDate = itinerary.tripDate;
      if (!startDate) {
        const createdDate = itinerary.createdAt ? new Date(itinerary.createdAt) : new Date();
        const hasTomorrow = itinerary.slots.some((s) => s.isTomorrow) || createdDate.getHours() >= 19;
        if (hasTomorrow) {
          createdDate.setDate(createdDate.getDate() + 1);
        }
        startDate = createdDate.toISOString().split('T')[0];
      }

      const destinationIds = itinerary.slots.map((s) => s.destination.id);

      // Group slots by day for multi-day itineraries
      const dayGroups: Record<number, string[]> = {};
      let maxDay = 0;
      for (const s of itinerary.slots) {
        const scheduledPeriod = typeof s.scheduledPeriod === 'number' ? s.scheduledPeriod : 0;
        const dayOffset = Math.floor((scheduledPeriod + s.slotIndex) / 4);
        if (!dayGroups[dayOffset]) dayGroups[dayOffset] = [];
        dayGroups[dayOffset].push(s.destination.id);
        if (dayOffset > maxDay) maxDay = dayOffset;
      }
      const durationDays = maxDay + 1;
      const days = Object.entries(dayGroups).map(([dayOffset, ids]) => ({
        dayNumber: Number(dayOffset) + 1,
        destinationIds: ids,
        notes: '',
      }));

      // Compute end_date based on duration
      const startObj = new Date(startDate + 'T00:00:00');
      const endObj = new Date(startObj);
      endObj.setDate(endObj.getDate() + durationDays - 1);
      const endDateStr = endObj.toISOString().split('T')[0];

      const res = await trips.create({
        title: itinerary.title,
        start_date: startDate,
        end_date: endDateStr,
        duration_days: durationDays,
        days,
        status: 'draft',
      });
      if (res.status === 'success') {
        clearLocalItinerary(itinerary.id);
      }
    } catch {
      // If one fails, continue with others
    }
  }
}

// ─── ID Generator ────────────────────────────────────────────────────────────

/** Lightweight unique ID (no dependency needed) */
export function generateLocalId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
