'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Flag } from 'lucide-react';
import { Destination } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/api';
import YouTubePlayer from '@/components/YouTubePlayer';
import ReportModal from '@/components/ReportModal';
import LightboxModal from '@/components/LightboxModal';

export interface DestinationGalleryProps {
  destination: Destination;
  activeImageIdx: number;
  onSelectImage: (idx: number) => void;
}

export default function DestinationGallery({
  destination,
  activeImageIdx,
  onSelectImage,
}: DestinationGalleryProps) {
  const { t } = useLocale();
  const { isAuthenticated } = useAuth();
  const [reportOpen, setReportOpen] = useState(false);
  const [reportImageUrl, setReportImageUrl] = useState<string>('');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const imgs = destination.images;
  const firstUrl = imgs.find(i => i?.url)?.url ?? null;
  const getUrl = (idx: number): string | null => imgs[idx]?.url || firstUrl;
  const activeUrl = getUrl(activeImageIdx);

  // Build lightbox items: video first (if any), then images
  const lightboxItems = (() => {
    const result: { type: 'image' | 'video'; url: string; alt?: string }[] = [];
    if (destination.videoUrl) {
      result.push({ type: 'video', url: destination.videoUrl, alt: destination.name });
    }
    imgs.forEach((img, i) => {
      if (img?.url) {
        result.push({ type: 'image', url: img.url, alt: `${destination.name} foto ${i + 1}` });
      }
    });
    return result;
  })();

  const openLightbox = useCallback((url: string | null, isVideo = false) => {
    if (!url) return;
    if (isVideo && destination.videoUrl) {
      setLightboxIndex(0); // video is always first
      return;
    }
    const idx = lightboxItems.findIndex(item => item.url === url);
    setLightboxIndex(idx >= 0 ? idx : 0);
  }, [lightboxItems, destination.videoUrl]);

  const closeLightbox = () => setLightboxIndex(null);
  const nextLightbox = () => setLightboxIndex(i => i !== null ? (i + 1) % lightboxItems.length : 0);
  const prevLightbox = () => setLightboxIndex(i => i !== null ? (i - 1 + lightboxItems.length) % lightboxItems.length : 0);

  const handleSelect = (idx: number) => onSelectImage(idx);

  const handleReportOpen = (imageUrl: string) => {
    if (!isAuthenticated) {
      sessionStorage.setItem('pending_report', destination.id);
      return;
    }
    setReportImageUrl(imageUrl);
    setReportOpen(true);
  };

  const handleReport = async (reason: string, details: string) => {
    try {
      await auth.reportDestinationImage(destination.id, reportImageUrl, reason, details);
      alert(t('report.report_submitted'));
    } catch {
      alert(t('report.report_failed'));
    }
  };

  const ReportButton = ({ imageUrl }: { imageUrl: string }) => (
    <div
      role="button"
      tabIndex={0}
      onClick={(e) => { e.stopPropagation(); handleReportOpen(imageUrl); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); handleReportOpen(imageUrl); } }}
      className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/30 hover:bg-red-500 text-white backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
      title={t('destination_card.report_image_title')}
    >
      <Flag className="h-3 w-3" />
    </div>
  );

  return (
    <>
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        destinationId={destination.id}
        onReport={handleReport}
      />

      {lightboxIndex !== null && (
        <LightboxModal
          items={lightboxItems}
          activeIndex={lightboxIndex}
          onClose={closeLightbox}
          onNext={nextLightbox}
          onPrev={prevLightbox}
        />
      )}

      <div className="lg:col-span-6 grid grid-cols-2 grid-rows-3 gap-3 h-[420px] relative">

        {/* Video — tall, spans 2 rows left side */}
        <div className="col-span-1 row-span-2 relative rounded-2xl overflow-hidden bg-black/40">
          {destination.videoUrl ? (
            <div
              className="relative w-full h-full cursor-zoom-in"
              onClick={() => openLightbox(destination.videoUrl!, true)}
            >
              <YouTubePlayer
                videoUrl={destination.videoUrl}
                thumbnailUrl={getUrl(1) || undefined}
                title={destination.name}
                label={t('destination_detail.media_tab_cinematic')}
                className="rounded-2xl pointer-events-none"
              />
              {/* Expand hint */}
              <div className="absolute inset-0 bg-transparent hover:bg-black/10 transition-colors flex items-end justify-end p-3">
                <span className="text-[10px] text-white/60 bg-black/40 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100">
                  Perluas
                </span>
              </div>
            </div>
          ) : getUrl(1) ? (
            <button
              onClick={() => { handleSelect(1); openLightbox(getUrl(1)); }}
              className="relative w-full h-full group cursor-zoom-in"
            >
              <Image
                src={getUrl(1)!}
                alt="foto 2"
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
              />
              <ReportButton imageUrl={getUrl(1)!} />
            </button>
          ) : (
            <div className="w-full h-full bg-royal-900" />
          )}
        </div>

        {/* Photo top-right */}
        <button
          className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group bg-white/5 cursor-zoom-in"
          onClick={() => { handleSelect(2); openLightbox(getUrl(2)); }}
        >
          {getUrl(2) && (
            <>
              <Image
                src={getUrl(2)!}
                alt={`${destination.name} foto 3`}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <ReportButton imageUrl={getUrl(2)!} />
            </>
          )}
        </button>

        {/* Photo middle-right */}
        <button
          className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group bg-white/5 cursor-zoom-in"
          onClick={() => { handleSelect(3); openLightbox(getUrl(3)); }}
        >
          {getUrl(3) && (
            <>
              <Image
                src={getUrl(3)!}
                alt={`${destination.name} foto 4`}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <ReportButton imageUrl={getUrl(3)!} />
            </>
          )}
        </button>

        {/* Bottom full-width: active image + "+N Foto Lainnya" */}
        <button
          className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group bg-white/5 cursor-zoom-in"
          onClick={() => { handleSelect(0); openLightbox(activeUrl); }}
        >
          {activeUrl && (
            <>
              <Image
                src={activeUrl}
                alt={destination.name}
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <ReportButton imageUrl={activeUrl} />
            </>
          )}
          {imgs.length > 4 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 group-hover:bg-black/40 transition-colors">
              <Camera className="h-5 w-5 text-white" />
              <span className="text-white font-bold text-sm">+{imgs.length - 4} {t('destination_detail.more_photos')}</span>
            </div>
          )}
        </button>

      </div>
    </>
  );
}
