import React from 'react';
import Image from 'next/image';
import { Sparkles, Bookmark, Star, X, ArrowRight } from 'lucide-react';
import { Destination } from '../types';
import { useLocale } from '@/contexts/LocaleContext';

export interface AIPickCardProps {
  recommendation: {
    dest: Destination;
    headline?: string;
    reason?: string;
    crowd?: string;
  };
  isSaved: (id: string) => boolean;
  onToggleSave: (dest: Destination) => void;
  onExplore: (dest: Destination) => void;
  onDismiss?: () => void;
  className?: string;
  sizes?: string;
}

export function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function getCtaText(destName: string, category: string, t: (key: string) => string): string {
  const hour = new Date().getHours();
  const firstName = destName.split(' ')[0];
  if (category === 'adventure' || category === 'nature') {
    if (hour < 11) return t('hero.cta_adventure_morning').replace('{name}', firstName);
    if (hour < 15) return t('hero.cta_adventure_afternoon').replace('{name}', firstName);
    return t('hero.cta_adventure_evening').replace('{name}', firstName);
  }
  if (category === 'heritage' || category === 'culture') {
    if (hour < 11) return t('hero.cta_culture_morning').replace('{name}', firstName);
    if (hour < 17) return t('hero.cta_culture_afternoon').replace('{name}', firstName);
    return t('hero.cta_culture_evening').replace('{name}', firstName);
  }
  if (category === 'beach') {
    if (hour < 15) return t('hero.cta_beach_day').replace('{name}', firstName);
    return t('hero.cta_beach_sunset').replace('{name}', firstName);
  }
  if (category === 'hidden-gem') return t('hero.cta_hidden_gem').replace('{name}', firstName);
  if (hour < 11) return t('hero.cta_generic_morning').replace('{name}', firstName);
  if (hour < 17) return t('hero.cta_generic_afternoon').replace('{name}', firstName);
  return t('hero.cta_generic_evening').replace('{name}', firstName);
}

function getShortName(destName: string): string {
  const words = destName.split(' ');
  if (words.length > 1 && (
    words[0].toLowerCase() === 'pantai' || 
    words[0].toLowerCase() === 'candi' || 
    words[0].toLowerCase() === 'goa' || 
    words[0].toLowerCase() === 'gunung'
  )) {
    return words[1];
  }
  return words[0];
}

function getShortCtaText(destName: string, category: string, locale: string): string {
  const shortName = getShortName(destName);
  const isId = locale === 'id';
  if (category === 'adventure' || category === 'nature') {
    return isId ? `Jelajahi ${shortName}` : `Explore ${shortName}`;
  }
  if (category === 'heritage' || category === 'culture') {
    return isId ? `Wisata ${shortName}` : `Visit ${shortName}`;
  }
  if (category === 'beach') {
    return isId ? `Pantai ${shortName}` : `Enjoy ${shortName}`;
  }
  return isId ? `Kunjungi ${shortName}` : `Visit ${shortName}`;
}

export const AIPickCard: React.FC<AIPickCardProps> = ({
  recommendation,
  isSaved,
  onToggleSave,
  onExplore,
  onDismiss,
  className = '',
  sizes = '200px',
}) => {
  const { dest, reason } = recommendation;
  const img = dest.images?.[0]?.url || dest.ogImageUrl || '';
  const saved = isSaved(dest.id);
  const { t, locale } = useLocale();

  const fullCta = getCtaText(dest.name, dest.category, t);
  const shortCta = getShortCtaText(dest.name, dest.category, locale);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onExplore(dest)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onExplore(dest);
        }
      }}
      className={`aspect-[2/3] rounded-2xl overflow-hidden border border-gold-500/40 shadow-2xl shadow-black/60 cursor-pointer transition-transform active:scale-95 duration-200 select-none ${className}`}
    >
      {img && (
        <Image
          src={img}
          alt={dest.name}
          fill
          sizes={sizes}
          className="object-cover object-center"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/85" />
      
      <div className="relative z-10 flex flex-col h-full px-3 pt-3 pb-3">
        {/* Top bar: Badge & Dismiss button */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-gold-400 shrink-0" />
            <span className="text-[8.5px] font-extrabold tracking-widest uppercase text-gold-400">
              JOGJAGEM'S PICK
            </span>
          </div>
          {onDismiss && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
              className="p-1 hover:bg-white/10 rounded-full transition-colors relative z-20"
              aria-label="Dismiss recommendation"
            >
              <X className="h-3.5 w-3.5 text-white/70 hover:text-white" />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[12px] sm:text-[13px] font-extrabold text-white leading-tight mb-0.5 line-clamp-1 drop-shadow">
          {dest.name}
        </h3>

        {/* Reason / tagline */}
        <p className="text-[9px] text-white/75 leading-relaxed line-clamp-3 font-light drop-shadow">
          {reason || dest.tagline}
        </p>

        {/* Bottom meta: location + rating */}
        <div className="flex items-center justify-between mt-auto text-[9px] mb-2">
          <span className="flex items-center gap-0.5 text-white/60 truncate max-w-[100px]">
            <span>📍</span>
            <span className="truncate">{dest.subRegion || dest.location}</span>
          </span>
          <span className="flex items-center gap-0.5 font-bold text-gold-400 shrink-0">
            <Star className="h-2.5 w-2.5 fill-gold-400" />
            {dest.rating?.toFixed(1) ?? '4.9'}
          </span>
        </div>

        {/* Actions Row: Save + Explore */}
        <div className="relative z-20 flex items-center gap-1.5">
          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(dest);
            }}
            className="h-7 w-7 flex items-center justify-center bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 rounded-xl transition-all shrink-0 cursor-pointer"
            aria-label={saved ? 'Remove bookmark' : 'Bookmark destination'}
          >
            <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-gold-400 text-gold-400' : 'text-white/70 hover:text-white'}`} />
          </button>

          {/* Explore Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExplore(dest);
            }}
            className="group/btn flex-1 h-7 bg-gold-500 hover:bg-gold-400 active:scale-95 font-bold text-[9.5px] text-white rounded-xl transition-all shadow-lg shadow-gold-500/40 cursor-pointer flex items-center justify-center gap-1 px-2.5 min-w-0 overflow-hidden"
            title={fullCta}
          >
            {/* Desktop text (slightly transitions on hover) */}
            <span className="hidden md:inline truncate transition-transform duration-300 md:group-hover/btn:-translate-x-0.5">
              {fullCta}
            </span>

            {/* Mobile text (shortened, no transition since mobile has no pointer hover) */}
            <span className="inline md:hidden truncate">
              {shortCta}
            </span>

            {/* Arrow icon (slides right on hover only on desktop) */}
            <ArrowRight className="h-3 w-3 shrink-0 transition-transform duration-300 md:group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
