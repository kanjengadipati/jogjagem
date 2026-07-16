'use client';

import React, { useState } from 'react';
import { Check, MapPin, Share2, Compass, MessageSquare, Heart, CalendarDays, Pencil } from 'lucide-react';
import { type ProfileResponse } from '../../lib/api';

interface ProfileHeaderProps {
  profile: ProfileResponse;
  savedCount?: number;
  visitedCount?: number;
  tripsCount?: number;
  likesCount?: number;
  onShareProfile?: () => void;
}

export default function ProfileHeader({
  profile,
  savedCount = 0,
  tripsCount = 0,
  likesCount = 0,
  onShareProfile,
}: ProfileHeaderProps) {
  const [copied, setCopied] = useState(false);

  const level = Math.min(10, Math.max(1, Math.floor((profile.reviews_count || 0) / 3) + 1));
  const coverImage =
    profile.cover_image_url ||
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1400&h=400';

  const initials = profile.name
    ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : 'HH';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    onShareProfile?.();
  };

  const stats = [
    { icon: Compass,      label: 'Destinations\nSaved',  value: savedCount,                  color: 'text-violet-500',  bg: 'bg-violet-50'  },
    { icon: MessageSquare, label: 'Reviews\nWritten',     value: profile.reviews_count || 0,  color: 'text-amber-500',   bg: 'bg-amber-50'   },
    { icon: Heart,         label: 'Likes\nGiven',         value: likesCount,                  color: 'text-pink-500',    bg: 'bg-pink-50'    },
    { icon: CalendarDays,  label: 'Trips\nPlanned',       value: tripsCount,                  color: 'text-indigo-500',  bg: 'bg-indigo-50'  },
  ];

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200/60">
      {/* Cover Image */}
      <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-stone-200">
        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="px-5 sm:px-7 pb-6">
        {/* Avatar row */}
        <div className="flex items-end justify-between -mt-10 mb-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-white shadow-lg bg-stone-900 flex items-center justify-center overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-white font-manrope">{initials}</span>
              )}
            </div>
            {/* Edit badge */}
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-gold-500 border-2 border-white flex items-center justify-center shadow hover:bg-gold-400 transition-colors">
              <Pencil className="w-3 h-3 text-white" />
            </button>
          </div>

          {/* Share Profile button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-950 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            {copied ? 'Copied!' : 'Share Profile'}
          </button>
        </div>

        {/* Name + info */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="font-manrope text-xl sm:text-2xl font-bold text-stone-950 leading-tight">
              {profile.name}
            </h2>
            {profile.is_verified && (
              <div className="w-5 h-5 rounded-full bg-gold-500 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
            <span>Traveler</span>
            <span className="text-stone-300">•</span>
            <div className="flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-stone-400" />
              <span>Level {level} Explorer</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-stone-500">
            <MapPin className="w-3.5 h-3.5 text-stone-400" />
            <span>Yogyakarta, Indonesia</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 bg-stone-50 rounded-2xl px-4 py-3 border border-stone-100">
              <div className={`p-2 rounded-xl ${stat.bg} shrink-0`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <div className="text-lg font-bold text-stone-950 leading-none">{stat.value}</div>
                <div className="text-[10px] text-stone-400 font-medium leading-tight whitespace-pre-line mt-0.5">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
