'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { Calendar, MapPin, Users, Ticket, ExternalLink, CheckCircle, ChevronLeft, ChevronRight, Camera, Briefcase } from 'lucide-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import { useLocale } from '@/contexts/LocaleContext';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';
import { events as eventsApi } from '@/lib/api';
import Image from 'next/image';

/** Normalise images field (array of objects, plain strings, or single image_url fallback) */
function resolveImages(event: EventDetail): string[] {
  if (Array.isArray(event.images) && event.images.length > 0) {
    return event.images.map((img) => {
      if (typeof img === 'string') return img;
      if (img && typeof img === 'object' && 'url' in img) return (img as { url: string }).url;
      return '';
    }).filter(Boolean);
  }
  if (event.image_url) return [event.image_url];
  return [];
}

interface EventDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  image_url: string;
  images?: { url: string; credit?: string }[] | string[];
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  max_attendees: number;
  ticket_price: string;
  organizer: string;
  highlights: string[];
  video_url?: string;
  businessId?: string | number | null;
}

function EventDetailContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { t } = useLocale();

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    eventsApi.getById(id)
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setEvent(res.data as EventDetail);
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE]">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-5">
          {/* Image skeleton */}
          <div className="w-full h-[240px] sm:h-[320px] rounded-2xl bg-stone-200 animate-pulse" />
          {/* Title skeleton */}
          <div className="space-y-2">
            <div className="h-5 w-3/4 bg-stone-200 rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-stone-200 rounded animate-pulse" />
          </div>
          {/* Info row skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-3 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="h-3 w-32 bg-stone-200 rounded animate-pulse" />
          </div>
          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-full bg-stone-200 rounded animate-pulse" />
            <div className="h-3 w-full bg-stone-200 rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-10 shadow-sm border border-stone-200/50 max-w-sm mx-4">
          <Calendar className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <p className="font-manrope font-semibold text-royal-950 mb-1">Event not found</p>
          <p className="text-xs text-stone-400 mb-5">This event may have ended or been removed.</p>
          <button
            onClick={() => router.push('/events')}
            className="px-5 py-2.5 bg-royal-950 text-white text-xs font-semibold rounded-xl hover:bg-royal-800 transition-all"
          >
            Browse All Events
          </button>
        </div>
      </div>
    );
  }

  const imgs = resolveImages(event);
  const coverUrl = imgs[activeImg] ?? imgs[0] ?? null;

  const mapsUrl = event.latitude && event.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || event.title)}`;

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <Header
        activeTab="events"
        setActiveTab={(tab) => {
          if (tab === 'map') router.push('/map');
          else if (tab === 'planner') router.push('/planner');
          else if (tab === 'saved') router.push('/saved');
          else if (tab === 'ai-assistant') router.push('/ai');
          else router.push(`/?tab=${tab}`);
        }}
        savedCount={0}
      />

      <SubNav onBack={() => router.push('/events')} title={event.title} zClass="z-40" />

      {/* Hero image with gallery navigation */}
      <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden bg-stone-200">
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={event.title}
            fill
            className="object-cover transition-opacity duration-300"
            referrerPolicy="no-referrer"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-50 to-amber-100">
            <Calendar className="h-16 w-16 text-gold-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Prev / Next arrows — only when multiple images */}
        {imgs.length > 1 && (
          <>
            <button
              onClick={() => setActiveImg((i) => (i - 1 + imgs.length) % imgs.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition backdrop-blur-sm"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setActiveImg((i) => (i + 1) % imgs.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition backdrop-blur-sm"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-1.5">
              {imgs.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? 'bg-white w-4' : 'bg-white/50'}`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
            {/* Photo count badge */}
            <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              <Camera className="h-3 w-3" />
              {activeImg + 1} / {imgs.length}
            </div>
          </>
        )}

        {event.category && (
          <span className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm text-royal-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/50">
            {event.category}
          </span>
        )}

        {event.status && event.status !== 'active' && imgs.length <= 1 && (
          <span className="absolute top-5 right-5 bg-gold-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full capitalize">
            {event.status}
          </span>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="font-manrope text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-lg">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Thumbnail strip — only when more than 1 image */}
      {imgs.length > 1 && (
        <div className="bg-stone-900 px-4 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`relative w-14 h-10 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                i === activeImg ? 'border-gold-400 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <Image src={src} alt={`thumbnail ${i + 1}`} fill className="object-cover" unoptimized sizes="56px" />
            </button>
          ))}
        </div>
      )}

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6 pb-24">
        <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(event.start_date || event.end_date) && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gold-50 rounded-xl shrink-0">
                <Calendar className="h-4 w-4 text-gold-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">Date</p>
                <p className="text-sm font-semibold text-royal-950">
                  {event.start_date}
                  {event.end_date && event.end_date !== event.start_date ? ` – ${event.end_date}` : ''}
                </p>
              </div>
            </div>
          )}

          {event.location && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gold-50 rounded-xl shrink-0">
                <MapPin className="h-4 w-4 text-gold-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">Location</p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-gold-700 hover:text-gold-900 flex items-center gap-1 transition-colors"
                >
                  {event.location}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}

          {event.ticket_price && event.ticket_price !== '0' && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gold-50 rounded-xl shrink-0">
                <Ticket className="h-4 w-4 text-gold-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">Ticket Price</p>
                <p className="text-sm font-semibold text-royal-950">{event.ticket_price}</p>
              </div>
            </div>
          )}

          {event.organizer && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gold-50 rounded-xl shrink-0">
                <Users className="h-4 w-4 text-gold-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">Organizer</p>
                <p className="text-sm font-semibold text-royal-950">{event.organizer}</p>
              </div>
            </div>
          )}

          {event.max_attendees > 0 && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gold-50 rounded-xl shrink-0">
                <Users className="h-4 w-4 text-gold-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-0.5">Capacity</p>
                <p className="text-sm font-semibold text-royal-950">{event.max_attendees.toLocaleString()} attendees</p>
              </div>
            </div>
          )}
        </div>

        {event.description && (
          <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5">
            <h3 className="font-manrope font-bold text-sm text-royal-950 mb-3">About this Event</h3>
            <p className="text-sm text-stone-600 leading-relaxed">{event.description}</p>
          </div>
        )}

        {Array.isArray(event.highlights) && event.highlights.length > 0 && (
          <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5">
            <h3 className="font-manrope font-bold text-sm text-royal-950 mb-3">Highlights</h3>
            <ul className="space-y-2">
              {event.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-stone-600 leading-relaxed">{String(h)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!event.businessId && (
          <a
            href={`/business/claim?type=event&listingId=${event.id}&name=${encodeURIComponent(event.title)}`}
            className="flex items-center justify-center gap-2 w-full py-3 mb-3 border border-gold-400/50 text-gold-700 hover:bg-gold-50 text-sm font-semibold rounded-2xl transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            <span>{t('business_page.claim_event') || 'Ini acara/usaha saya'}</span>
          </a>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3.5 bg-royal-950 hover:bg-royal-800 text-white text-sm font-semibold rounded-2xl transition-all shadow-md"
        >
          <MapPin className="h-4 w-4" />
          View on Google Maps
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}

export default function EventDetailClient() {
  return (
    <AuthProvider>
      <LocationProvider>
        <EventDetailContent />
      </LocationProvider>
    </AuthProvider>
  );
}
