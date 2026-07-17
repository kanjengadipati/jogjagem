'use client';

import React from 'react';
import { Award, Globe, Calendar, Zap } from 'lucide-react';
import { type ProfileResponse } from '../../lib/api';

interface TravelPassportCardProps {
  profile: ProfileResponse;
}

const levelNames: Record<number, string> = {
  1: 'Curious Wanderer',
  2: 'Day Tripper',
  3: 'Weekend Explorer',
  4: 'Trail Seeker',
  5: 'Culture Hunter',
  6: 'Roaming Nomad',
  7: 'Hidden Gem Finder',
  8: 'Local Whisperer',
  9: 'Legend Traveler',
  10: 'Grand Explorer',
};

export default function TravelPassportCard({ profile }: TravelPassportCardProps) {
  const level = Math.min(10, Math.max(1, Math.floor((profile.reviews_count || 0) / 3) + 1));
  const xp = (profile.reviews_count || 0) * 150;
  const maxXp = level * 1000;
  const xpPercentage = Math.min(100, (xp / maxXp) * 100);
  const levelName = levelNames[level] || 'Explorer';

  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'Unknown';

  return (
    <div className="relative bg-gradient-to-br from-royal-950 via-royal-900 to-stone-900 text-white rounded-3xl p-6 shadow-2xl overflow-hidden border border-white/5">
      {/* Decorative blobs */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-gold-500/5 blur-3xl pointer-events-none" />

      {/* Batik-inspired decorative pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" stroke="#cb8527" strokeWidth="1"/>
          <circle cx="50" cy="50" r="30" stroke="#cb8527" strokeWidth="0.5"/>
          <circle cx="50" cy="50" r="15" stroke="#cb8527" strokeWidth="0.5"/>
          <path d="M5 50 Q25 25 50 5 Q75 25 95 50 Q75 75 50 95 Q25 75 5 50Z" stroke="#cb8527" strokeWidth="0.5" fill="none"/>
        </svg>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 relative">
        <div className="w-9 h-9 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
          <Award className="w-5 h-5 text-gold-400" />
        </div>
        <div>
          <h3 className="font-manrope font-bold text-base tracking-wide text-white">Travel Passport</h3>
          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Explore Jogja</p>
        </div>
      </div>

      {/* Level display */}
      <div className="mb-5 relative">
        <div className="flex items-end justify-between mb-2">
          <div>
            <div className="text-[10px] font-bold text-gold-400 uppercase tracking-widest mb-0.5">Rank</div>
            <div className="text-xl font-bold text-white leading-none">{levelName}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-0.5">Level</div>
            <div className="text-4xl font-black text-gold-400 leading-none">{level}</div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] text-stone-500 mb-1.5">
            <span>XP Progress</span>
            <span className="font-mono text-gold-400 font-semibold">{xp.toLocaleString()} / {maxXp.toLocaleString()}</span>
          </div>
          <div className="h-2.5 bg-stone-800 rounded-full overflow-hidden border border-stone-700/40">
            <div
              className="h-full bg-gradient-to-r from-gold-600 via-gold-400 to-gold-300 rounded-full shadow-lg shadow-gold-500/30 transition-all duration-1000 ease-out"
              style={{ width: `${xpPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-stone-800/60 my-4" />

      {/* Meta info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Globe className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Country</span>
          </div>
          <span className="text-sm font-semibold text-stone-200">Indonesia</span>
        </div>
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Calendar className="w-3.5 h-3.5 text-gold-500" />
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest">Joined</span>
          </div>
          <span className="text-sm font-semibold text-stone-200">{joinDate}</span>
        </div>
      </div>

      {/* XP earn hint */}
      <div className="mt-4 flex items-center gap-2 px-3 py-2.5 bg-gold-500/10 rounded-xl border border-gold-500/20">
        <Zap className="w-4 h-4 text-gold-400 shrink-0" />
        <p className="text-[11px] text-gold-300 leading-snug">
          Write a review to earn <span className="font-bold text-gold-200">150 XP</span> and level up!
        </p>
      </div>
    </div>
  );
}
