'use client';

import React from 'react';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

interface MobileOverlayNavProps {
  onBack: () => void;
  title?: string;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onShare?: () => void;
  copiedToast?: boolean;
}

export default function MobileOverlayNav({
  onBack,
  title,
  isSaved = false,
  onToggleSave,
  onShare,
  copiedToast = false,
}: MobileOverlayNavProps) {
  const { t, locale, setLocale } = useLocale();

  return (
    <div className="xl:hidden absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/70 via-black/35 to-transparent px-4 pt-3.5 pb-6">
      <div className="flex items-center justify-between">
        {/* Left: back button (+ title on sm screens only) */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 active:scale-95 backdrop-blur-md border border-white/15 text-white transition-all shadow-md shrink-0"
            title={t('subnav.go_back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {title && (
            <span className="hidden sm:block font-manrope text-xs font-bold text-white/90 truncate max-w-[200px] drop-shadow-lg">
              {title}
            </span>
          )}
        </div>

        {/* Right: lang switch + save + share */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
            className="h-9 px-2.5 flex items-center gap-1 rounded-full bg-black/40 hover:bg-black/60 active:scale-95 backdrop-blur-md border border-white/15 transition-all text-white/90 shadow-md shrink-0"
            title={locale === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}
          >
            <span className="text-sm leading-none">{locale === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider">{locale === 'id' ? 'ID' : 'EN'}</span>
          </button>

          {onToggleSave && (
            <button
              onClick={onToggleSave}
              className={`w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 active:scale-95 backdrop-blur-md border border-white/15 transition-all shadow-md shrink-0 ${isSaved ? 'text-gold-400 border-gold-400/40' : 'text-white/90'}`}
              title={t('subnav.save')}
            >
              <Heart className={`h-4.5 w-4.5 ${isSaved ? 'fill-gold-400 text-gold-400' : ''}`} />
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 active:scale-95 backdrop-blur-md border border-white/15 transition-all text-white/90 shadow-md shrink-0"
              title={t('subnav.share')}
            >
              <Share2 className="h-4.5 w-4.5" />
            </button>
          )}
          {copiedToast && (
            <span className="absolute top-full right-4 mt-2 bg-gold-400 text-royal-950 font-mono text-[10px] font-bold px-3 py-1 rounded-full shadow-md border border-gold-300 whitespace-nowrap">
              {t('common.copied')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
