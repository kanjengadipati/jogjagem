import React from 'react';
import { Check, Compass, MessageSquare, Heart, CalendarDays, Award } from 'lucide-react';
import { type ProfileResponse } from '../../lib/api';

interface ProfileHeaderProps {
  profile: ProfileResponse;
}

export default function ProfileHeader({ profile }: ProfileHeaderProps) {
  const title = profile.role === 'superadmin' || profile.role === 'admin' ? 'Platform Administrator' : 'Traveler';
  const avatar = profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.name || 'A')}&backgroundColor=1c1a17`;
  const coverImage = profile.cover_image_url || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&q=80&w=1200&h=400';
  const level = Math.min(10, Math.max(1, Math.floor((profile.reviews_count || 0) / 3) + 1));

  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-sm">
      <div className="relative h-48 w-full overflow-hidden bg-stone-200">
        <img
          src={coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="px-6 pb-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-stone-100">
              <img
                src={avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:mb-3">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="font-manrope text-2xl font-bold text-royal-950">
                  {profile.name}
                </h2>
                {profile.is_verified && (
                  <div className="w-5 h-5 rounded-full bg-gold-600 flex items-center justify-center text-white">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>
              <p className="text-sm font-medium text-stone-500">
                {title} • <Award className="w-3.5 h-3.5 inline text-gold-500 mr-1" />Level {level} Explorer
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
          {[
            { label: 'Reviews', value: profile.reviews_count || 0, icon: MessageSquare, color: 'text-amber-600' },
            { label: 'Email Verified', value: profile.email_verified ? 'Yes' : 'No', icon: Compass, color: 'text-indigo-600' },
            { label: 'Phone Verified', value: profile.phone_verified ? 'Yes' : 'No', icon: CalendarDays, color: 'text-violet-600' },
          ].map((stat, i) => (
            <div key={i} className="flex items-center gap-3 justify-center sm:justify-start">
              <div className={`p-2 bg-white rounded-lg border ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-lg text-royal-950">{stat.value}</div>
                <div className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
