'use client';

import React from 'react';
import Image from 'next/image';
import { MapPin, Utensils, Landmark, Waves, Compass, Sparkles, Leaf } from 'lucide-react';
import { Destination } from '@/types';

interface RouteLineDisplayProps {
  destinations: Destination[];
  userCoords?: { lat: number; lng: number } | null;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getCategoryIcon(category: string) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('culinary') || cat.includes('food')) return Utensils;
  if (cat.includes('heritage') || cat.includes('cultural') || cat.includes('temple')) return Landmark;
  if (cat.includes('nature') || cat.includes('bukit')) return Leaf;
  if (cat.includes('beach') || cat.includes('pantai')) return Waves;
  if (cat.includes('adventure')) return Compass;
  return Sparkles;
}

function getImgUrl(dest: Destination): string {
  const imgs = dest.images as unknown[];
  if (!Array.isArray(imgs) || imgs.length === 0) return '';
  const first = imgs[0];
  if (typeof first === 'string') return first;
  if (first && typeof first === 'object' && 'url' in first) return (first as { url: string }).url ?? '';
  return '';
}

const DEFAULT_LAT = -7.7828;
const DEFAULT_LNG = 110.3671;

export default function RouteLineDisplay({ destinations, userCoords }: RouteLineDisplayProps) {
  if (destinations.length === 0) return null;

  const userLat = userCoords?.lat ?? DEFAULT_LAT;
  const userLng = userCoords?.lng ?? DEFAULT_LNG;

  // Build nodes: user start + destinations
  const allNodes = [
    { id: 'start', isStart: true, dest: null as Destination | null },
    ...destinations.map((d) => ({ id: d.id, isStart: false, dest: d })),
  ];

  // Compute distances between consecutive nodes
  const distances: (number | null)[] = allNodes.map((node, i) => {
    if (i === 0) return null;
    const prev = allNodes[i - 1];
    const prevLat = prev.isStart ? userLat : (prev.dest?.latitude ?? 0);
    const prevLng = prev.isStart ? userLng : (prev.dest?.longitude ?? 0);
    const currLat = node.dest?.latitude ?? 0;
    const currLng = node.dest?.longitude ?? 0;
    if (!currLat || !currLng) return null;
    return haversineKm(prevLat, prevLng, currLat, currLng);
  });

  // Node positions as % of width (evenly spaced)
  const nodeCount = allNodes.length;
  const positions = allNodes.map((_, i) =>
    nodeCount === 1 ? 50 : (i / (nodeCount - 1)) * 92 + 4
  );

  // SVG wave path through node positions
  const svgH = 40;
  const buildPath = () => {
    if (positions.length < 2) return '';
    const pts = positions.map((p, i) => ({
      x: p,
      y: i % 2 === 0 ? svgH * 0.35 : svgH * 0.65,
    }));
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const cx = (pts[i].x + pts[i + 1].x) / 2;
      d += ` C ${cx} ${pts[i].y}, ${cx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
    }
    return d;
  };

  const lineY = (idx: number) => (idx % 2 === 0 ? svgH * 0.35 : svgH * 0.65);

  return (
    <div className="w-full bg-royal-950/95 rounded-2xl p-4 border border-gold-400/20">
      {/* Route visual */}
      <div className="relative" style={{ height: '120px' }}>
        {/* SVG dashed line */}
        <svg
          width="100%"
          height={svgH}
          viewBox={`0 0 100 ${svgH}`}
          preserveAspectRatio="none"
          className="absolute left-0 top-3 w-full pointer-events-none"
          aria-hidden="true"
        >
          <path
            d={buildPath()}
            fill="none"
            stroke="#FBBF24"
            strokeWidth="2.5"
            strokeDasharray="6,4"
            strokeLinecap="round"
            strokeOpacity="0.85"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Distance labels */}
        {distances.map((dist, i) => {
          if (!dist || i === 0) return null;
          const midX = (positions[i - 1] + positions[i]) / 2;
          const top = (i - 1) % 2 === 0 ? '4px' : '12px';
          return (
            <span
              key={`dist-${i}`}
              className="absolute px-1.5 py-0.5 rounded-full bg-black/80 border border-gold-400/40 text-[7px] font-mono font-bold text-gold-300 whitespace-nowrap pointer-events-none"
              style={{ left: `${midX}%`, top, transform: 'translateX(-50%)' }}
            >
              {dist.toFixed(1)} km
            </span>
          );
        })}

        {/* Nodes */}
        {allNodes.map((node, i) => {
          const top = `${lineY(i) + 2}px`;
          const left = `${positions[i]}%`;

          if (node.isStart) {
            return (
              <div
                key="start-node"
                className="absolute flex flex-col items-center"
                style={{ left, top, transform: 'translateX(-50%)' }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-500 text-royal-950 ring-2 ring-gold-400/80 shadow-[0_0_10px_rgba(234,179,8,0.5)]">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="mt-1 text-[8px] font-bold text-gold-400 uppercase tracking-wide whitespace-nowrap">
                  Start
                </span>
              </div>
            );
          }

          const dest = node.dest!;
          const Icon = getCategoryIcon(dest.category);
          const imgUrl = getImgUrl(dest);

          return (
            <div
              key={dest.id}
              className="absolute flex flex-col items-center group"
              style={{ left, top, transform: 'translateX(-50%)' }}
            >
              {/* Number badge */}
              <div className="relative">
                {imgUrl ? (
                  <div className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-gold-400/80 shadow-md">
                    <Image src={imgUrl} alt={dest.name} fill className="object-cover" sizes="32px" />
                    <div className="absolute inset-0 bg-black/20" />
                    <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-gold-400 text-[7px] font-mono font-bold text-gold-300">
                      {i}
                    </span>
                  </div>
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-gold-400 border border-gold-400/60 shadow-md">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-royal-950 border border-gold-400 text-[7px] font-mono font-bold text-gold-300">
                      {i}
                    </span>
                  </div>
                )}
              </div>
              {/* Label */}
              <div className="mt-1 text-center" style={{ width: '72px' }}>
                <span className="block text-[8px] font-bold text-white/90 leading-tight truncate">
                  {dest.name.split(' ').slice(0, 2).join(' ')}
                </span>
                <span className="block text-[7px] text-gold-400/80 truncate">
                  📍 {dest.subRegion || dest.location}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Total distance summary */}
      <div className="mt-2 flex items-center justify-end gap-3 text-[9px] text-white/40 font-mono border-t border-white/10 pt-2">
        <span>{destinations.length} destinasi</span>
        {distances.some(Boolean) && (
          <span>
            Total ≈ {distances.reduce((sum, d) => sum + (d ?? 0), 0).toFixed(1)} km
          </span>
        )}
      </div>
    </div>
  );
}
