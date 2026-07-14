import React from 'react';
import { Camera, Check, Edit3, Compass, Award, Heart, MessageSquare, CalendarDays } from 'lucide-react';

interface Profile {
  name: string;
  title: string;
  avatar: string;
  coverImage: string;
  level: number;
  bio?: string;
  destinationsCount: number;
  reviewsCount: number;
  likesCount: number;
  tripsCount: number;
}

interface ProfileHeaderProps {
  profile: Profile;
  onEditProfile: () => void;
}

export default function ProfileHeader({
  profile,
  onEditProfile
}: ProfileHeaderProps) {
  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden shadow-sm">
      <div className="relative h-48 w-full overflow-hidden bg-stone-200">
        <img
          src={profile.coverImage}
          alt="Cover"
          className="w-full h-full object-cover"
        />
        <button
          onClick={onEditProfile}
          className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      <div className="px-6 pb-6 pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            <div className="relative w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden bg-stone-100">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={onEditProfile}
                className="absolute bottom-1 right-1 bg-gold-600 text-white p-2 rounded-full shadow-md"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            <div className="md:mb-3">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="font-manrope text-2xl font-bold text-royal-950">
                  {profile.name}
                </h2>
                <div className="w-5 h-5 rounded-full bg-gold-600 flex items-center justify-center text-white">
                  <Check className="w-3 h-3" />
                </div>
              </div>
              <p className="text-sm font-medium text-stone-500">
                {profile.title} • <Award className="w-3.5 h-3.5 inline text-gold-500 mr-1" />Level {profile.level} Explorer
              </p>
            </div>
          </div>

          <button
            onClick={onEditProfile}
            className="flex items-center justify-center gap-2 bg-royal-950 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-royal-900 transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50 p-4 rounded-xl border border-stone-100">
          {[
            { label: 'Destinations', value: profile.destinationsCount, icon: Compass, color: 'text-indigo-600' },
            { label: 'Reviews', value: profile.reviewsCount, icon: MessageSquare, color: 'text-amber-600' },
            { label: 'Likes', value: profile.likesCount, icon: Heart, color: 'text-rose-600' },
            { label: 'Trips', value: profile.tripsCount, icon: CalendarDays, color: 'text-violet-600' },
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
