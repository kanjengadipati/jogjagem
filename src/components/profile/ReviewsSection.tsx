'use client';

import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, MapPin } from 'lucide-react';
import Image from 'next/image';
import { type BeReview, destinations as destinationsApi } from '../../lib/api';
import type { Destination } from '../../types';

interface ReviewsSectionProps {
  reviews: BeReview[];
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'text-gold-500 fill-gold-400' : 'text-stone-200 fill-stone-100'}`}
        />
      ))}
    </div>
  );
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const [destMap, setDestMap] = useState<Record<string, Destination>>({});

  useEffect(() => {
    if (reviews.length === 0) return;

    destinationsApi.getAll().then((res) => {
      if (res.status === 'success' && res.data) {
        const raw = res.data as any[];
        const map: Record<string, Destination> = {};
        raw.forEach((d) => {
          // index by both id and slug so we can match either
          const dest: Destination = {
            ...d,
            subRegion: d.sub_region || d.subRegion || '',
            ticketPrice: d.ticket_price || d.ticketPrice || '',
            openingHours: d.opening_hours || d.openingHours || '',
            reviewCount: d.review_count || d.reviewCount || 0,
            travelTips: d.travel_tips || d.travelTips || [],
            bestTime: d.best_time || d.bestTime || '',
            googleMapsUrl: d.google_maps_url || d.googleMapsUrl || '',
          };
          if (d.id) map[String(d.id)] = dest;
          if (d.slug) map[String(d.slug)] = dest;
        });
        setDestMap(map);
      }
    });
  }, [reviews]);

  function resolveDestination(rev: BeReview): Destination | undefined {
    return (
      destMap[String(rev.destination_id)] ||
      // fallback: try matching by slug built from destination_id
      undefined
    );
  }

  return (
    <div className="bg-white border border-stone-200/50 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 rounded-xl">
            <MessageSquare className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="font-manrope font-bold text-base text-royal-950">My Reviews</h3>
          {reviews.length > 0 && (
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
              {reviews.length}
            </span>
          )}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mb-3">
            <MessageSquare className="w-7 h-7 text-stone-300" />
          </div>
          <p className="text-sm font-semibold text-stone-400">No reviews yet</p>
          <p className="text-xs text-stone-300 mt-1">Visit a destination and share your experience!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((rev) => {
            const dest = resolveDestination(rev);
            const imageUrl = dest?.images?.[0]?.url || dest?.ogImageUrl || null;
            const displayName = dest?.name ||
              String(rev.destination_id)
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (c) => c.toUpperCase());

            return (
              <div
                key={rev.id}
                className="flex gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-gold-200 hover:bg-gold-50/30 transition-all duration-200"
              >
                {/* Destination thumbnail */}
                {imageUrl ? (
                  <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-stone-200">
                    <Image
                      src={imageUrl}
                      alt={displayName}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 shrink-0 rounded-xl bg-stone-200 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-stone-400" />
                  </div>
                )}

                {/* Review content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="w-3 h-3 text-gold-500 shrink-0" />
                      <h4 className="font-semibold text-sm text-royal-950 truncate">{displayName}</h4>
                    </div>
                    <StarRating rating={rev.rating} />
                  </div>
                  {rev.comment && (
                    <p className="text-xs text-stone-500 leading-relaxed line-clamp-2">{rev.comment}</p>
                  )}
                  {rev.traveler_type && (
                    <span className="inline-block mt-2 text-[10px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      {rev.traveler_type}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
