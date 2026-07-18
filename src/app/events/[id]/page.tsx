'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Calendar, MapPin, Loader2, Tag, Users, Ticket, ExternalLink, ArrowLeft, CheckCircle } from 'lucide-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';
import { events as eventsApi } from '@/lib/api';

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
}

function EventDetailContent() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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

      {/* Hero image */}
      <div className="relative h-64 sm:h-80 lg:h-96 w-full overflow-hidden bg-stone-200">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-50 to-amber-100">
            <Calendar className="h-16 w-16 text-gold-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Category badge */}
        {event.category && (
          <span className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm text-royal-950 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/50">
            {event.category}
          </span>
        )}

        {/* Status badge */}
        {event.status && event.status !== 'active' && (
          <span className="absolute top-5 right-5 bg-gold-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full capitalize">
            {event.status}
          </span>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="font-manrope text-2xl sm:text-3xl font-bold text-white leading-tight drop-shadow-lg">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6 pb-24">

        {/* Meta row */}
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

        {/* Description */}
        {event.description && (
          <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5">
            <h3 className="font-manrope font-bold text-sm text-royal-950 mb-3">About this Event</h3>
            <p className="text-sm text-stone-600 leading-relaxed">{event.description}</p>
          </div>
        )}

        {/* Highlights */}
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

        {/* CTA */}
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

export default function EventDetailPage() {
  return (
    <AuthProvider>
      <LocationProvider>
        <EventDetailContent />
      </LocationProvider>
    </AuthProvider>
  );
}
