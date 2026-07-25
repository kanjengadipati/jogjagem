'use client';

import { useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxItem {
  type: 'image' | 'video';
  url: string;
  alt?: string;
}

interface LightboxModalProps {
  items: LightboxItem[];
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  onGoTo?: (index: number) => void;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export default function LightboxModal({
  items,
  activeIndex,
  onClose,
  onNext,
  onPrev,
  onGoTo,
}: LightboxModalProps) {
  const item = items[activeIndex];
  const hasMultiple = items.length > 1;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'ArrowLeft') onPrev();
    },
    [onClose, onNext, onPrev]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  if (!item) return null;

  const ytId = item.type === 'video' ? extractYouTubeId(item.url) : null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Counter */}
      {hasMultiple && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-xs font-semibold text-white/60 bg-black/40 px-3 py-1 rounded-full">
          {activeIndex + 1} / {items.length}
        </div>
      )}

      {/* Prev */}
      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          aria-label="Previous"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Next */}
      {hasMultiple && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          aria-label="Next"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Content */}
      <div
        className="relative max-w-5xl w-full mx-4 md:mx-16"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'video' ? (
          ytId ? (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
                title={item.alt ?? 'Video'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            <video
              src={item.url}
              controls
              autoPlay
              className="w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain"
            />
          )
        ) : (
          <div className="relative w-full max-h-[85vh] flex items-center justify-center">
            <Image
              src={item.url}
              alt={item.alt ?? ''}
              width={1280}
              height={853}
              className="rounded-2xl shadow-2xl object-contain max-h-[85vh] w-auto max-w-full"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {hasMultiple && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4">
          {items.map((it, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); onClose(); setTimeout(() => onGoTo?.(i), 0); }}
              className={`relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0 border-2 transition cursor-pointer ${
                i === activeIndex ? 'border-gold-400' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              {it.type === 'video' ? (
                <div className="w-full h-full bg-black/60 flex items-center justify-center text-white text-xs">▶</div>
              ) : (
                <Image src={it.url} alt="" fill className="object-cover" unoptimized />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
