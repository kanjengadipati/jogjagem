import React, { useState } from 'react';
import { 
  CalendarDays, Plus, Trash, ArrowRight, MapPin, Sparkles, 
  Clock, Coffee, Utensils, MessageSquare, ListTodo, PlusCircle, CheckCircle, Info
} from 'lucide-react';
import { Destination, TripPlan, TripDay } from '../types';

interface TripPlannerProps {
  savedDestinations: Destination[];
  onExploreDestination: (dest: Destination) => void;
  onRemoveFromSaved: (dest: Destination) => void;
}

export default function TripPlanner({ 
  savedDestinations, 
  onExploreDestination,
  onRemoveFromSaved
}: TripPlannerProps) {
  const [tripPlan, setTripPlan] = useState<TripPlan>({
    id: 'my-custom-trip',
    title: 'My Royal Yogyakarta Escape',
    startDate: '2026-08-10',
    durationDays: 3,
    days: [
      { dayNumber: 1, destinations: [], notes: 'Cultural heritage immersion' },
      { dayNumber: 2, destinations: [], notes: 'Volcano thrills and hot coffee' },
      { dayNumber: 3, destinations: [], notes: 'Southern sunset beach mirror' }
    ]
  });

  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [tripNotes, setTripNotes] = useState('');

  const handleAddDestinationToDay = (dest: Destination, dayNum: number) => {
    setTripPlan(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.dayNumber === dayNum) {
          // Check if already exists in this day
          if (day.destinations.some(d => d.id === dest.id)) return day;
          return {
            ...day,
            destinations: [...day.destinations, dest]
          };
        }
        return day;
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleRemoveFromDay = (destId: string, dayNum: number) => {
    setTripPlan(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.dayNumber === dayNum) {
          return {
            ...day,
            destinations: day.destinations.filter(d => d.id !== destId)
          };
        }
        return day;
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleUpdateDayNotes = (dayNum: number, notesText: string) => {
    setTripPlan(prev => {
      const updatedDays = prev.days.map(day => {
        if (day.dayNumber === dayNum) {
          return { ...day, notes: notesText };
        }
        return day;
      });
      return { ...prev, days: updatedDays };
    });
  };

  const handleAddDay = () => {
    setTripPlan(prev => {
      const newDayNum = prev.durationDays + 1;
      const newDay: TripDay = {
        dayNumber: newDayNum,
        destinations: [],
        notes: `Exploring Yogyakarta's beauties`
      };
      return {
        ...prev,
        durationDays: newDayNum,
        days: [...prev.days, newDay]
      };
    });
    setActiveDayIdx(tripPlan.days.length);
  };

  const activeDay = tripPlan.days[activeDayIdx];

  // Dynamic advice generator based on selected destinations in active day
  const getDailyAIAdvice = (day: TripDay) => {
    if (day.destinations.length === 0) {
      return "Monggo! Choose any destinations from your saved list on the left to start planning this day.";
    }

    const hasPrambanan = day.destinations.some(d => d.id === 'prambanan');
    const hasMerapi = day.destinations.some(d => d.id === 'merapi');
    const hasParangtritis = day.destinations.some(d => d.id === 'parangtritis');
    const hasJomblang = day.destinations.some(d => d.id === 'goajomblang');
    const hasTamanSari = day.destinations.some(d => d.id === 'tamansari');

    let advice = "Sugeng rawuh! ";
    if (hasMerapi && hasPrambanan) {
      advice += "Doing Merapi Lava Tour and Prambanan Temple on the same day is excellent. Start with the Sunrise Jeep Tour at 4:30 AM, then rest during midday, and visit Prambanan at 3:30 PM for the perfect golden spires!";
    } else if (hasPrambanan && hasTamanSari) {
      advice += "This is a Royal Heritage day! Explore the secret bath pools of Taman Sari in the morning (around 9:30 AM) to capture the sunbeam inside the underground mosque, then head to Prambanan for the late afternoon.";
    } else if (hasJomblang && hasParangtritis) {
      advice += "A Day of Contrasts! Descend into the vertical dark cave of Goa Jomblang at 9:30 AM to catch the blinding heavenly light, then drive south to catch the reflective sunset mirror of Parangtritis Beach.";
    } else if (hasParangtritis) {
      advice += "Remember to avoid wearing bright green out of respect for Kanjeng Ratu Kidul when visiting Parangtritis. Have a relaxing evening horse carriage ride along the coastline!";
    } else if (hasMerapi) {
      advice += "Be prepared with a light windbreaker jacket for the chilly morning mountain breeze at Merapi. Do not miss visiting Kopi Klotok Pakem for crispy fried bananas afterwards!";
    } else {
      advice += "A wonderful combination! Ensure you leave 1.5 to 2 hours between destinations to accommodate travel and enjoy Javanese roadside scenery.";
    }
    return advice;
  };

  return (
    <div id="trip-planner-page" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-gold-100 pb-5 gap-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-royal-950 text-gold-300 shadow-md">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-manrope text-2xl font-bold text-royal-950">{tripPlan.title}</h1>
            <p className="text-xs text-royal-700/80 font-light">
              Craft your customizable itinerary, reorder visits, and review local transportation guides.
            </p>
          </div>
        </div>

        <button
          onClick={handleAddDay}
          className="flex items-center space-x-1.5 rounded-full bg-gold-800 text-gold-50 px-5 py-2.5 text-xs font-semibold hover:bg-gold-700 active:scale-95 transition-all shadow-md"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Add Itinerary Day</span>
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Pane: Saved Favorites Bank */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl border border-gold-100 bg-white p-5 space-y-4">
            <h3 className="font-manrope text-base font-bold text-royal-950 flex items-center space-x-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-100 text-xs text-gold-700 font-mono">
                {savedDestinations.length}
              </span>
              <span>Saved Discoveries</span>
            </h3>
            
            <p className="text-xs text-royal-700/70 font-light">
              Click the plus button to allocate these authentic spots into your daily trip slots.
            </p>

            {savedDestinations.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gold-200 rounded-2xl bg-gold-50/20 p-4">
                <Info className="h-8 w-8 text-gold-500 mx-auto mb-2" />
                <span className="block text-xs font-medium text-royal-950">No saved favorites yet</span>
                <span className="block text-[10px] text-royal-700/60 font-light mt-1">
                  Explore Yogyakarta destinations and click the heart icon on cards to save them.
                </span>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {savedDestinations.map(dest => (
                  <div 
                    key={dest.id}
                    id={`planner-saved-card-${dest.id}`}
                    className="flex items-center justify-between rounded-2xl border border-gold-50 bg-white p-3 hover:border-gold-300 hover:shadow-sm transition-all"
                  >
                    <div 
                      onClick={() => onExploreDestination(dest)}
                      className="flex items-center space-x-3 cursor-pointer flex-1"
                    >
                      <img src={dest.images[0]} alt={dest.name} className="h-12 w-12 rounded-xl object-cover border border-gold-100" />
                      <div>
                        <h4 className="font-manrope font-bold text-xs text-royal-950 hover:text-gold-700 transition-colors">
                          {dest.name}
                        </h4>
                        <span className="block text-[10px] font-mono text-royal-700/50">{dest.subRegion}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 ml-2">
                      <div className="flex items-center space-x-1 border border-gold-100 rounded-full px-2 py-1 bg-gold-50/30">
                        <span className="text-[9px] font-mono font-semibold text-royal-950">Add to:</span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddDestinationToDay(dest, parseInt(e.target.value));
                              e.target.value = '';
                            }
                          }}
                          className="text-[9px] font-mono bg-transparent text-gold-700 font-bold focus:outline-none cursor-pointer"
                        >
                          <option value="">Choose Day</option>
                          {tripPlan.days.map(day => (
                            <option key={day.dayNumber} value={day.dayNumber}>Day {day.dayNumber}</option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => onRemoveFromSaved(dest)}
                        className="rounded-full p-1.5 text-royal-700/40 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Local Javanese transportation tips */}
          <div className="rounded-3xl bg-gold-50/40 border border-gold-100/40 p-5 space-y-3">
            <h4 className="font-manrope text-sm font-bold text-royal-950">Transportation Guide</h4>
            <div className="space-y-2 text-xs text-royal-700 font-light leading-relaxed">
              <p>
                <strong>• Royal Andong (Chariots):</strong> Best for relaxing rides around Malioboro and central heritage quarters. Negotiate fares beforehand (usually IDR 50k-100k).
              </p>
              <p>
                <strong>• TransJogja Bus:</strong> Air-conditioned public buses connecting major hubs (Sleman, Malioboro, Prambanan) for just IDR 3,600!
              </p>
              <p>
                <strong>• Car/Jeep Rentals:</strong> Highly recommended for trips to high areas (Mount Merapi) or deep coastal cliffs (Parangtritis). Available with English-speaking guides.
              </p>
            </div>
          </div>
        </div>

        {/* Right Pane: Customized Daily Slots Itinerary */}
        <div className="lg:col-span-7 space-y-6">
          {/* Day selection tabs */}
          <div className="flex space-x-2 border-b border-gold-100 pb-3 overflow-x-auto">
            {tripPlan.days.map((day, idx) => (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDayIdx(idx)}
                className={`rounded-full px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-colors shrink-0 ${
                  activeDayIdx === idx
                    ? 'bg-gold-800 text-gold-50 shadow-sm'
                    : 'bg-white text-royal-700/60 hover:bg-gold-50 border border-gold-100'
                }`}
              >
                Day {day.dayNumber}
              </button>
            ))}
          </div>

          {/* Active day detail planner card */}
          {activeDay && (
            <div className="rounded-3xl border border-gold-100 bg-white p-6 shadow-sm space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-gold-600 font-semibold">Scheduled Itinerary</span>
                  <h3 className="font-manrope text-lg font-bold text-royal-950">Day {activeDay.dayNumber} Slots</h3>
                </div>
                <span className="text-xs font-mono font-medium text-royal-700/60">
                  {activeDay.destinations.length} Allocated
                </span>
              </div>

              {/* Day notes text field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-sans uppercase tracking-[0.08em] text-royal-700/70 font-semibold">Focus of the Day</label>
                <input
                  type="text"
                  placeholder="e.g. Exploring ancient palaces or beach sunsets..."
                  value={activeDay.notes || ''}
                  onChange={(e) => handleUpdateDayNotes(activeDay.dayNumber, e.target.value)}
                  className="w-full rounded-xl border border-gold-100 bg-gold-50/20 px-4 py-2 text-xs text-royal-950 focus:outline-none focus:border-gold-500"
                />
              </div>

              {/* Daily allocated spots list */}
              <div className="space-y-3">
                <span className="block text-[10px] font-sans uppercase tracking-[0.08em] text-royal-700/70 font-semibold">Planned Route Sequence</span>
                
                {activeDay.destinations.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-gold-100 rounded-2xl bg-gold-50/20 text-xs text-royal-700/60 font-light">
                    Add destinations from your Saved Discoveries to design Day {activeDay.dayNumber}.
                  </div>
                ) : (
                  <div className="space-y-3 relative before:absolute before:left-6 before:top-6 before:bottom-6 before:w-0.5 before:bg-gold-100">
                    {activeDay.destinations.map((dest, idx) => (
                      <div 
                        key={dest.id}
                        id={`planner-route-card-${dest.id}`}
                        className="relative flex items-center justify-between rounded-2xl border border-gold-100 bg-white p-3.5 hover:border-gold-300 transition-all shadow-sm pl-12"
                      >
                        {/* Number tracker on route */}
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-royal-950 text-gold-300 font-mono text-[11px] font-bold border border-gold-400">
                          {idx + 1}
                        </div>

                        <div className="flex items-center space-x-3">
                          <img src={dest.images[0]} alt={dest.name} className="h-12 w-12 rounded-xl object-cover" />
                          <div>
                            <h4 className="font-manrope font-bold text-xs text-royal-950 hover:text-gold-700 transition-colors" onClick={() => onExploreDestination(dest)}>
                              {dest.name}
                            </h4>
                            <span className="block text-[10px] font-mono text-royal-700/50">{dest.subRegion} • {dest.openingHours}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveFromDay(dest.id, activeDay.dayNumber)}
                          className="rounded-full p-2 text-royal-700/30 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamic Javanese Local Advisor advice box */}
              <div className="rounded-2xl bg-royal-950 text-white p-5 border border-royal-900 shadow-md">
                <div className="flex items-center space-x-2 text-gold-400 mb-2.5">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-mono text-[9px] uppercase tracking-wider font-bold">Advisor Route Insights</span>
                </div>
                <p className="text-xs italic text-gold-100/90 leading-relaxed font-light">
                  "{getDailyAIAdvice(activeDay)}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
