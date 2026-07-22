'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play } from 'lucide-react';

/** Extract YouTube video ID from various URL formats */
export function getYouTubeId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

interface YouTubePlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  className?: string;
  /** Label shown below play button, default "Tonton Video" */
  label?: string;
}

/**
 * Lazy YouTube embed — shows thumbnail with play button overlay.
 * Only loads the actual iframe after user clicks (no tracking/perf hit on page load).
 */
export default function YouTubePlayer({
  videoUrl,
  thumbnailUrl,
  title = 'Video',
  className = '',
  label = 'Sinematik 4K',
}: YouTubePlayerProps) {
  const [playing, setPlaying] = useState(false);
  const videoId = getYouTubeId(videoUrl);

  if (!videoId) return null;

  // Use YouTube's maxresdefault thumbnail as fallback
  const thumb = thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  if (playing) {
    return (
      <div className={`relative w-full h-full ${className}`}>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full rounded-[inherit]"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className={`relative w-full h-full group overflow-hidden ${className}`}
      aria-label={`Putar video: ${title}`}
    >
      {/* Thumbnail */}
      <Image
        src={thumb}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
        referrerPolicy="no-referrer"
        unoptimized
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
      {/* Play button */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-200 shadow-xl">
          <Play className="h-6 w-6 text-white fill-white ml-1" />
        </div>
        <span className="text-xs text-white/90 font-semibold tracking-wide">{label}</span>
      </div>
    </button>
  );
}
