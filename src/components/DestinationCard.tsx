import React, { useState } from 'react';
import { Star, Heart, Flag } from 'lucide-react';
import { Destination } from '../types';
import { auth } from '../lib/api';
import ReportModal from './ReportModal';

interface DestinationCardProps {
  key?: string | number;
  destination: Destination;
  onExplore: (dest: Destination) => void;
  onToggleSave: (dest: Destination) => void;
  onAuthRequired?: () => void;
  isSaved: boolean;
  isReportPending?: boolean;
  onClearPendingReport?: () => void;
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

export default function DestinationCard({ 
  destination, onExplore, onToggleSave, onAuthRequired = () => {}, isSaved, 
  isReportPending = false, onClearPendingReport = () => {}, className = '' 
}: DestinationCardProps) {
  const [reportOpen, setReportOpen] = useState(false);

  React.useEffect(() => {
    if (isReportPending) {
      setReportOpen(true);
      onClearPendingReport();
    }
  }, [isReportPending, onClearPendingReport]);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleSave(destination);
  };

  const handleReport = async (reason: string, details: string) => {
    try {
      await auth.reportDestinationImage(destination.id, reason, details);
      alert('Terima kasih atas laporannya.');
    } catch {
      alert('Gagal mengirim laporan.');
    }
  };

  const handleReportOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!auth.isLoggedIn()) {
      sessionStorage.setItem('pending_report', destination.id);
      onAuthRequired();
      return;
    }
    setReportOpen(true);
  };

  const badgeText = BADGE_MAP[destination.id] || destination.category.replace('-', ' ').toUpperCase();
  const heightClass = 'h-[160px] sm:h-[360px] md:h-[400px]';

  return (
    <>
      <ReportModal isOpen={reportOpen} onClose={() => setReportOpen(false)} destinationId={destination.id} onReport={handleReport} />

      <div
        id={`destination-card-${destination.id}`}
        onClick={() => onExplore(destination)}
        className={`group relative w-full overflow-hidden rounded-[24px] bg-[#FCFAF8] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer border border-stone-200/40 ${heightClass} ${className}`}
      >
        {/* Immersive Destination Thumbnail */}
        <img
          src={destination.images[0]?.url || ''}
          alt={destination.name}
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-108"
          referrerPolicy="no-referrer"
        />
        
        {/* Ambient Overlay for text readability (Dark Gradient at bottom) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent transition-opacity duration-300 group-hover:from-black/100" />

        {/* Top-Left Badge Container */}
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex items-center gap-2">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-sans font-semibold uppercase tracking-[0.08em] text-white">
                {badgeText}
            </div>
            {/* Report Button */}
            <button
                onClick={handleReportOpen}
                className="p-1.5 rounded-full bg-black/20 hover:bg-red-500 text-white backdrop-blur-sm transition-all"
                title="Laporkan gambar"
            >
                <Flag className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            </button>
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
              Photo: {destination.images[0]?.credit || 'Unsplash'} / Unsplash
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
