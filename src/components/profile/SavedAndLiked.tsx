'use client';

import React from 'react';
import { Bookmark, Camera, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SavedAndLikedProps {
  userDestinations: { destination_slug: string; status: string }[];
}

export default function SavedAndLiked({ userDestinations }: SavedAndLikedProps) {
  const saved = userDestinations.filter((d) => d.status === 'saved' || d.status === 'wishlist');
  const visited = userDestinations.filter((d) => d.status === 'visited');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Wishlist */}
      <div className="bg-white border border-stone-200/50 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-violet-50 rounded-xl">
              <Bookmark className="w-4 h-4 text-violet-500" />
            </div>
            <h3 className="font-manrope font-bold text-sm text-royal-950">Wishlist</h3>
            <span className="text-xs font-bold text-violet-600 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">
              {saved.length}
            </span>
          </div>
        </div>

        {saved.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center mb-2">
              <Bookmark className="w-5 h-5 text-stone-300" />
            </div>
            <p className="text-xs text-stone-400 font-medium">Nothing saved yet</p>
            <Link href="/" className="text-xs text-gold-600 hover:text-gold-700 font-semibold mt-2 flex items-center gap-1 transition-colors">
              Explore destinations <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {saved.slice(0, 5).map((item) => (
              <li key={item.destination_slug}>
                <Link
                  href={`/destinations/${item.destination_slug}`}
                  className="flex items-center gap-2.5 p-2.5 bg-stone-50 hover:bg-violet-50 border border-stone-100 hover:border-violet-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
                    <Bookmark className="w-3.5 h-3.5 text-violet-500" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700 group-hover:text-royal-950 capitalize truncate">
                    {item.destination_slug.replace(/-/g, ' ')}
                  </span>
                </Link>
              </li>
            ))}
            {saved.length > 5 && (
              <li className="text-xs text-stone-400 font-medium text-center pt-1">
                +{saved.length - 5} more destinations
              </li>
            )}
          </ul>
        )}
      </div>

      {/* Visited */}
      <div className="bg-white border border-stone-200/50 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-50 rounded-xl">
              <Camera className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-manrope font-bold text-sm text-royal-950">Visited</h3>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              {visited.length}
            </span>
          </div>
        </div>

        {visited.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center mb-2">
              <Camera className="w-5 h-5 text-stone-300" />
            </div>
            <p className="text-xs text-stone-400 font-medium">No visits logged yet</p>
            <Link href="/" className="text-xs text-gold-600 hover:text-gold-700 font-semibold mt-2 flex items-center gap-1 transition-colors">
              Find places to visit <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : (
          <ul className="space-y-2">
            {visited.slice(0, 5).map((item) => (
              <li key={item.destination_slug}>
                <Link
                  href={`/destinations/${item.destination_slug}`}
                  className="flex items-center gap-2.5 p-2.5 bg-stone-50 hover:bg-emerald-50 border border-stone-100 hover:border-emerald-200 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-xs font-semibold text-stone-700 group-hover:text-royal-950 capitalize truncate">
                    {item.destination_slug.replace(/-/g, ' ')}
                  </span>
                </Link>
              </li>
            ))}
            {visited.length > 5 && (
              <li className="text-xs text-stone-400 font-medium text-center pt-1">
                +{visited.length - 5} more destinations
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
