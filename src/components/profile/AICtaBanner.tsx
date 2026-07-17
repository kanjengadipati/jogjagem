'use client';

import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AICtaBanner() {
  const router = useRouter();

  return (
    <div className="bg-[#F7F3EE] rounded-3xl border border-stone-200/60 px-6 py-5 flex items-center justify-between gap-4">
      {/* Left: illustration + text */}
      <div className="flex items-center gap-4">
        {/* Small map illustration */}
        <div className="relative w-12 h-12 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-stone-200 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-0.5 opacity-40">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded bg-stone-500" />
              ))}
            </div>
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-gold-400 flex items-center justify-center shadow">
            <MapPin className="w-3 h-3 text-white" />
          </div>
        </div>

        <div>
          <p className="font-manrope font-bold text-sm text-stone-950">Ready for your next adventure?</p>
          <p className="text-xs text-stone-400 mt-0.5">
            Let AI Assistant help you discover the best places in Jogja.
          </p>
        </div>
      </div>

      {/* CTA button */}
      <button
        onClick={() => router.push('/ai')}
        className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-stone-950 hover:bg-stone-800 text-white text-sm font-bold rounded-xl transition-all duration-200 whitespace-nowrap"
      >
        <Sparkles className="w-4 h-4" />
        Ask AI Assistant
      </button>
    </div>
  );
}
