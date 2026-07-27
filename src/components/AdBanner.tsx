'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ads, type BeAdCampaign } from '@/lib/api';
import SponsoredBadge from './SponsoredBadge';

interface AdBannerProps {
  placement: string;
  category?: string;
  variant?: 'wide' | 'native';
  className?: string;
}

export default function AdBanner({ placement, category, variant = 'wide', className = '' }: AdBannerProps) {
  const [campaign, setCampaign] = useState<BeAdCampaign | null>(null);
  const [loaded, setLoaded] = useState(false);
  const trackedRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    trackedRef.current = false;
    setLoaded(false);
    ads.getBanner(placement, category).then((res) => {
      if (!cancelled && res.status === 'success') {
        setCampaign(res.data ?? null);
      }
    }).catch(() => {
      if (!cancelled) setCampaign(null);
    });
    return () => {
      cancelled = true;
    };
  }, [placement, category]);

  useEffect(() => {
    if (!campaign || trackedRef.current || !containerRef.current) return;

    const el = containerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !trackedRef.current) {
          trackedRef.current = true;
          ads.trackImpression(campaign.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [campaign]);

  if (!campaign) return null;

  const aspect = variant === 'wide' ? 'aspect-[16/5] sm:aspect-[21/5]' : 'aspect-[3/4]';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <a
        href={campaign.target_url}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => ads.trackClick(campaign.id)}
        className={`block relative w-full ${aspect} overflow-hidden rounded-2xl sm:rounded-3xl bg-stone-100 group`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={campaign.image_url}
          alt={campaign.partner_name}
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-[1.02] ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
          <SponsoredBadge className="bg-white/90 backdrop-blur-sm" />
        </div>
      </a>
    </div>
  );
}
