'use client';

import React, { useEffect, useState } from 'react';
import { Heart, ArrowRight, Star, Lock } from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { destinations as destinationsApi } from '../../lib/api';
import type { Destination } from '../../types';

interface WishlistSectionProps {
  userDestinations: { destination_slug: string; status: string }[];
}

export default function WishlistSection({ userDestinations }: WishlistSectionProps) {
  const router = useRouter();
  const [destMap, setDestMap] = useState<Record<string, Destination>>({});

  const wishlist = userDestinations.filter(
    (d) => d.status === 'saved' || d.status === 'wishlist'
  );

  useEffect(() => {
    destinationsApi.getAll().then((res) => {
      if (res.status === 'success' && res.data) {
        const map: Record<string, Destination> = {};
        (res.data as any[]).forEach((d) => {
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
        setDestMap(map);
      }
    });
  }, []);

  // Show up to 3 wishlist cards
  const displayed = wishlist.slice(0, 3);

  return (
    <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-stone-700" />
          <h3 className="font-manrope font-bold text-sm text-stone-950">Wishlist</h3>
        </div>
        <button
          onClick={() => router.push('/')}
          className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {wishlist.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-3">
            <Heart className="w-6 h-6 text-stone-300" />
          </div>
          <p className="text-xs font-semibold text-stone-400">No saved destinations yet</p>
          <button
            onClick={() => router.push('/')}
            className="mt-3 text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1"
          >
            Explore destinations <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 flex-1">
            {displayed.map((item) => {
              const dest = destMap[item.destination_slug];
              const imageUrl =
                dest?.images?.[0]?.url ||
                dest?.ogImageUrl ||
                `https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=400&h=300`;
              const name =
                dest?.name ||
                item.destination_slug
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase());
              const category = dest?.category || '';
              const subcategory = dest?.subRegion || '';
              const rating = dest?.rating ?? 0;

              return (
                <div
                  key={item.destination_slug}
                  className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  style={{ aspectRatio: '3/4' }}
                  onClick={() => router.push(`/destinations/${item.destination_slug}`)}
                >
                  <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Heart icon top right */}
                  <button className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
                    <Heart className="w-3.5 h-3.5 text-white fill-white" />
                  </button>

                  {/* Bottom info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2.5">
                    <p className="text-white font-bold text-xs leading-tight line-clamp-1">{name}</p>
                    {(category || subcategory) && (
                      <p className="text-white/70 text-[10px] mt-0.5 capitalize">
                        {[category, subcategory].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    {rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-2.5 h-2.5 text-gold-400 fill-gold-400" />
                        <span className="text-white text-[10px] font-semibold">{rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Locked placeholders if fewer than 3 */}
            {displayed.length < 3 &&
              Array.from({ length: 3 - displayed.length }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="rounded-2xl bg-stone-100 border-2 border-dashed border-stone-200 flex items-center justify-center"
                  style={{ aspectRatio: '3/4' }}
                >
                  <Lock className="w-5 h-5 text-stone-300" />
                </div>
              ))}
          </div>

          <button
            onClick={() => router.push('/')}
            className="mt-3 w-full py-2.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
          >
            Explore More Destinations
          </button>
        </>
      )}
    </div>
  );
}
