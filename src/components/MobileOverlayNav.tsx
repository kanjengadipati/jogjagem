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
    <div className="xl:hidden absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/60 via-black/30 to-transparent px-4 pt-3 pb-4">
      <div className="flex items-center justify-between">
        {/* Left: back + title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors text-white"
            title={t('subnav.go_back')}
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          {title && (
            <span className="font-manrope text-sm font-bold text-white truncate max-w-[140px] drop-shadow-lg">
              {title}
            </span>
          )}
        </div>

        {/* Right: lang switch + save + share */}
        <div className="flex items-center gap-1.5">
          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm border border-white/10 transition-all text-white/80"
            title={locale === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}
          >
            <span className="text-sm leading-none">{locale === 'id' ? '🇮🇩' : '🇬🇧'}</span>
            <span className="text-[10px] font-bold uppercase">{locale === 'id' ? 'ID' : 'EN'}</span>
          </button>

          {onToggleSave && (
            <button
              onClick={onToggleSave}
              className={`p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all ${isSaved ? 'text-gold-400' : 'text-white/80'}`}
              title={t('subnav.save')}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-gold-400 text-gold-400' : ''}`} />
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-colors text-white/80"
              title={t('subnav.share')}
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}
          {copiedToast && (
            <span className="absolute top-full right-0 mt-2 bg-gold-400 text-royal-950 font-mono text-[10px] font-bold px-3 py-1 rounded-full shadow-md border border-gold-300 whitespace-nowrap">
              {t('common.copied')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
