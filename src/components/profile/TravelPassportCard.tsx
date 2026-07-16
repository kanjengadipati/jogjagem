import React from 'react';
import { Award, Compass, Globe, Calendar, Star } from 'lucide-react';
import { type ProfileResponse } from '../../lib/api';

interface TravelPassportCardProps {
  profile: ProfileResponse;
}

export default function TravelPassportCard({ profile }: TravelPassportCardProps) {
  // Static placeholder logic for now
  const level = Math.min(10, Math.max(1, Math.floor((profile.reviews_count || 0) / 3) + 1));
  const xp = (profile.reviews_count || 0) * 150;
  const maxXp = level * 1000;
  const xpPercentage = Math.min(100, (xp / maxXp) * 100);

  return (
    <div className="bg-gradient-to-br from-royal-950 via-stone-900 to-royal-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-gold-900/50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(203,133,39,0.15),transparent)] pointer-events-none" />

      <div className="flex items-center gap-2 mb-6 relative">
        <div className="w-8 h-8 rounded-lg bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center">
          <Award className="w-5 h-5" />
        </div>
        <h3 className="font-display font-bold text-lg tracking-wide">
          Travel Passport
        </h3>
      </div>

      <div className="mb-6 space-y-2 relative">
        <div className="flex justify-between items-end text-xs">
          <span className="font-semibold text-gold-300 uppercase tracking-widest text-[10px]">
            Explorer Level {level}
          </span>
          <span className="font-mono text-gold-200 font-semibold text-[11px]">
            {xp.toLocaleString()} / {maxXp.toLocaleString()} XP
          </span>
        </div>

        <div className="w-full h-3.5 bg-stone-800/80 rounded-full overflow-hidden p-0.5 border border-stone-700/30">
          <div
            className="h-full bg-gradient-to-r from-gold-600 to-gold-400 rounded-full shadow-md shadow-gold-500/50 transition-all duration-1000 ease-out"
            style={{ width: `${xpPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 py-4 border-y border-stone-800/80 mb-5 text-sm">
        <div>
          <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-0.5">
            Country
          </span>
          <div className="flex items-center gap-1.5 font-semibold text-stone-200">
            <Globe className="w-4 h-4 text-gold-400 shrink-0" />
            <span>Indonesia</span>
          </div>
        </div>
        <div>
          <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-0.5">
            Member Since
          </span>
          <div className="flex items-center gap-1.5 font-semibold text-stone-200">
            <Calendar className="w-4 h-4 text-gold-400 shrink-0" />
            <span>May 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
