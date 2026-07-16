'use client';

import React from 'react';
import { BarChart3, Compass, MessageSquare, Heart, CalendarDays, ArrowRight } from 'lucide-react';

interface TravelStatisticsCardProps {
  reviewsCount: number;
  savedCount?: number;
  likesCount?: number;
  tripsCount?: number;
}

export default function TravelStatisticsCard({
  reviewsCount,
  savedCount = 0,
  likesCount = 0,
  tripsCount = 0,
}: TravelStatisticsCardProps) {
  const stats = [
    { icon: Compass,       label: 'Destinations Saved', value: savedCount,   color: 'text-violet-500', bg: 'bg-violet-50' },
    { icon: MessageSquare, label: 'Reviews Written',     value: reviewsCount, color: 'text-amber-500',  bg: 'bg-amber-50'  },
    { icon: Heart,         label: 'Likes Given',         value: likesCount,   color: 'text-pink-500',   bg: 'bg-pink-50'   },
    { icon: CalendarDays,  label: 'Trips Planned',       value: tripsCount,   color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-stone-700" />
          <h3 className="font-manrope font-bold text-sm text-stone-950">Travel Statistics</h3>
        </div>
        <button className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-2 flex-1">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 border-b border-stone-100 last:border-0">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
              </div>
              <span className="text-sm text-stone-600 font-medium">{stat.label}</span>
            </div>
            <span className="text-sm font-bold text-stone-950">{stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
