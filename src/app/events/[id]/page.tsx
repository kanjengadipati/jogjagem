'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Calendar, MapPin, Loader2, Users, Ticket,
  ExternalLink, CheckCircle, Share2, Heart,
  ShoppingBag, ChefHat, Music, UtensilsCrossed, Shield
} from 'lucide-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';
import { events as eventsApi } from '@/lib/api';
import { useLocale } from '@/contexts/LocaleContext';

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
  badge?: string;
  badges?: string[];
}

/** Duration label e.g. "2 Hari" */
function durationLabel(start: string, end: string): string {
  if (!start || !end || start === end) return '1 Hari';
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
  return `${diff} Hari`;
}

/** Format date range in Indonesian */
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

/** Pick an icon for a highlight based on keywords */
function HighlightIcon({ text }: { text: string }) {
  const lower = text.toLowerCase();
  if (lower.includes('cook') || lower.includes('masak') || lower.includes('workshop'))
    return <ChefHat className="h-5 w-5 text-gold-600 shrink-0" />;
  if (lower.includes('music') || lower.includes('musik') || lower.includes('jazz') || lower.includes('gamelan') || lower.includes('pertunjukan'))
    return <Music className="h-5 w-5 text-gold-600 shrink-0" />;
  if (lower.includes('food') || lower.includes('kuliner') || lower.includes('market') || lower.includes('pasar'))
    return <UtensilsCrossed className="h-5 w-5 text-gold-600 shrink-0" />;
  if (lower.includes('souvenir') || lower.includes('craft') || lower.includes('produk'))
    return <ShoppingBag className="h-5 w-5 text-gold-600 shrink-0" />;
  return <CheckCircle className="h-5 w-5 text-gold-600 shrink-0" />;
}

/** Feature icons shown in the bottom strip */
const FEATURE_ICONS = [
  { icon: UtensilsCrossed, label: 'Pasar Kuliner',     desc: 'Cicipi aneka jajanan dan minuman lokal.' },
  { icon: ChefHat,         label: 'Workshop Memasak',  desc: 'Ikut kelas membuat bakpia dengan chef berpengalaman.' },
  { icon: Music,           label: 'Pertunjukan Budaya', desc: 'Saksikan seni tari, musik, dan tradisi lokal.' },
  { icon: ShoppingBag,     label: 'Produk & Souvenir', desc: 'Bawa pulang produk unggulan dan oleh-oleh khas Jogja.' },
];

function EventDetailContent() {
  const router = useRouter();
  const { t } = useLocale();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <div className="min-h-screen bg-[#F7F3EE] flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl p-10 shadow-sm border border-stone-200/50 max-w-sm mx-4">
          <Calendar className="h-12 w-12 text-stone-300 mx-auto mb-3" />
          <p className="font-manrope font-semibold text-royal-950 mb-1">Event tidak ditemukan</p>
          <p className="text-xs text-stone-400 mb-5">Event ini mungkin sudah berakhir atau dihapus.</p>
          <button
            onClick={() => router.push('/events')}
            className="px-5 py-2.5 bg-royal-950 text-white text-xs font-semibold rounded-xl hover:bg-royal-800 transition-all"
          >
            Lihat Semua Event
          </button>
        </div>
      </div>
    );
  }

  const mapsUrl = event.latitude && event.longitude
    ? `https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location || event.title)}`;

  const highlights = Array.isArray(event.highlights)
    ? event.highlights.map((h) => String(h)).filter(Boolean)
    : [];

  const isFree = !event.ticket_price || event.ticket_price === '0' || event.ticket_price.toLowerCase() === 'gratis';

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

      {/* SubNav — keep it */}
      <SubNav
        onBack={() => router.push('/events')}
        title="Kembali ke Festival"
        zClass="z-40"
        onToggleSave={() => setSaved((v) => !v)}
        isSaved={saved}
        onShare={handleShare}
        copiedToast={copied}
      />

      {/* ── Hero ── */}
      <div className="relative h-[300px] sm:h-[380px] lg:h-[440px] w-full overflow-hidden bg-stone-900">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover brightness-75"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gold-800 to-amber-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Category badge */}
        {(event.badge || event.category) && (
          <div className="absolute top-6 left-6">
            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full ${
              event.badge === 'trending' ? 'bg-red-600/90 border border-red-500/30 text-white' :
              event.badge === 'akan_datang' ? 'bg-blue-600/90 border border-blue-500/30 text-white' :
              event.badge === 'spesial_hari_ini' ? 'bg-amber-600/90 border border-amber-500/30 text-white' :
              event.badge === 'populer' ? 'bg-purple-600/90 border border-purple-500/30 text-white' :
              event.badge === 'terbatas' ? 'bg-orange-600/90 border border-orange-500/30 text-white' :
              'bg-gold-500/90 backdrop-blur-sm text-white'
            }`}>
              <UtensilsCrossed className="h-3 w-3" />
              {event.badge 
                ? t(`hero.badge_${event.badge.toLowerCase().replace(/ /g, '_')}`) 
                : event.category.replace(/-/g, ' ')}
            </span>
          </div>
        )}

        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <h1 className="font-manrope text-3xl sm:text-4xl font-extrabold text-white leading-tight drop-shadow-lg mb-2">
            {event.title}
          </h1>
          {event.description && (
            <p className="text-white/80 text-sm leading-relaxed max-w-xl line-clamp-2">
              {event.description.split('\n')[0]}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-white/90 text-xs font-medium">
            {event.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gold-400" />
                {event.location}
              </span>
            )}
            {event.start_date && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-gold-400" />
                {formatDateRange(event.start_date, event.end_date)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24 space-y-6 -mt-6 relative z-10">

        {/* ── Stats row ── */}
        <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm px-6 py-5 grid grid-cols-2 sm:grid-cols-4 gap-5 divide-x divide-stone-100">
          {/* Date */}
          <div className="flex flex-col items-center text-center px-2 first:pl-0">
            <Calendar className="h-5 w-5 text-gold-500 mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Tanggal</span>
            <span className="text-sm font-bold text-royal-950 leading-tight">
              {formatDateRange(event.start_date, event.end_date)}
            </span>
            {event.end_date && event.end_date !== event.start_date && (
              <span className="text-[10px] text-stone-400 mt-0.5">({durationLabel(event.start_date, event.end_date)})</span>
            )}
          </div>

          {/* Ticket */}
          <div className="flex flex-col items-center text-center px-2">
            <Ticket className="h-5 w-5 text-gold-500 mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Harga Tiket</span>
            <span className="text-sm font-bold text-royal-950">{isFree ? 'Gratis' : event.ticket_price}</span>
            {!isFree && <span className="text-[10px] text-stone-400 mt-0.5">/ orang</span>}
          </div>

          {/* Capacity */}
          {event.max_attendees > 0 && (
            <div className="flex flex-col items-center text-center px-2">
              <Users className="h-5 w-5 text-gold-500 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Kapasitas</span>
              <span className="text-sm font-bold text-royal-950">{event.max_attendees.toLocaleString('id-ID')}</span>
              <span className="text-[10px] text-stone-400 mt-0.5">attendees</span>
            </div>
          )}

          {/* Location */}
          <div className="flex flex-col items-center text-center px-2">
            <MapPin className="h-5 w-5 text-gold-500 mb-2" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-0.5">Lokasi</span>
            <span className="text-sm font-bold text-royal-950 leading-tight">{event.location}</span>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-gold-600 hover:text-gold-800 mt-0.5 flex items-center gap-0.5"
            >
              Lihat di Peta <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>

        {/* ── Two column: description + ticket card ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Left: About + Highlights */}
          <div className="lg:col-span-3 space-y-5">
            {/* About */}
            {event.description && (
              <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-6">
                <h2 className="font-manrope font-bold text-base text-royal-950 mb-1 border-l-4 border-gold-400 pl-3">
                  Tentang Event
                </h2>
                <div className="mt-3 space-y-3">
                  {event.description.split('\n\n').map((para, i) => (
                    <p key={i} className="text-sm text-stone-600 leading-relaxed">{para}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-6">
                <h2 className="font-manrope font-bold text-base text-royal-950 mb-4">Highlight</h2>
                <ul className="space-y-4">
                  {highlights.map((h, i) => {
                    const [label, ...rest] = h.split(':');
                    const desc = rest.join(':').trim();
                    return (
                      <li key={i} className="flex items-start gap-3.5">
                        <div className="p-2 bg-gold-50 rounded-xl shrink-0">
                          <HighlightIcon text={h} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-royal-950">{desc ? label : h}</p>
                          {desc && <p className="text-xs text-stone-500 mt-0.5 leading-relaxed">{desc}</p>}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* Right: Ticket + Organizer */}
          <div className="lg:col-span-2 space-y-5">
            {/* Ticket card */}
            <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Tiket</p>
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-2xl font-extrabold text-royal-950 font-manrope">
                  {isFree ? 'Gratis' : event.ticket_price}
                </span>
                {!isFree && <span className="text-xs text-stone-400 font-medium">/ orang</span>}
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-gold-500 hover:bg-gold-600 active:scale-[0.98] text-white text-sm font-bold rounded-2xl transition-all shadow-md shadow-gold-500/20"
              >
                <Ticket className="h-4 w-4" />
                Beli Tiket Sekarang
              </a>
              <div className="flex items-center justify-center gap-1.5 mt-3">
                <Shield className="h-3.5 w-3.5 text-stone-400" />
                <span className="text-[11px] text-stone-400">Pembayaran aman &amp; terjamin</span>
              </div>
            </div>

            {/* Organizer card */}
            {event.organizer && (
              <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-6">
                <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Diselenggarakan oleh</p>
                <div className="flex items-start gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-gold-100 flex items-center justify-center shrink-0">
                    <Users className="h-5 w-5 text-gold-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-royal-950 leading-tight">{event.organizer}</p>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Komunitas yang mempromosikan kekayaan rasa dan budaya Yogyakarta.
                    </p>
                  </div>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 border border-stone-200 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Lihat Profil <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Feature strip ── */}
        <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-6">
          <h2 className="font-manrope font-bold text-base text-royal-950 mb-5">Apa yang Bisa Kamu Nikmati?</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {FEATURE_ICONS.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-gold-50 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-gold-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-royal-950 leading-tight">{label}</p>
                  <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-[#F0EAE1] border border-stone-200/60 p-8 text-center">
          {/* Decorative Prambanan silhouette */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none select-none" aria-hidden>
            <svg viewBox="0 0 300 120" className="w-64 h-auto" fill="#B8936A">
              <rect x="120" y="10" width="60" height="110" rx="2" />
              <polygon points="120,10 150,0 180,10" />
              <rect x="80" y="35" width="42" height="85" rx="2" />
              <polygon points="80,35 101,22 122,35" />
              <rect x="178" y="35" width="42" height="85" rx="2" />
              <polygon points="178,35 199,22 220,35" />
            </svg>
          </div>
          <h3 className="font-manrope font-bold text-lg text-royal-950 mb-1">
            Temukan festival dan event seru lainnya di Yogyakarta
          </h3>
          <p className="text-sm text-stone-500 mb-5 max-w-md mx-auto">
            Jangan lewatkan pengalaman budaya, kuliner, dan petualangan terbaik selama di Yogyakarta.
          </p>
          <button
            onClick={() => router.push('/events')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-royal-950 hover:bg-royal-800 text-white text-sm font-bold rounded-2xl transition-all shadow-md"
          >
            Lihat Festival Lainnya →
          </button>
        </div>

      </div>
    </div>
  );
}

export default function EventDetailPage() {
  return (
    <AuthProvider>
      <LocationProvider>
        <EventDetailContent />
      </LocationProvider>
    </AuthProvider>
  );
}
