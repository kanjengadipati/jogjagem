'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import {
  Calendar, MapPin, Loader2, Users, Ticket,
  ExternalLink, CheckCircle, Share2, Heart,
  ChefHat, Music, UtensilsCrossed, Shield,
  ShoppingBag, Clock, ArrowRight, Info, Umbrella,
  RotateCcw, Star, ChevronRight,
} from 'lucide-react';
import YouTubePlayer from '@/components/YouTubePlayer';
import MobileOverlayNav from '@/components/MobileOverlayNav';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';
import { events as eventsApi } from '@/lib/api';
import { useLocale } from '@/contexts/LocaleContext';
import { useLeafletMap } from '@/hooks/useLeafletMap';

interface EventDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  image_url: string;
  category: string;
  status: string;
  latitude: number;
  longitude: number;
  max_attendees: number;
  ticket_price: string;
  organizer: string;
  highlights: string[];
  video_url?: string;
  badge?: string;
  badges?: string[];
}

function durationLabel(start: string, end: string): string {
  if (!start || !end || start === end) return '1 Hari';
  const diff = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1;
  return `${diff} Hari`;
}

function formatDateRange(start: string, end: string): string {
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const s = new Date(start).toLocaleDateString('id-ID', opts);
  if (!end || end === start) return s;
  const eDate = new Date(end);
  const sDate = new Date(start);
  if (eDate.getMonth() === sDate.getMonth() && eDate.getFullYear() === sDate.getFullYear()) {
    return `${sDate.getDate()} – ${eDate.toLocaleDateString('id-ID', opts)}`;
  }
  return `${s} – ${eDate.toLocaleDateString('id-ID', opts)}`;
}

function formatShortDate(d: string): string {
  if (!d) return '';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

function HighlightIcon({ text }: { text: string }) {
  const l = text.toLowerCase();
  if (l.includes('masak') || l.includes('cook') || l.includes('workshop')) return <ChefHat className="h-5 w-5 text-gold-600 shrink-0" />;
  if (l.includes('musik') || l.includes('music') || l.includes('jazz') || l.includes('pertunjukan')) return <Music className="h-5 w-5 text-gold-600 shrink-0" />;
  if (l.includes('kuliner') || l.includes('food') || l.includes('market') || l.includes('pasar')) return <UtensilsCrossed className="h-5 w-5 text-gold-600 shrink-0" />;
  if (l.includes('souvenir') || l.includes('craft') || l.includes('produk')) return <ShoppingBag className="h-5 w-5 text-gold-600 shrink-0" />;
  return <CheckCircle className="h-5 w-5 text-gold-600 shrink-0" />;
}

const HIGHLIGHT_ICONS = [
  { key: ['kuliner','food','masak','cook'], icon: UtensilsCrossed, label: 'Culinary Experience',   desc: 'Nikmati sajian kuliner lokal & internasional pilihan.', color: 'bg-amber-50' },
  { key: ['musik','music','jazz','pertunjukan','live'], icon: Music, label: 'Live Jazz Performance', desc: 'Penampilan musisi jazz terbaik dari dalam & luar negeri.', color: 'bg-purple-50' },
  { key: ['sunset','senja','petang'], icon: Star,           label: 'Sunset Concert',               desc: 'Rasakan keindahan konser dengan pemandangan senja yang memukau.', color: 'bg-orange-50' },
  { key: ['budaya','culture','heritage','tari'], icon: ChefHat, label: 'Cultural Experience',    desc: 'Rasakan kekayaan budaya dan suasana tradisi Yogyakarta yang autentik.', color: 'bg-teal-50' },
];

const GOOD_TO_KNOW_KEYS = [
  { icon: ShoppingBag, key: 'good_to_know_parking' },
  { icon: RotateCcw,   key: 'good_to_know_no_refund' },
  { icon: Users,       key: 'good_to_know_all_ages' },
  { icon: Umbrella,    key: 'good_to_know_rain' },
  { icon: Info,        key: 'good_to_know_bottle' },
];

const LINEUP_SCHEDULE_KEYS = [
  { time: '15:00', key: 'schedule_gate_open' },
  { time: '16:00', key: 'schedule_opening' },
  { time: '18:30', key: 'schedule_session_1' },
  { time: '20:00', key: 'schedule_main' },
  { time: '22:00', key: 'schedule_closing' },
];

const BADGE_STYLES: Record<string, string> = {
  trending:         'bg-red-600/90 border-red-500/30 text-white',
  akan_datang:      'bg-blue-600/90 border-blue-500/30 text-white',
  spesial_hari_ini: 'bg-amber-600/90 border-amber-500/30 text-white',
  populer:          'bg-purple-600/90 border-purple-500/30 text-white',
  terbatas:         'bg-orange-600/90 border-orange-500/30 text-white',
  festival:         'bg-fuchsia-700/90 border-fuchsia-500/30 text-white',
  musik:            'bg-teal-600/90 border-teal-500/30 text-white',
};

function EventDetailContent({ initialEvent, id }: { initialEvent: EventDetail | null; id: string }) {
  const router = useRouter();
  const { t } = useLocale();

  const [event, setEvent] = useState<EventDetail | null>(initialEvent);
  const [related, setRelated] = useState<EventDetail[]>([]);
  const [isLoading, setIsLoading] = useState(!initialEvent);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // Leaflet map
  const { mapRef: eventMapRef, mapInstance: eventMapInstance, leafletRef: eventLeafletRef, markerGroup: eventMarkerGroup } = useLeafletMap({
    center: [event?.latitude ?? -7.7956, event?.longitude ?? 110.3695],
    zoom: 14,
    scrollWheelZoom: false,
    zoomControl: true,
    zoomControlPosition: 'bottomright',
  });

  useEffect(() => {
    if (!id) return;
    if (initialEvent) {
      eventsApi.getAll({ limit: 4, page: 1 })
        .then((res) => {
          if (res.status === 'success' && res.data) {
            setRelated((res.data as EventDetail[]).filter(e => e.id !== id).slice(0, 4));
          }
        }).catch(() => {});
      return;
    }
    eventsApi.getById(id)
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setEvent(res.data as EventDetail);
        } else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));

    eventsApi.getAll({ limit: 4, page: 1 })
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setRelated((res.data as EventDetail[]).filter(e => e.id !== id).slice(0, 4));
        }
      }).catch(() => {});
  }, [id, initialEvent]);

  // Draw event marker on map
  useEffect(() => {
    if (!event?.latitude || !event?.longitude) return;
    const L = eventLeafletRef.current;
    const markers = eventMarkerGroup.current;
    const map = eventMapInstance.current;
    if (!L || !markers || !map) return;

    markers.clearLayers();
    map.setView([event.latitude, event.longitude], 14);

    const icon = L.divIcon({
      className: 'custom-event-marker',
      html: `<div style="width:36px;height:36px;background:#cb8527;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 4px 12px rgba(0,0,0,0.3);">
        <div style="width:14px;height:14px;background:#fff;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)rotate(45deg);"></div>
      </div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    L.marker([event.latitude, event.longitude], { icon })
      .bindTooltip(event.title, {
        permanent: true,
        direction: 'top',
        className: 'font-manrope font-bold text-[9px] px-2 py-0.5 rounded-full border border-gold-300 shadow',
      })
      .addTo(markers);
  }, [event?.latitude, event?.longitude, event?.title, eventLeafletRef.current, eventMapInstance.current, eventMarkerGroup.current]);

  const handleShare = () => {    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
      <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
    </div>
  );

  if (notFound || !event) return (
    <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
      <div className="text-center bg-white rounded-3xl p-10 shadow-sm border border-stone-200/50 max-w-sm mx-4">
        <Calendar className="h-12 w-12 text-stone-300 mx-auto mb-3" />
        <p className="font-manrope font-semibold text-royal-950 mb-1">{t('event_detail.not_found')}</p>
        <p className="text-xs text-stone-400 mb-5">{t('event_detail.not_found_desc')}</p>
        <button onClick={() => router.push('/events')}
          className="px-5 py-2.5 bg-royal-950 text-white text-xs font-semibold rounded-xl hover:bg-royal-800 transition-all">
          {t('event_detail.see_all_events')}
        </button>
      </div>
    </div>
  );

  const mapsUrl = event.latitude && event.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || event.title)}`;

  const highlights = Array.isArray(event.highlights)
    ? event.highlights.map(h => String(h)).filter(Boolean) : [];

  const isFree = !event.ticket_price || event.ticket_price === '0' || event.ticket_price.toLowerCase() === 'gratis';
  const badgeKey = (event.badge || event.category || '').toLowerCase().replace(/[\s-]/g, '_');
  const badgeStyle = BADGE_STYLES[badgeKey] || 'bg-gold-500/90 text-white';
  const badgeLabel = event.badge
    ? (t(`hero.badge_${event.badge.toLowerCase().replace(/ /g, '_')}`) || event.badge)
    : event.category.replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-[#F7F3EE]">
      <div className="hidden xl:block">
        <Header activeTab="events" setActiveTab={(tab) => {
          if (tab === 'map') router.push('/map');
          else if (tab === 'planner') router.push('/planner');
          else if (tab === 'saved') router.push('/saved');
          else if (tab === 'ai-assistant') router.push('/ai');
          else router.push(`/?tab=${tab}`);
        }} savedCount={0} />
      </div>
      <div className="hidden xl:block">
        <SubNav onBack={() => router.back()} title={t('event_detail.back_to_festival')} zClass="z-40"
          onToggleSave={() => setSaved(v => !v)} isSaved={saved}
          onShare={handleShare} copiedToast={copied} />
      </div>

      <div className="relative h-[480px] sm:h-[560px] lg:h-[640px] w-full overflow-hidden bg-stone-900">
        <MobileOverlayNav onBack={() => router.back()} title={event.title}
          isSaved={saved} onToggleSave={() => setSaved(v => !v)}
          onShare={handleShare} copiedToast={copied} />

        {event.image_url ? (
          <Image src={event.image_url} alt={event.title} fill
            sizes="100vw" className="object-cover brightness-75"
            referrerPolicy="no-referrer" priority />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-royal-900 to-royal-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="absolute top-6 left-0 right-0 xl:top-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${badgeStyle}`}>
              {badgeLabel}
            </span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 lg:pb-12">
            <div className="max-w-3xl">
          <h1 className="font-manrope text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight drop-shadow-lg mb-3">
            {event.title}
          </h1>
          {event.description && (
            <p className="text-white/75 text-sm sm:text-base leading-relaxed max-w-xl line-clamp-2 mb-5">
              {event.description.split('\n')[0]}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-5 mb-6 text-white/90 text-sm font-medium">
            {event.start_date && (
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold-400 shrink-0" />
                {formatDateRange(event.start_date, event.end_date)}
                {event.end_date && event.end_date !== event.start_date && (
                  <span className="text-white/50 text-xs">· {durationLabel(event.start_date, event.end_date)}</span>
                )}
              </span>
            )}
            {event.location && (
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-400 shrink-0" />
                {event.location}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gold-500 hover:bg-gold-400 active:scale-95 text-white text-sm font-bold rounded-2xl transition-all shadow-lg shadow-gold-500/30">
              <Ticket className="h-4 w-4" />
              {t('event_detail.buy_ticket')}
            </a>
            <button
              className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white text-sm font-bold rounded-2xl transition-all">
              <Clock className="h-4 w-4" />
              {t('event_detail.see_lineup')}
            </button>
          </div>
          </div>{/* end max-w-3xl */}
          </div>{/* end mx-auto max-w-7xl */}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6 order-last lg:order-first">

            {event.description && (
              <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-6">
                <h2 className="font-manrope font-bold text-base text-royal-950 mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gold-400 shrink-0" />
                  {t('event_detail.about_event')}
                </h2>
                <div className="space-y-3 mb-5">
                  {event.description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-stone-600 leading-relaxed">{para}</p>
                  ))}
                </div>
                {/* Video player — jika ada video_url */}
                {event.video_url && (
                  <div className="relative rounded-2xl overflow-hidden aspect-video mb-4">
                    <YouTubePlayer
                      videoUrl={event.video_url}
                      thumbnailUrl={event.image_url || undefined}
                      title={event.title}
                      className="rounded-2xl"
                    />
                  </div>
                )}
                {event.image_url && (
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="col-span-2 row-span-2 relative rounded-2xl overflow-hidden aspect-[4/3]">
                      <Image src={event.image_url} alt={event.title} fill sizes="(max-width: 640px) 60vw, 400px"
                        className="object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="relative rounded-2xl overflow-hidden aspect-square bg-stone-100">
                      <Image src={event.image_url} alt={event.title} fill sizes="150px"
                        className="object-cover brightness-90" referrerPolicy="no-referrer" />
                    </div>
                    <div className="relative rounded-2xl overflow-hidden aspect-square bg-stone-100">
                      <Image src={event.image_url} alt={event.title} fill sizes="150px"
                        className="object-cover brightness-75" referrerPolicy="no-referrer" />
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-6">
              <h2 className="font-manrope font-bold text-base text-royal-950 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-gold-400 shrink-0" />
                Apa yang Akan Kamu Alami?
              </h2>
              {highlights.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {highlights.slice(0, 4).map((h, i) => {
                    const [label, ...rest] = h.split(':');
                    const desc = rest.join(':').trim();
                    const cfg = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length];
                    const Icon = cfg.icon;
                    return (
                      <div key={i} className="flex flex-col items-center text-center gap-2.5">
                        <div className={`w-14 h-14 rounded-2xl ${cfg.color} flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-gold-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-royal-950 leading-tight">{desc ? label : h}</p>
                          {desc && <p className="text-[11px] text-stone-500 mt-1 leading-snug">{desc}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {HIGHLIGHT_ICONS.map(({ icon: Icon, label, desc, color }) => (
                    <div key={label} className="flex flex-col items-center text-center gap-2.5">
                      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-gold-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-royal-950 leading-tight">{label}</p>
                        {desc && <p className="text-[11px] text-stone-500 mt-1 leading-snug">{desc}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-6">
              <h2 className="font-manrope font-bold text-base text-royal-950 mb-5 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-gold-400 shrink-0" />
                Line-up &amp; Schedule
              </h2>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  {event.start_date && event.end_date && event.start_date !== event.end_date && (
                    <div className="flex gap-2 mb-4">
                      {Array.from({ length: Math.min(3, parseInt(durationLabel(event.start_date, event.end_date))) }).map((_, d) => {
                        const day = new Date(event.start_date);
                        day.setDate(day.getDate() + d);
                        const label = day.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                        return (
                          <button key={d} className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${d === 0 ? 'bg-gold-500 border-gold-400 text-white' : 'border-stone-200 text-stone-500 hover:border-gold-300'}`}>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {LINEUP_SCHEDULE_KEYS.map(({ time, key }) => (
                    <div key={time} className="flex items-center gap-4 py-2 border-b border-stone-100 last:border-0">
                      <span className="text-xs font-mono font-bold text-gold-600 w-12 shrink-0">{time}</span>
                      <span className="text-sm text-stone-700">{t(`event_detail.${key}`)}</span>
                    </div>
                  ))}
                  <button className="mt-3 flex items-center gap-1.5 text-xs font-bold text-gold-600 hover:text-gold-800 transition-colors">
                    {t('event_detail.see_all_lineup')} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
                {event.image_url && (
                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:w-[220px] shrink-0">
                    {['Idang Rasjidi Project', 'Andien', 'Kunto Aji', 'Tokyo Jazz Orchestra'].map((name, i) => (
                      <div key={name} className="flex flex-col items-center gap-1.5">
                        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-stone-100">
                          <Image src={event.image_url} alt={name} fill sizes="100px"
                            className={`object-cover ${i % 2 === 0 ? 'brightness-90' : 'brightness-75 saturate-50'}`}
                            referrerPolicy="no-referrer" />
                        </div>
                        <p className="text-[10px] font-semibold text-royal-950 text-center leading-tight">{name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:sticky lg:top-24 lg:self-start order-first lg:order-last">

            <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1 flex items-center gap-1">
                <Ticket className="h-3 w-3" /> {t('event_detail.ticket_label')}
              </p>
              <p className="text-xs text-stone-500 mb-1">{t('event_detail.starting_from')}</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-extrabold text-royal-950 font-manrope">
                  {isFree ? 'Gratis' : event.ticket_price}
                </span>
                {!isFree && <span className="text-xs text-stone-400">{t('event_detail.per_person')}</span>}
              </div>

              <div className="space-y-2.5 mb-5 text-sm">
                {event.start_date && (
                  <div className="flex items-center gap-2.5 text-stone-600">
                    <Calendar className="h-4 w-4 text-gold-500 shrink-0" />
                    <span>{formatDateRange(event.start_date, event.end_date)}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-start gap-2.5 text-stone-600">
                    <MapPin className="h-4 w-4 text-gold-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{event.location}</span>
                  </div>
                )}
                {event.max_attendees > 0 && (
                  <div className="flex items-center gap-2.5 text-stone-600">
                    <Users className="h-4 w-4 text-gold-500 shrink-0" />
                    <span>Kapasitas {event.max_attendees.toLocaleString('id-ID')} attendees</span>
                  </div>
                )}
              </div>

              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gold-500 hover:bg-gold-400 active:scale-[0.98] text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-gold-500/20 mb-3">
                <Ticket className="h-4 w-4" />
                {t('event_detail.buy_ticket')}
              </a>
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <Shield className="h-3.5 w-3.5 text-stone-400" />
                <span className="text-[11px] text-stone-400">{t('event_detail.secure_payment')}</span>
              </div>

              <div className="flex gap-2 border-t border-stone-100 pt-4">
                <button onClick={() => setSaved(v => !v)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
                  <Heart className={`h-4 w-4 ${saved ? 'fill-red-500 text-red-500' : ''}`} />
                  {t('event_detail.save')}
                </button>
                <button onClick={handleShare}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
                  <Share2 className="h-4 w-4" />
                  {copied ? t('event_detail.copied') : t('event_detail.share')}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5">
              <h3 className="font-manrope font-bold text-sm text-royal-950 mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold-500" /> {t('event_detail.location')}
              </h3>
              <div className="relative h-36 rounded-2xl overflow-hidden mb-3">
                <div ref={eventMapRef} className="w-full h-full z-0 bg-stone-100" />
                {/* Tap overlay ke Google Maps */}
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                  className="absolute inset-0 z-10 cursor-pointer" aria-label="Lihat di Google Maps" />
              </div>
              <p className="text-sm font-semibold text-royal-950 leading-tight">{event.location}</p>
              {event.location?.toLowerCase().includes(',') && (
                <p className="text-xs text-stone-500 mt-0.5">{event.location.split(',').slice(1).join(',').trim()}</p>
              )}
              <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                className="mt-3 flex items-center justify-between w-full py-2.5 px-3.5 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors">
                {t('event_detail.see_on_map')} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5">
              <h3 className="font-manrope font-bold text-sm text-royal-950 mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-gold-500" /> {t('event_detail.good_to_know')}
              </h3>
              <ul className="space-y-3">
                {GOOD_TO_KNOW_KEYS.map(({ icon: Icon, key }) => (
                  <li key={key} className="flex items-start gap-3">
                    <div className="h-7 w-7 rounded-xl bg-gold-50 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-gold-600" />
                    </div>
                    <span className="text-xs text-stone-600 leading-relaxed pt-1">{t(`event_detail.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA banner — inside sticky right column */}
            <div className="relative overflow-hidden rounded-3xl bg-royal-950 p-6 flex flex-col justify-between min-h-[200px]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(214,161,71,0.15)_0%,_transparent_70%)]" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gold-500/20 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-gold-400" />
                </div>
                <h3 className="font-manrope font-bold text-base text-white mb-2 leading-snug">
                  {t('event_detail.cta_title')}
                </h3>
                <p className="text-xs text-white/60 leading-relaxed mb-5">
                  {t('event_detail.cta_desc')}
                </p>
              </div>
              <button onClick={() => router.push('/events')}
                className="relative z-10 flex items-center justify-between w-full px-5 py-3 bg-gold-500 hover:bg-gold-400 active:scale-[0.98] text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-gold-500/30">
                {t('event_detail.see_all_festivals')}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Related events — full width below main grid */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="font-manrope font-bold text-base text-royal-950 mb-4">
              {t('event_detail.related_events')}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {related.map(ev => {
                const bk = (ev.badge || ev.category || '').toLowerCase().replace(/[\s-]/g, '_');
                const bs = BADGE_STYLES[bk] || 'bg-gold-500/90 text-white';
                return (
                  <button key={ev.id} onClick={() => router.push(`/events/${ev.id}`)}
                    className="group text-left rounded-2xl overflow-hidden bg-white border border-stone-200/60 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
                    <div className="relative h-28 bg-stone-100">
                      {ev.image_url ? (
                        <Image src={ev.image_url} alt={ev.title} fill sizes="200px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-200 to-stone-300" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className={`absolute top-2 left-2 text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border ${bs}`}>
                        {ev.badge || ev.category}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-bold text-royal-950 leading-tight line-clamp-2 mb-1">{ev.title}</p>
                      {ev.start_date && (
                        <p className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Calendar className="h-2.5 w-2.5" />
                          {formatShortDate(ev.start_date)}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EventDetailPageClient({ id, event: initialEvent }: { id: string; event: EventDetail | null }) {
  return (
    <AuthProvider>
      <LocationProvider>
        <EventDetailContent initialEvent={initialEvent} id={id} />
      </LocationProvider>
    </AuthProvider>
  );
}
