'use client';

import React from 'react';
import { useLocale } from '@/contexts/LocaleContext';

interface SponsoredBadgeProps {
  className?: string;
}

export default function SponsoredBadge({ className = '' }: SponsoredBadgeProps) {
  const { t } = useLocale();

  return (
    <span
      className={`inline-flex items-center text-[8px] font-mono font-bold tracking-widest uppercase text-stone-500 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded-full ${className}`}
    >
      {t('ads.sponsored_label')}
    </span>
  );
}
