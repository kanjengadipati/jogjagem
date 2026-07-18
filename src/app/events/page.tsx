'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, MapPin, Loader2, Tag } from 'lucide-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';
import Header from '@/components/Header';
import SubNav from '@/components/SubNav';
import { events as eventsApi } from '@/lib/api';

interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  image_url: string;
  category: string;
  ticket_price: string;
  organizer: string;
}

function EventsPageContent() {
  const router = useRouter();
  const [eventList, setEventList] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    eventsApi.getAll()
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setEventList(res.data as EventItem[]);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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

      <SubNav onBack={() => router.back()} title="Events & Festivals" zClass="z-40" />

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pb-24">
        {/* Header */}
        <div className="flex flex-col space-y-1 mb-8 border-b border-stone-200 pb-5">
          <div className="flex items-center space-x-2.5">
            <Calendar className="h-5 w-5 text-gold-600" />
            <h2 className="font-manrope text-2xl font-bold text-royal-950">Upcoming Events & Festivals</h2>
          </div>
          <p className="text-sm text-royal-700/70 font-light">
            Cultural shows, seasonal highlights, and local celebrations in Yogyakarta.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
          </div>
        ) : eventList.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-white/40 p-6 max-w-md mx-auto">
            <Calendar className="h-10 w-10 text-gold-400 mx-auto mb-3" />
            <h3 className="font-manrope text-base font-bold text-royal-950">No Events Found</h3>
            <p className="text-xs text-royal-700/60 font-light mt-1 max-w-xs mx-auto">
              Check back soon for upcoming festivals and events.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {eventList.map((evt) => (
              <div
                key={evt.id}
                onClick={() => router.push(`/events/${evt.id}`)}
                className="group rounded-3xl overflow-hidden bg-white border border-[#E8E0D5] shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-stone-100">
                  {evt.image_url ? (
                    <img
                      src={evt.image_url}
                      alt={evt.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-50 to-amber-100">
                      <Calendar className="h-10 w-10 text-gold-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  {evt.category && (
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-royal-950 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-[#E8E0D5]">
                      {evt.category}
                    </span>
                  )}
                  {evt.ticket_price && evt.ticket_price !== '0' && (
                    <span className="absolute top-3 right-3 bg-gold-500 text-white text-[9px] font-bold px-2.5 py-1 rounded-full">
                      {evt.ticket_price}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="font-manrope font-bold text-sm text-royal-950 leading-tight line-clamp-2">
                    {evt.title}
                  </h3>

                  {(evt.start_date || evt.end_date) && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-gold-700 font-medium">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>
                        {evt.start_date}
                        {evt.end_date && evt.end_date !== evt.start_date ? ` – ${evt.end_date}` : ''}
                      </span>
                    </div>
                  )}

                  {evt.location && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-stone-500">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  )}

                  {evt.description && (
                    <p className="text-xs text-stone-600/80 line-clamp-2 leading-relaxed pt-0.5">
                      {evt.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function EventsPage() {
  return (
    <AuthProvider>
      <LocationProvider>
        <EventsPageContent />
      </LocationProvider>
    </AuthProvider>
  );
}
