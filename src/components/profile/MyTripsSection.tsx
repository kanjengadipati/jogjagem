import React from 'react';
import { CalendarDays } from 'lucide-react';

export default function MyTripsSection() {
  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm">
      <h3 className="font-display font-bold text-lg text-royal-950 flex items-center gap-2 mb-4">
        <CalendarDays className="w-5 h-5 text-gold-500" /> My Trips
      </h3>
      <p className="text-xs text-stone-500">No trips planned yet.</p>
    </div>
  );
}
