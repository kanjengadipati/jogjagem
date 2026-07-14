import React from 'react';
import { Star, Heart } from 'lucide-react';
import { Destination } from '../types';
import { getPhotoCredit } from '../data';

interface DestinationCardProps {
  key?: string | number;
  destination: Destination;
  onExplore: (dest: Destination) => void;
  onToggleSave: (dest: Destination) => void;
  isSaved: boolean;
  className?: string;
}

// Define which destination IDs should be displayed in landscape orientation
export const LANDSCAPE_IDS = ['prambanan', 'merapi', 'gudeg-yudjum'];

export function isLandscape(id: string): boolean {
  return LANDSCAPE_IDS.includes(id);
}

// Map beautiful, contextual top badges to match mockup
const BADGE_MAP: Record<string, string> = {
  'prambanan': 'UNESCO',
  'parangtritis': 'Sunset Spot',
  'malioboro': 'Night Vibes',
  'tamansari': 'Heritage',
  'goajomblang': 'Hidden Gem',
  'merapi': 'Adventure',
  'gudeg-yudjum': 'Culinary',
  'sekaten': 'Limited',
  'artfestival': 'Popular',
  'wonosari': 'Live Tonight'
};

export default function DestinationCard({ destination, onExplore, onToggleSave, isSaved, className = '' }: DestinationCardProps) {
  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(destination);
  };

  const badgeText = BADGE_MAP[destination.id] || destination.category.replace('-', ' ').toUpperCase();
  const heightClass = 'h-[360px] sm:h-[400px]';

  return (
    <div
      id={`destination-card-${destination.id}`}
      onClick={() => onExplore(destination)}
      className={`group relative w-full overflow-hidden rounded-[24px] bg-royal-950 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer border border-gold-100/10 ${heightClass} ${className}`}
    >
      {/* Immersive Destination Thumbnail */}
      <img
        src={destination.images[0]}
        alt={destination.name}
        className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
        referrerPolicy="no-referrer"
      />
      
      {/* Ambient Overlay for text readability (Dark Gradient at bottom) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/100" />

      {/* Top-Left Badge (e.g. UNESCO, Sunset Spot) */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-sans font-semibold uppercase tracking-[0.08em] text-white">
        {badgeText}
      </div>

      {/* Bookmark Icon in the top right - clean outline white style */}
      <button
        id={`card-save-btn-${destination.id}`}
        onClick={handleToggleSave}
        className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transform active:scale-90 transition-all duration-300 border border-white/10"
      >
        <Heart 
          className={`h-4.5 w-4.5 transition-transform duration-300 ${
            isSaved ? 'fill-red-500 text-red-500 scale-110' : 'text-white/90 hover:scale-110'
          }`} 
        />
      </button>

      {/* Bottom overlay text details matching the mockup perfectly */}
      <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col justify-end text-left">
        <h3 className="font-manrope text-base sm:text-lg font-bold tracking-tight text-white leading-tight drop-shadow-sm group-hover:text-gold-300 transition-colors">
          {destination.name}
        </h3>
        
        <p className="text-xs text-white/70 font-light mt-1 mb-3.5 line-clamp-1">
          {destination.tagline}
        </p>

        {/* Bottom Row: Rating, Best Time, and Right Arrow Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Elegant Star Rating */}
            <div className="flex items-center space-x-1 text-xs font-semibold text-white bg-black/35 py-1 px-2.5 rounded-full border border-white/5">
              <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
              <span>{destination.rating.toFixed(1)}</span>
              <span className="text-[10px] text-white/55">({destination.reviewCount > 1000 ? (destination.reviewCount / 1000).toFixed(1) + 'k' : destination.reviewCount})</span>
            </div>

            {/* Best Time badge */}
            {destination.bestTime && (
              <div className="hidden xs:block text-[9px] font-sans font-semibold tracking-[0.08em] uppercase text-gold-400 bg-gold-450/10 border border-gold-400/20 px-2 py-1 rounded-full whitespace-nowrap">
                {destination.bestTime}
              </div>
            )}
          </div>

          {/* Gold Circle Arrow Button */}
          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-full bg-gold-400 text-royal-950 shadow-md group-hover:bg-gold-300 group-hover:scale-105 transition-all duration-300">
            <svg className="h-4 w-4 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Photo Credit */}
        <div className="mt-1.5">
          <span className="text-[9px] text-white/40 font-mono">
            Photo: {getPhotoCredit(destination.images[0])} / Unsplash
          </span>
        </div>
      </div>
    </div>
  );
}
