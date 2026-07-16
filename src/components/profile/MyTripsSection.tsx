'use client';

import React from 'react';
import { CalendarDays, MapPin, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function MyTripsSection() {
  const router = useRouter();

  return (
    <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-stone-700" />
          <h3 className="font-manrope font-bold text-sm text-stone-950">My Trips</h3>
        </div>
        <button
          onClick={() => router.push('/?tab=planner')}
          className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors"
        >
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Empty state */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
        {/* Illustration */}
        <div className="relative w-24 h-20 mb-4">
          {/* Map background */}
          <div className="w-24 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1 opacity-30">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-4 h-3 rounded bg-stone-400" />
              ))}
            </div>
          </div>
          {/* Pin overlay */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
            <div className="w-8 h-8 rounded-full bg-gold-100 border-2 border-white shadow flex items-center justify-center">
              <MapPin className="w-4 h-4 text-gold-500" />
            </div>
          </div>
          {/* Bag icon */}
          <div className="absolute -bottom-1 right-0 w-7 h-7 rounded-xl bg-stone-200 border-2 border-white shadow flex items-center justify-center">
            <CalendarDays className="w-3.5 h-3.5 text-stone-500" />
          </div>
        </div>

        <p className="text-sm font-semibold text-stone-700 mb-1">No trips planned yet</p>
        <p className="text-xs text-stone-400 mb-4 max-w-[160px] leading-relaxed">
          Start planning your next adventure with Trip Planner.
        </p>
        <button
          onClick={() => router.push('/?tab=planner')}
          className="px-5 py-2 bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all duration-200"
        >
          Plan a Trip
        </button>
      </div>
    </div>
  );
}
