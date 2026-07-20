import React from 'react';

// ── Shimmer pulse base ────────────────────────────────────────────────────────
// Uses a gradient sweep for a more polished shimmer vs plain animate-pulse.

const shimmer = 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.4s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent';

// Inject keyframe once via a style tag trick (no extra CSS file needed)
// globals.css already has @keyframes definitions — we reuse animate-pulse here
// and add shimmer via Tailwind arbitrary values below.

// ── Destination Card Skeleton (portrait — default) ────────────────────────────

export function DestinationCardSkeleton({ landscape = false, dark = false }: { landscape?: boolean; dark?: boolean }) {
  const bg = dark ? 'bg-white/5' : 'bg-stone-200';
  const shimBg = dark ? 'bg-white/8' : 'bg-stone-300/60';
  const h = landscape ? 'h-[200px] sm:h-[360px]' : 'h-[160px] sm:h-[360px]';

  return (
    <div className={`rounded-[24px] overflow-hidden animate-pulse ${bg} ${h} ${landscape ? 'col-span-2' : ''}`}>
      {/* Image area placeholder */}
      <div className="relative w-full h-[60%]">
        {/* Badge pill */}
        <div className={`absolute top-3 left-3 h-5 w-16 rounded-full ${shimBg}`} />
        {/* Bookmark btn */}
        <div className={`absolute top-3 right-3 h-8 w-8 rounded-full ${shimBg}`} />
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 space-y-2">
        {/* Title */}
        <div className={`h-4 w-3/4 rounded-lg ${shimBg}`} />
        {/* Tagline — hidden on small */}
        <div className={`hidden sm:block h-3 w-full rounded-lg ${shimBg}`} />
        <div className={`hidden sm:block h-3 w-2/3 rounded-lg ${shimBg}`} />
        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1">
          <div className={`h-5 w-14 rounded-full ${shimBg}`} />
          <div className={`hidden sm:block h-7 w-7 rounded-full ${shimBg}`} />
        </div>
      </div>
    </div>
  );
}

// ── Event Card Skeleton ───────────────────────────────────────────────────────

export function EventCardSkeleton({ landscape = false }: { landscape?: boolean }) {
  return (
    <div className={`rounded-[24px] overflow-hidden animate-pulse bg-stone-200 h-[280px] sm:h-[320px] relative ${landscape ? 'col-span-2' : ''}`}>
      {/* Badge */}
      <div className="absolute top-3 left-3 h-5 w-20 rounded-full bg-stone-300/70" />
      {/* Bookmark */}
      <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-stone-300/70" />
      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 p-4 space-y-2">
        <div className="h-4 w-4/5 rounded-lg bg-stone-300/70" />
        <div className="h-3 w-3/5 rounded-lg bg-stone-300/70" />
        <div className="h-3 w-2/5 rounded-lg bg-stone-300/70" />
        <div className="flex items-center justify-between pt-1">
          <div className="h-5 w-12 rounded-full bg-stone-300/70" />
          <div className="h-7 w-7 rounded-full bg-stone-300/70" />
        </div>
      </div>
    </div>
  );
}

// ── Mobile Destination Card Skeleton (dark bg) ────────────────────────────────

export function MobileDestinationCardSkeleton({ landscape = false }: { landscape?: boolean }) {
  return (
    <div className={`rounded-[20px] overflow-hidden animate-pulse bg-[#1a1814] ${landscape ? 'col-span-2' : ''}`}
      style={{ height: 240 }}>
      {/* Image area */}
      <div className="relative h-[180px] w-full bg-white/5">
        <div className="absolute top-2.5 left-2.5 h-4 w-14 rounded-full bg-white/10" />
        <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-white/10" />
      </div>
      {/* Content */}
      <div className="px-3 pt-2.5 pb-3 space-y-2">
        <div className="h-3.5 w-3/4 rounded-lg bg-white/10" />
        <div className="h-2.5 w-1/2 rounded-lg bg-white/10" />
        <div className="flex items-center gap-2 pt-0.5">
          <div className="h-3 w-10 rounded-full bg-white/10" />
          <div className="h-3 w-10 rounded-full bg-white/10" />
        </div>
      </div>
    </div>
  );
}

// ── Trending Card Skeleton (small, dark) ─────────────────────────────────────

export function TrendingCardSkeleton() {
  return (
    <div className="shrink-0 w-[130px] sm:w-[160px] rounded-2xl overflow-hidden bg-white/5 animate-pulse">
      <div className="h-[80px] sm:h-[96px] bg-white/10 relative">
        <div className="absolute top-2 left-2 h-4 w-12 rounded-full bg-white/15" />
      </div>
      <div className="p-2.5 space-y-1.5">
        <div className="h-2.5 w-full rounded bg-white/10" />
        <div className="h-2.5 w-2/3 rounded bg-white/10" />
        <div className="h-2 w-1/3 rounded bg-white/10 mt-1" />
      </div>
    </div>
  );
}
