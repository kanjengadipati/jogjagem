'use client';

import React, { useEffect, useState } from 'react';
import { Megaphone } from 'lucide-react';
import { ads, type BeHouseAd } from '@/lib/api';

interface HouseAdProps {
  placement: string;
  variant?: 'wide' | 'native';
  className?: string;
}

export default function HouseAd({ placement, variant = 'wide', className = '' }: HouseAdProps) {
  const [content, setContent] = useState<BeHouseAd | null>(null);
  const [status, setStatus] = useState<'loading' | 'resolved'>('loading');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setContent(null);

    ads.getHouseAd(placement).then((res) => {
      if (cancelled) return;
      setContent(res.status === 'success' ? res.data ?? null : null);
      setStatus('resolved');
    }).catch(() => {
      if (cancelled) return;
      setContent(null);
      setStatus('resolved');
    });

    return () => {
      cancelled = true;
    };
  }, [placement]);

  if (status === 'loading' || !content || content.is_enabled === false) return null;

  const aspect = variant === 'wide' ? 'aspect-[16/5] sm:aspect-[21/5]' : 'aspect-[3/4]';
  const hasImage = Boolean(content.image_url);

  return (
    <a
      href={content.target_url}
      target="_blank"
      rel="noopener noreferrer"
      className={`relative flex flex-col justify-center gap-2 w-full ${aspect} overflow-hidden rounded-2xl sm:rounded-3xl bg-stone-100 transition-colors text-left px-5 sm:px-7 ${className}`}
    >
      {hasImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={content.image_url} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]" />
          <div className="absolute inset-0 bg-gradient-to-r from-royal-950/78 via-royal-950/42 to-transparent" />
        </>
      )}
      <div className={`relative max-w-md ${hasImage ? 'text-white' : 'text-royal-950'}`}>
        <p className="font-manrope text-sm sm:text-base font-bold">{content.headline}</p>
        {content.subline && <p className={`mt-1 hidden max-w-xs text-xs leading-relaxed sm:block ${hasImage ? 'text-white/80' : 'text-stone-600'}`}>{content.subline}</p>}
        <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${hasImage ? 'bg-white text-royal-950' : 'border border-gold-300 bg-white text-gold-700'}`}>
          <Megaphone className="h-3.5 w-3.5" /> {content.cta_label}
        </span>
      </div>
    </a>
  );
}
