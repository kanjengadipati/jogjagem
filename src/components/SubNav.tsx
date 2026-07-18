'use client';

import React from 'react';
import { ArrowLeft, Heart, Share2 } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

interface SubNavLink {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface SubNavProps {
  onBack: () => void;
  /** Page title shown after the back button — e.g. destination name or user name */
  title?: string;
  centerLinks?: SubNavLink[];
  /** Right side: heart/save button */
  isSaved?: boolean;
  onToggleSave?: () => void;
  /** Right side: share button */
  onShare?: () => void;
  copiedToast?: boolean;
  /** Right side: avatar initials */
  userInitials?: string;
  /** Right side: arbitrary extra node */
  rightExtra?: React.ReactNode;
  /** z-index class — default z-50, use z-40 if main Header is already z-50 */
  zClass?: string;
}

export default function SubNav({
  onBack,
  title,
  centerLinks,
  isSaved = false,
  onToggleSave,
  onShare,
  copiedToast = false,
  userInitials,
  rightExtra,
  zClass = 'z-50',
}: SubNavProps) {
  const { t } = useLocale();
  return (
    <nav className={`sticky top-0 ${zClass} bg-[#0f100c]/90 backdrop-blur-md border-b border-white/5 text-white transition-all duration-300`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

        {/* Left — back button + title */}
        <div className="flex items-center space-x-3 min-w-0">
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors flex items-center space-x-1.5 text-gold-300 hover:text-white shrink-0"
            title={t('subnav.go_back')}
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline text-xs font-mono tracking-widest uppercase">{t('common.back')}</span>
          </button>
          {title && (
            <>
              <div className="h-4 w-px bg-white/15 shrink-0" />
              <span className="font-manrope text-sm font-bold text-white truncate max-w-[180px] sm:max-w-xs">
                {title}
              </span>
            </>
          )}
        </div>

        {/* Center links */}
        {centerLinks && centerLinks.length > 0 && (
          <div className="hidden lg:flex items-center space-x-1 text-xs font-mono tracking-widest uppercase">
            {centerLinks.map((link, i) =>
              link.href ? (
                <a
                  key={i}
                  href={link.href}
                  className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                    link.active
                      ? 'bg-white/15 text-gold-300 font-bold'
                      : 'text-white/60 hover:text-white/90'
                  }`}
                >
                  {link.label}
                </a>
              ) : (
                <button
                  key={i}
                  onClick={link.onClick}
                  className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                    link.active
                      ? 'bg-white/15 text-gold-300 font-bold'
                      : 'text-white/60 hover:text-white/90'
                  }`}
                >
                  {link.label}
                </button>
              )
            )}
          </div>
        )}

        {/* Right icons */}
        <div className="flex items-center space-x-2 relative">
          {onToggleSave && (
            <button
              onClick={onToggleSave}
              className={`p-2 rounded-full hover:bg-white/10 transition-all ${isSaved ? 'text-gold-400' : 'text-white/80'}`}
              title={t('subnav.save')}
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-gold-400 text-gold-400' : ''}`} />
            </button>
          )}
          {onShare && (
            <button
              onClick={onShare}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80"
              title={t('subnav.share')}
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}
          {copiedToast && (
            <span className="absolute -bottom-8 right-0 bg-gold-400 text-royal-950 font-mono text-[10px] font-bold px-3 py-1 rounded-full shadow-md border border-gold-300 whitespace-nowrap">
              {t('common.copied')}
            </span>
          )}
          {userInitials && (
            <div className="h-8 w-8 rounded-full border border-gold-400/30 bg-royal-950 text-gold-300 flex items-center justify-center text-[10px] font-mono font-bold">
              {userInitials}
            </div>
          )}
          {rightExtra}
        </div>

      </div>
    </nav>
  );
}
