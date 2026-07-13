import React, { useState } from 'react';
import { Map, MapPin, Eye, Info, Layers, RefreshCw, Car, Flame, Compass, Navigation, Bus, Star } from 'lucide-react';
import { DESTINATIONS } from '../data';
import { Destination, EcosystemPartner } from '../types';

interface InteractiveMapProps {
  onExploreDestination: (dest: Destination) => void;
  selectedDestination?: Destination | null;
}

const TRANSPORTATION_HUBS = [
  { id: 't-tugu', name: 'Yogyakarta Tugu Railway Station', type: 'rail', lat: -7.7891, lng: 110.3634, coords: { x: 42, y: 55 } },
  { id: 't-lempuyangan', name: 'Lempuyangan Railway Station', type: 'rail', lat: -7.7900, lng: 110.3750, coords: { x: 50, y: 56 } },
  { id: 't-giwangan', name: 'Giwangan Central Bus Terminal', type: 'bus', lat: -7.8341, lng: 110.3925, coords: { x: 56, y: 68 } }
];

const PARKING_LOTS = [
  { id: 'pk-malioboro', name: 'Abu Bakar Ali Parking Ground', capacity: '150 cars, 500 motorbikes', coords: { x: 42, y: 53 } },
  { id: 'pk-prambanan', name: 'Prambanan Main Temple Park', capacity: '300 cars, 100 buses', coords: { x: 74, y: 48 } },
  { id: 'pk-depok', name: 'Parangtritis Marine Center Lot', capacity: '200 cars', coords: { x: 34, y: 92 } }
];

export default function InteractiveMap({ onExploreDestination, selectedDestination }: InteractiveMapProps) {
  const [activeLayer, setActiveLayer] = useState<'all' | 'destinations' | 'partners' | 'transport'>('all');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showParking, setShowParking] = useState(false);
  const [showWalkingRoutes, setShowWalkingRoutes] = useState(true);
  const [selectedPin, setSelectedPin] = useState<{ id: string; name: string; type: string; desc: string; data?: any } | null>(null);

  // Geographic positioning conversion inside our SVG canvas:
  // Sleman (Merapi) is in the North (Top: Y=15-35)
  // City (Malioboro, Taman Sari) is in the Center (Y=50-65)
  // Bantul (Parangtritis) is in the South (Bottom: Y=80-95)
  // We specify custom SVG x,y coordinate overrides for each destination:
  const getDestMapCoords = (id: string) => {
    switch(id) {
      case 'merapi': return { x: 58, y: 15 };
      case 'prambanan': return { x: 75, y: 45 };
      case 'malioboro': return { x: 41, y: 57 };
      case 'tamansari': return { x: 38, y: 63 };
      case 'parangtritis': return { x: 35, y: 92 };
      case 'goajomblang': return { x: 80, y: 78 };
      default: return { x: 50, y: 50 };
    }
  };

  const handlePinClick = (pin: any) => {
    setSelectedPin(pin);
  };

  return (
    <div id="interactive-tourism-map" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Interactive Map Canvas */}
        <div className="flex-1 rounded-3xl border border-gold-100 bg-gold-50/20 overflow-hidden relative shadow-lg flex flex-col h-[70vh] min-h-[500px]">
          {/* Layer and Traffic Overlay controls on map */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className={`rounded-full px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider uppercase transition-colors flex items-center space-x-1 border shadow-sm ${
                showTraffic 
                  ? 'bg-red-700 text-white border-red-700' 
                  : 'bg-white text-royal-950 border-gold-100 hover:bg-gold-50'
              }`}
            >
              <Flame className={`h-3 w-3 ${showTraffic ? 'animate-pulse' : ''}`} />
              <span>{showTraffic ? 'Traffic Live' : 'Traffic Off'}</span>
            </button>

            <button
              onClick={() => setShowParking(!showParking)}
              className={`rounded-full px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider uppercase transition-colors flex items-center space-x-1 border shadow-sm ${
                showParking 
                  ? 'bg-blue-700 text-white border-blue-700' 
                  : 'bg-white text-royal-950 border-gold-100 hover:bg-gold-50'
              }`}
            >
              <Car className="h-3 w-3" />
              <span>{showParking ? 'Parking Pins' : 'Parking Off'}</span>
            </button>

            <button
              onClick={() => setShowWalkingRoutes(!showWalkingRoutes)}
              className={`rounded-full px-3 py-1.5 text-[10px] font-mono font-semibold tracking-wider uppercase transition-colors flex items-center space-x-1 border shadow-sm ${
                showWalkingRoutes 
                  ? 'bg-green-700 text-white border-green-700' 
                  : 'bg-white text-royal-950 border-gold-100 hover:bg-gold-50'
              }`}
            >
              <Navigation className="h-3 w-3" />
              <span>{showWalkingRoutes ? 'Walking Routes' : 'Routes Off'}</span>
            </button>
          </div>

          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-gold-100 shadow-md">
            <span className="text-[9px] font-mono font-bold text-royal-700 uppercase tracking-wider mb-1 block text-center">Layers</span>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'destinations', label: 'Destinations Only' },
              { id: 'transport', label: 'Transports' }
            ].map(l => (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id as any)}
                className={`rounded-xl px-2.5 py-1 text-[9px] font-semibold text-left transition-colors uppercase font-mono ${
                  activeLayer === l.id ? 'bg-gold-800 text-gold-50' : 'text-royal-700 hover:bg-gold-50'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* SVG Visual Vector Map Canvas */}
          <div className="flex-1 relative w-full h-full overflow-hidden bg-gradient-to-b from-blue-50/40 via-gold-50/20 to-blue-100/50">
            {/* Visual background vector guidelines representing mountains and beaches */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              {/* Northern Merapi Highlands representation */}
              <path d="M 150 150 L 580 50 L 950 150" fill="none" stroke="#ecd7a4" strokeWidth="2" strokeDasharray="4,4" opacity="0.3" />
              <text x="58%" y="9%" fill="#cb8527" className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-60">Merapi Volcanic Zone</text>

              {/* Southern Coast Ocean representation */}
              <rect x="0" y="85%" width="100%" height="15%" fill="#cb8527" opacity="0.05" />
              <path d="M 0 85% Q 500 83% 1000 85%" fill="none" stroke="#cb8527" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.4" />
              <text x="35%" y="98%" fill="#7b4019" className="font-mono text-[9px] font-bold uppercase tracking-widest opacity-60">Indian Ocean Coastlines</text>

              {/* Walking routes connection coordinates between City, Prambanan and Jomblang */}
              {showWalkingRoutes && (
                <>
                  {/* Route 1: Prambanan to City */}
                  <path d="M 41% 57% Q 58% 51% 75% 45%" fill="none" stroke="#d6a147" strokeWidth="2.5" strokeDasharray="5,5" className="animate-pulse" opacity="0.6" />
                  {/* Route 2: City to Jomblang */}
                  <path d="M 41% 57% Q 60% 67% 80% 78%" fill="none" stroke="#d6a147" strokeWidth="2.5" strokeDasharray="5,5" opacity="0.5" />
                  {/* Route 3: Merapi to City */}
                  <path d="M 58% 15% Q 49.5% 36% 41% 57%" fill="none" stroke="#d6a147" strokeWidth="2.5" strokeDasharray="5,5" opacity="0.5" />
                </>
              )}

              {/* Traffic Overlay - simulated highway lines */}
              {showTraffic && (
                <>
                  <path d="M 10% 50% L 90% 50%" fill="none" stroke="#ef4444" strokeWidth="5" opacity="0.4" />
                  <path d="M 41% 30% L 41% 90%" fill="none" stroke="#22c55e" strokeWidth="4" opacity="0.4" />
                  <text x="75%" y="54%" fill="#ef4444" className="font-mono text-[8px] font-bold uppercase">Heavy Traffic (Solo Rd)</text>
                </>
              )}
            </svg>

            {/* Destination Pin Nodes */}
            {(activeLayer === 'all' || activeLayer === 'destinations') && DESTINATIONS.map(dest => {
              const coords = getDestMapCoords(dest.id);
              const isSelected = selectedDestination?.id === dest.id;

              return (
                <button
                  key={dest.id}
                  onClick={() => handlePinClick({
                    id: dest.id,
                    name: dest.name,
                    type: 'destination',
                    desc: dest.tagline,
                    data: dest
                  })}
                  className="absolute group z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                  style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                >
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110 ${
                    isSelected 
                      ? 'bg-gold-700 text-gold-200 border-2 border-gold-400' 
                      : 'bg-royal-950 text-gold-300 border border-gold-500/30'
                  }`}>
                    <MapPin className="h-5 w-5 animate-bounce" />
                  </div>
                  
                  {/* Floating tooltip labels */}
                  <span className="mt-1 font-manrope font-bold text-[10px] text-royal-950 bg-white/95 backdrop-blur-sm border border-gold-200 px-2 py-0.5 rounded-full shadow-sm">
                    {dest.name}
                  </span>
                </button>
              );
            })}

            {/* Ecosystem Partners Pin Nodes */}
            {activeLayer === 'all' && DESTINATIONS.flatMap(d => d.partners).map((partner, idx) => {
              // Distribute partner pins slightly surrounding their home destination coordinate
              const destCoords = getDestMapCoords(partner.id.startsWith('p-p') ? 'prambanan' : partner.id.startsWith('m-p') ? 'malioboro' : partner.id.startsWith('pt-p') ? 'parangtritis' : partner.id.startsWith('me-p') ? 'merapi' : partner.id.startsWith('ts-p') ? 'tamansari' : 'goajomblang');
              const offsetAngle = (idx * 45) * (Math.PI / 180);
              const radius = 5.5; // Offset distance percentages
              const px = destCoords.x + Math.cos(offsetAngle) * radius;
              const py = destCoords.y + Math.sin(offsetAngle) * radius;

              return (
                <button
                  key={partner.id}
                  onClick={() => handlePinClick({
                    id: partner.id,
                    name: partner.name,
                    type: 'partner',
                    desc: partner.description,
                    data: partner
                  })}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                  style={{ left: `${px}%`, top: `${py}%` }}
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-royal-950 border border-gold-600 shadow-sm hover:scale-110 transition-transform">
                    <span className="text-[9px] font-bold">P</span>
                  </div>
                </button>
              );
            })}

            {/* Transport Stations Pins */}
            {(activeLayer === 'all' || activeLayer === 'transport') && TRANSPORTATION_HUBS.map(hub => (
              <button
                key={hub.id}
                onClick={() => handlePinClick({
                  id: hub.id,
                  name: hub.name,
                  type: 'transport',
                  desc: `Central transport node connecting Yogyakarta ecosystems.`
                })}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                style={{ left: `${hub.coords.x}%`, top: `${hub.coords.y}%` }}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white border border-slate-600 shadow-md hover:scale-110 transition-transform">
                  <Bus className="h-4.5 w-4.5" />
                </div>
                <span className="text-[7px] font-mono font-semibold text-slate-800 bg-white/80 px-1 rounded">Hub</span>
              </button>
            ))}

            {/* Parking Lots Pins */}
            {showParking && PARKING_LOTS.map(pk => (
              <button
                key={pk.id}
                onClick={() => handlePinClick({
                  id: pk.id,
                  name: pk.name,
                  type: 'parking',
                  desc: `Public authorized vehicle parking lot. Space: ${pk.capacity}.`
                })}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10"
                style={{ left: `${pk.coords.x}%`, top: `${pk.coords.y}%` }}
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white border border-blue-400 shadow-md">
                  <span className="text-[10px] font-bold">P</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Node Sidebar Panel */}
        <div className="w-full lg:w-96 rounded-3xl border border-gold-100 bg-white p-5 flex flex-col justify-between shadow-md space-y-4">
          <div>
            <div className="flex items-center space-x-2 border-b border-gold-100 pb-3">
              <Map className="h-5 w-5 text-gold-600 animate-pulse" />
              <h3 className="font-manrope text-base font-bold text-royal-950">Map Exploration Panel</h3>
            </div>
            
            <p className="text-xs text-royal-700/70 font-light mt-2">
              Select any pin on the vector map to coordinate travel routes, check parking, or find nearby hospitality partners.
            </p>

            {/* Dynamic pin metadata display */}
            {selectedPin ? (
              <div className="mt-5 space-y-4 animate-fade-in">
                <span className="inline-block rounded-full bg-gold-100 px-3 py-1 text-[9px] font-sans font-semibold uppercase tracking-[0.08em] text-gold-700 border border-gold-200">
                  {selectedPin.type}
                </span>

                <h4 className="font-manrope font-bold text-base text-royal-950 leading-snug">
                  {selectedPin.name}
                </h4>

                <p className="text-xs text-royal-700 leading-relaxed font-light">
                  {selectedPin.desc}
                </p>

                {/* Specific layouts based on pin type */}
                {selectedPin.type === 'destination' && selectedPin.data && (
                  <div className="space-y-3.5 border-t border-gold-50 pt-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-royal-700/60 font-mono">Admission Fee:</span>
                      <span className="font-bold text-royal-950">{selectedPin.data.ticketPrice}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-royal-700/60 font-mono">Opening hours:</span>
                      <span className="font-bold text-royal-950">{selectedPin.data.openingHours}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-royal-700/60 font-mono">Rating:</span>
                      <span className="font-bold text-royal-950 flex items-center space-x-0.5 font-mono">
                        <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                        <span>{selectedPin.data.rating.toFixed(1)}</span>
                      </span>
                    </div>

                    <button
                      onClick={() => onExploreDestination(selectedPin.data)}
                      className="w-full rounded-xl bg-gold-800 text-gold-50 py-2.5 text-xs font-semibold hover:bg-gold-700 active:scale-95 transition-all text-center flex items-center justify-center space-x-1"
                    >
                      <span>Explore Full Details</span>
                      <Compass className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {selectedPin.type === 'partner' && selectedPin.data && (
                  <div className="space-y-3 border-t border-gold-50 pt-3">
                    <div className="flex items-center space-x-3 bg-gold-50 p-3 rounded-2xl border border-gold-100">
                      <img src={selectedPin.data.image} alt={selectedPin.name} className="h-14 w-14 rounded-xl object-cover" />
                      <div>
                        <span className="text-[9px] font-mono text-gold-700 uppercase font-bold tracking-widest">{selectedPin.data.category}</span>
                        <span className="block text-xs font-bold text-royal-950 line-clamp-1">{selectedPin.data.name}</span>
                        <span className="block text-[10px] font-mono text-royal-950/80 font-semibold">{selectedPin.data.price}</span>
                      </div>
                    </div>
                    {selectedPin.data.promotion && (
                      <div className="bg-gold-500/10 border border-gold-300 rounded-xl p-2.5 text-[10px] font-mono text-gold-800 font-bold">
                        Exclusive Deal: {selectedPin.data.promotion}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-10 text-center py-10 border border-dashed border-gold-200 rounded-2xl bg-gold-50/10 p-4">
                <Info className="h-8 w-8 text-gold-500 mx-auto mb-2" />
                <span className="block text-xs font-medium text-royal-950">No Pin Selected</span>
                <span className="block text-[10px] text-royal-700/60 font-light mt-1">
                  Click on any of the destination, partner or transport pins on the map to display instant spatial information.
                </span>
              </div>
            )}
          </div>

          <div className="bg-gold-50 border border-gold-100 rounded-2xl p-4.5 text-xs text-royal-700 font-light space-y-2">
            <h4 className="font-manrope font-bold text-xs text-royal-950">Grounded Tourist GPS Note</h4>
            <p className="leading-relaxed text-[11px]">
              Yogyakarta's core attractions are separated in natural subregions. Always plan transport paths early! Giwangan and Tugu Station offer seamless connections.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
