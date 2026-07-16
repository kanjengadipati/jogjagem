import React from 'react';
import { Calendar } from 'lucide-react';

export default function TimelineSection() {
  const events = [
    { id: 1, time: '08:00 AM', placeName: 'Prambanan Temple', details: 'Morning exploration and capturing the beautiful Javanese sunrise.' },
    { id: 2, time: '12:30 PM', placeName: 'Abhayagiri Restaurant', details: 'Lunch with a stunning view overlooking the Prambanan valley.' },
  ];

  return (
    <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm space-y-6">
      <h3 className="font-display font-bold text-lg text-royal-950 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-gold-500" /> Recent Journey
      </h3>
      
      <div className="relative border-l border-stone-200 ml-2 pl-6 space-y-8">
        {events.map((evt) => (
          <div key={evt.id} className="relative">
            <div className="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-gold-500 border-2 border-white" />
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">{evt.time}</span>
            <h4 className="font-display font-bold text-base text-royal-950 mt-1">{evt.placeName}</h4>
            <p className="text-xs text-stone-600 mt-1">{evt.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
