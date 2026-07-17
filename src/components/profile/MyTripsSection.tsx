'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, MapPin, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { trips as tripsApi } from '../../lib/api';

interface Trip {
  id: string;
  destination_id: string;
  destination_name: string;
  destination_image?: string;
  status: 'planned' | 'ongoing' | 'completed';
  start_date?: string;
  end_date?: string;
  notes?: string;
}

const STATUS_CONFIG = {
  planned:   { label: 'Planned',   color: 'text-indigo-600', bg: 'bg-indigo-50', icon: Clock },
  ongoing:   { label: 'Ongoing',   color: 'text-emerald-600', bg: 'bg-emerald-50', icon: MapPin },
  completed: { label: 'Completed', color: 'text-stone-400',  bg: 'bg-stone-100', icon: CheckCircle2 },
};

export default function MyTripsSection() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tripsApi.getAll()
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setTrips(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeTrips = trips.filter((t) => t.status !== 'completed');
  const completedTrips = trips.filter((t) => t.status === 'completed');

  return (
    <div className="bg-white rounded-3xl border border-stone-200/60 shadow-sm p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-stone-700" />
          <h3 className="font-manrope font-bold text-sm text-stone-950">My Trips</h3>
          {trips.length > 0 && (
            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">
              {trips.length}
            </span>
          )}
        </div>
        <button
          onClick={() => router.push('/?tab=planner')}
          className="text-xs font-semibold text-gold-600 hover:text-gold-700 flex items-center gap-1 transition-colors"
        >
          Plan New <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-2 w-full">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-stone-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : trips.length === 0 ? (
        /* Empty state */
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <div className="relative w-24 h-20 mb-4">
            <div className="w-24 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-1 opacity-30">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-4 h-3 rounded bg-stone-400" />
                ))}
              </div>
            </div>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2">
              <div className="w-8 h-8 rounded-full bg-gold-100 border-2 border-white shadow flex items-center justify-center">
                <MapPin className="w-4 h-4 text-gold-500" />
              </div>
            </div>
            <div className="absolute -bottom-1 right-0 w-7 h-7 rounded-xl bg-stone-200 border-2 border-white shadow flex items-center justify-center">
              <CalendarDays className="w-3.5 h-3.5 text-stone-500" />
            </div>
          </div>
          <p className="text-sm font-semibold text-stone-700 mb-1">No trips planned yet</p>
          <p className="text-xs text-stone-400 mb-4 max-w-[160px] leading-relaxed">
            Start planning your next adventure with Trip Planner.
          </p>
          <button
            onClick={() => router.push('/?tab=planner')}
            className="px-5 py-2 bg-stone-950 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-all duration-200"
          >
            Plan a Trip
          </button>
        </div>
      ) : (
        /* Trip list */
        <div className="flex-1 space-y-2 overflow-y-auto">
          {activeTrips.map((trip) => {
            const cfg = STATUS_CONFIG[trip.status];
            const StatusIcon = cfg.icon;
            return (
              <div
                key={trip.id}
                className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 hover:border-gold-200 hover:bg-gold-50/30 transition-all duration-200 cursor-pointer"
              >
                {/* Thumbnail */}
                {trip.destination_image ? (
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-200">
                    <img src={trip.destination_image} alt={trip.destination_name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gold-50 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-gold-500" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-stone-900 truncate">{trip.destination_name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <StatusIcon className={`w-3 h-3 ${cfg.color}`} />
                    <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                    {trip.start_date && (
                      <>
                        <span className="text-stone-300">·</span>
                        <span className="text-[10px] text-stone-400">{trip.start_date}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {completedTrips.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide">Completed</span>
                <div className="flex-1 h-px bg-stone-100" />
              </div>
              {completedTrips.slice(0, 2).map((trip) => {
                const cfg = STATUS_CONFIG.completed;
                return (
                  <div
                    key={trip.id}
                    className="flex items-center gap-3 p-3 bg-stone-50/50 rounded-xl border border-stone-100/50 opacity-60"
                  >
                    {trip.destination_image ? (
                      <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-200 grayscale">
                        <img src={trip.destination_image} alt={trip.destination_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-4 h-4 text-stone-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-500 truncate line-through">{trip.destination_name}</p>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
