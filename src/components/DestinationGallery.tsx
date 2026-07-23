'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, Flag } from 'lucide-react';
import { Destination } from '@/types';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/lib/api';
import YouTubePlayer from '@/components/YouTubePlayer';
import ReportModal from '@/components/ReportModal';

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

  const imgs = destination.images;
  const firstUrl = imgs.find(i => i?.url)?.url ?? null;
  const getUrl = (idx: number): string | null => imgs[idx]?.url || firstUrl;
  const activeUrl = getUrl(activeImageIdx);

  const handleSelect = (idx: number) => {
    onSelectImage(idx);
  };

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

      <div className="lg:col-span-6 grid grid-cols-2 grid-rows-3 gap-3 h-[420px] relative">

        {/* Video — tall, spans 2 rows left side */}
        <div className="col-span-1 row-span-2 relative rounded-2xl overflow-hidden bg-black/40">
          {destination.videoUrl ? (
            <YouTubePlayer
              videoUrl={destination.videoUrl}
              thumbnailUrl={getUrl(1) || undefined}
              title={destination.name}
              label={t('destination_detail.media_tab_cinematic')}
              className="rounded-2xl"
            />
          ) : getUrl(1) ? (
            <button
              onClick={() => handleSelect(1)}
              className="relative w-full h-full group"
            >
              <Image
                src={getUrl(1)!}
                alt="foto 2"
                fill
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
          className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group bg-white/5"
          onClick={() => handleSelect(2)}
        >
          {getUrl(2) && (
            <>
              <Image
                src={getUrl(2)!}
                alt={`${destination.name} foto 3`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <ReportButton imageUrl={getUrl(2)!} />
            </>
          )}
        </button>

        {/* Photo middle-right */}
        <button
          className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group bg-white/5"
          onClick={() => handleSelect(3)}
        >
          {getUrl(3) && (
            <>
              <Image
                src={getUrl(3)!}
                alt={`${destination.name} foto 4`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <ReportButton imageUrl={getUrl(3)!} />
            </>
          )}
        </button>

        {/* Bottom full-width: active image + "+N Foto Lainnya" */}
        <button
          className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group bg-white/5"
          onClick={() => handleSelect(0)}
        >
          {activeUrl && (
            <>
              <Image
                src={activeUrl}
                alt={destination.name}
                fill
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
