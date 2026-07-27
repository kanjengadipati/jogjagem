'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { getHouseAd, getHouseAdLink } from '@/lib/houseAds';

interface HouseAdProps {
  placement: string;
  variant?: 'wide' | 'native';
  className?: string;
}

export default function HouseAd({ placement, variant = 'wide', className = '' }: HouseAdProps) {
  const content = getHouseAd(placement);
  const href = getHouseAdLink(content);
  const aspect = variant === 'wide' ? 'aspect-[16/5] sm:aspect-[21/5]' : 'aspect-[3/4]';

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full ${aspect} flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/50 px-6 text-center transition-colors hover:bg-stone-100/60 sm:rounded-3xl ${className}`}
    >
      <p className="font-manrope text-sm font-bold text-stone-700 sm:text-base">{content.headline}</p>
      <p className="hidden max-w-xs text-xs leading-relaxed text-stone-500 sm:block">{content.subline}</p>
      <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-gold-300 bg-white px-3 py-1.5 text-xs font-bold text-gold-700">
        <MessageCircle className="h-3.5 w-3.5" />
        {content.ctaLabel}
      </span>
    </a>
  );
}
