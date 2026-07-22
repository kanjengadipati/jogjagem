'use client';

import React, { useEffect, useState } from 'react';
import { Eye, Star, ArrowRight } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { destinations as destinationsApi } from '../../lib/api';
import type { Destination } from '../../types';

const STORAGE_KEY = 'pleco_recently_viewed';

export function trackRecentlyViewed(destinationId: string) {
  if (typeof window === 'undefined') return;
  try {
    const existing: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const updated = [destinationId, ...existing.filter((id) => id !== destinationId)].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export default function RecentlyViewedSection() {
  const router = useRouter();
  const [items, setItems] = useState<Destination[]>([]);

  useEffect(() => {
    let ids: string[] = [];
    try {
      ids = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
      ids = [];
    }

    if (ids.length === 0) return;

    destinationsApi.getAll().then((res) => {
      if (res.status === 'success' && res.data) {
        const all = res.data as any[];
        const map: Record<string, Destination> = {};
        all.forEach((d) => {
          map[String(d.id)] = {
            ...d,
            subRegion: d.sub_region || d.subRegion || '',
            ticketPrice: d.ticket_price || d.ticketPrice || '',
            openingHours: d.opening_hours || d.openingHours || '',
            reviewCount: d.review_count || d.reviewCount || 0,
            travelTips: d.travel_tips || d.travelTips || [],
            bestTime: d.best_time || d.bestTime || '',
          };
        });

        const recent = ids
          .map((id) => map[id])
          .filter(Boolean)
          .slice(0, 4);

        // If no recently viewed, fall back to first 4 destinations
        if (recent.length === 0) {
          setItems(
            all.slice(0, 4).map((d) => ({
              ...d,
              subRegion: d.sub_region || d.subRegion || '',
              ticketPrice: d.ticket_price || d.ticketPrice || '',
              openingHours: d.opening_hours || d.openingHours || '',
              reviewCount: d.review_count || d.reviewCount || 0,
              travelTips: d.travel_tips || d.travelTips || [],
              bestTime: d.best_time || d.bestTime || '',
            }))
          );
        } else {
          setItems(recent);
        }
      }
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-stone-700" />
          <h3 className="font-manrope font-bold text-sm text-stone-950">Recently Viewed</h3>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-xs font-semibold text-stone-500 hover:text-stone-700 transition-colors"
        >
          View All
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {items.map((dest) => {
          const imageUrl =
            dest.images?.[0]?.url ||
            dest.ogImageUrl ||
            'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=400&h=300';
          const category = dest.category || '';
          const subcategory = dest.subRegion || '';

          return (
            <div
              key={dest.id}
              onClick={() => router.push(`/destinations/${dest.id}`)}
              className="cursor-pointer group"
            >
              {/* Image card */}
              <div className="relative rounded-2xl overflow-hidden mb-2" style={{ aspectRatio: '4/3' }}>
                <img
                  src={imageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Lock icon overlay (visited indicator placeholder) */}
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
                  <Eye className="w-3 h-3 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                {/* Bottom text overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-[10px] font-semibold capitalize line-clamp-1">
                    {[category, subcategory].filter(Boolean).join(' • ')}
                  </p>
                </div>
              </div>

              {/* Name + rating below card */}
              <p className="text-xs font-bold text-stone-900 line-clamp-1">{dest.name}</p>
              {(dest.category || dest.subRegion) && (
                <p className="text-[10px] text-stone-400 capitalize mt-0.5">
                  {[dest.category, dest.subRegion].filter(Boolean).join(' • ')}
                </p>
              )}
              {dest.rating > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-gold-400 fill-gold-400" />
                  <span className="text-[11px] font-semibold text-stone-700">{dest.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
