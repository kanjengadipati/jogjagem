import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Heart } from 'lucide-react';
import { Destination } from '../types';
import { useLocale } from '@/contexts/LocaleContext';

interface DestinationCardProps {
  key?: string | number;
  destination: Destination;
  onExplore: (dest: Destination) => void;
  onToggleSave: (dest: Destination) => void;
  onAuthRequired?: () => void;
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

export default React.memo(function DestinationCard({ 
  destination, onExplore, onToggleSave, onAuthRequired = () => {}, isSaved, 
  className = '' 
}: DestinationCardProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const { t } = useLocale();

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(destination);
  };

  const apiBadge = destination.badge;
  const rawBadgeText = apiBadge 
    ? t(`hero.badge_${apiBadge.toLowerCase().replace(/ /g, '_')}`) 
    : (BADGE_MAP[destination.id] || destination.category.replace('-', ' '));

  const badgeText = rawBadgeText.toUpperCase();

  const badgeKey = (apiBadge || BADGE_MAP[destination.id] || destination.category)
    .toLowerCase()
    .replace(/-/g, '_')
    .replace(/ /g, '_');

  const BADGE_STYLES: Record<string, string> = {
    'trending': 'bg-red-600/90 border border-red-500/30 text-white',
    'hidden_gem': 'bg-teal-600/90 border border-teal-500/30 text-white',
    'best_for_healing': 'bg-green-700/90 border border-green-600/30 text-white',
    'sunset_spot': 'bg-orange-500/90 border border-orange-400/30 text-white',
    'perfect_morning': 'bg-amber-500/90 border border-amber-400/30 text-white',
    'night_vibes': 'bg-indigo-600/90 border border-indigo-500/30 text-white',
    'cultural': 'bg-amber-700/90 border border-amber-600/30 text-white',
    'adventure': 'bg-red-600/90 border border-red-500/30 text-white',
    'instagramable': 'bg-pink-600/90 border border-pink-500/30 text-white',
    'unesco': 'bg-blue-700/90 border border-blue-600/30 text-white',
  };

  const badgeBgClass = BADGE_STYLES[badgeKey] || 'bg-black/40 backdrop-blur-md border border-white/10 text-white';

  const heightClass = 'h-[160px] sm:h-[360px] md:h-[400px]';
  const slug = destination.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <>
      <Link
        id={`destination-card-${destination.id}`}
        href={`/destinations/${slug}`}
        className={`group relative w-full overflow-hidden rounded-[24px] bg-stone-900 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer border border-stone-200/40 ${heightClass} ${className}`}
      >
        {/* Shimmer placeholder while image loads */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-stone-800 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_1.4s_infinite] -translate-x-full" />
          </div>
        )}

        {/* Immersive Destination Thumbnail */}
        {destination.images[0]?.url ? (
          <Image
            src={destination.images[0].url}
            alt={destination.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
          />
        ) : destination.ogImageUrl ? (
          <Image
            src={destination.ogImageUrl}
            alt={destination.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`h-full w-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            referrerPolicy="no-referrer"
            onLoad={() => setImgLoaded(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-royal-900 to-royal-950" />
        )}
        
        {/* Ambient Overlay for text readability (Dark Gradient at bottom) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/100" />

        {/* Top-Left Badge Container */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-2">
            <div className={`${badgeBgClass} px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-sans font-semibold uppercase tracking-[0.08em]`}>
                {badgeText}
            </div>
        </div>

        {/* Bookmark Icon */}
        <button
          id={`card-save-btn-${destination.id}`}
          onClick={handleToggleSave}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-sm transform active:scale-90 transition-all duration-300 border border-white/10"
        >
          <Heart className={`h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 transition-transform duration-300 ${isSaved ? 'fill-red-500 text-red-500 scale-110' : 'text-white/90 hover:scale-110'}`} />
        </button>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 inset-x-0 p-2.5 sm:p-5 flex flex-col justify-end text-left">
          <h3 className="font-manrope text-[11px] sm:text-base md:text-lg font-bold tracking-tight text-white leading-tight drop-shadow-sm group-hover:text-gold-300 transition-colors line-clamp-2">
            {destination.name}
          </h3>

          <p className="hidden sm:block text-xs text-white/70 font-light mt-1 mb-3.5 line-clamp-1">
            {destination.tagline}
          </p>

          {/* Bottom Row */}
          <div className="flex items-center justify-between mt-1 sm:mt-0">
            <div className="flex items-center space-x-1 text-[9px] sm:text-xs font-semibold text-white bg-black/35 py-0.5 sm:py-1 px-1.5 sm:px-2.5 rounded-full border border-white/5">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-gold-400 text-gold-400" />
              <span>{destination.rating.toFixed(1)}</span>
            </div>
              {destination.bestTime && (
                <div className="hidden xs:block text-[9px] font-sans font-semibold tracking-[0.08em] uppercase text-gold-400 bg-gold-450/10 border border-gold-400/20 px-2 py-1 rounded-full whitespace-nowrap">
                  {destination.bestTime}
                </div>
              )}


            {/* Gold Circle Arrow — hidden on mobile for space */}
            <div className="hidden sm:flex h-7 w-7 items-center justify-center rounded-full bg-gold-400 text-royal-950 shadow-md group-hover:bg-gold-300 group-hover:scale-105 transition-all duration-300">
              <svg className="h-3.5 w-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Photo Credit — hidden on mobile */}
          <div className="hidden sm:block mt-1.5">
            <span className="text-[9px] text-white/40 font-mono">
              {t('common.photo')} {destination.images[0]?.credit || 'Unsplash'} / Unsplash
            </span>
          </div>
        </div>
      </Link>
    </>
  );
});
