'use client';

import React from 'react';
import { Award, Lock, ArrowRight } from 'lucide-react';

interface BadgesSectionProps {
  unlockedCount?: number;
  totalCount?: number;
}

const BADGE_SHAPES = [0, 1, 2, 3, 4, 5, 6, 7];

export default function BadgesSection({
  unlockedCount = 0,
  totalCount = 10,
}: BadgesSectionProps) {
  const progressPct = Math.min(100, (unlockedCount / totalCount) * 100);

  return (
    <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-stone-700" />
          <h3 className="font-manrope font-bold text-sm text-stone-950">Badges</h3>
        </div>
        <button className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Badge grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {BADGE_SHAPES.map((_, i) => {
          const unlocked = i < unlockedCount;
          return (
            <div
              key={i}
              className={`flex items-center justify-center aspect-square rounded-2xl border-2 transition-all ${
                unlocked
                  ? 'bg-gold-50 border-gold-200'
                  : 'bg-stone-100 border-stone-200'
              }`}
            >
              {unlocked ? (
                <Award className="w-6 h-6 text-gold-500" />
              ) : (
                <Lock className="w-4 h-4 text-stone-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Keep exploring hint */}
      <p className="text-xs text-stone-400 text-center mb-3">
        Keep exploring to unlock your badges!
      </p>

      {/* Progress bar */}
      <div className="mt-auto">
        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold-500 to-gold-400 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex justify-end mt-1">
          <span className="text-[10px] text-stone-400 font-mono">
            {unlockedCount} / {totalCount}
          </span>
        </div>
      </div>
    </div>
  );
}
