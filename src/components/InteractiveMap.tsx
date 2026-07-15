'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Map as MapIcon, MapPin, Eye, Info, Layers, RefreshCw, Car, Flame, Compass, Navigation, Bus, Star, ExternalLink, ShieldAlert } from 'lucide-react';
import { Destination, EcosystemPartner } from '../types';
import { destinations as destinationApi } from '../lib/api';

interface InteractiveMapProps {
  onExploreDestination: (dest: Destination) => void;
  selectedDestination?: Destination | null;
}

const TRANSPORTATION_HUBS = [
  { id: 't-tugu', name: 'Yogyakarta Tugu Railway Station', type: 'rail', lat: -7.7891, lng: 110.3634 },
  { id: 't-lempuyangan', name: 'Lempuyangan Railway Station', type: 'rail', lat: -7.7900, lng: 110.3750 },
  { id: 't-giwangan', name: 'Giwangan Central Bus Terminal', type: 'bus', lat: -7.8341, lng: 110.3925 }
];

const PARKING_LOTS = [
  { id: 'pk-malioboro', name: 'Abu Bakar Ali Parking Ground', capacity: '150 cars, 500 motorbikes', lat: -7.7885, lng: 110.3658 },
  { id: 'pk-prambanan', name: 'Prambanan Main Temple Park', capacity: '300 cars, 100 buses', lat: -7.7525, lng: 110.4905 },
  { id: 'pk-depok', name: 'Parangtritis Marine Center Lot', capacity: '200 cars', lat: -7.0200, lng: 110.3200 }
];

const toRad = (deg: number) => (deg * Math.PI) / 180;
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function InteractiveMap({ onExploreDestination, selectedDestination }: InteractiveMapProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activeLayer, setActiveLayer] = useState<'all' | 'destinations' | 'partners' | 'transport'>('all');
  const [showTraffic, setShowTraffic] = useState(false);
  const [showParking, setShowParking] = useState(false);
  
  const [selectedPin, setSelectedPin] = useState<{ id: string; name: string; type: string; desc: string; data?: any } | null>(null);
  
  // Routing States
  const [routeTargetId, setRouteTargetId] = useState<string>('');
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number; isRushHour: boolean } | null>(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  // Leaflet Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);

  // Fetch Destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await destinationApi.getAll();
        const data = (response as any).data || (response as any);
        setDestinations(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to fetch destinations:", e);
      }
    };
    fetchDestinations();
  }, []);

  // Initialize Leaflet Map Client-Side
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Load leaflet dynamically to prevent SSR failure
    import('leaflet').then((L) => {
      leafletModuleRef.current = L;

      const container = mapContainerRef.current;
      if (!container) return;

      // Create map instance
      const map = L.map(container, {
        center: [-7.7956, 110.3695], // Jogja City Center
        zoom: 11,
        scrollWheelZoom: true,
      });

      // CartoDB Voyager map tiles (premium-looking clean light style)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CartoDB',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      // Layer groups for markers
      const markerGroup = L.layerGroup().addTo(map);
      markerGroupRef.current = markerGroup;
      mapInstanceRef.current = map;

      // Trigger redraw when layers change
      renderMarkers();
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [destinations, activeLayer, showParking]);

  // Handle selected destination prop updates
  useEffect(() => {
    if (selectedDestination && mapInstanceRef.current) {
      mapInstanceRef.current.setView([selectedDestination.latitude, selectedDestination.longitude], 13);
      setSelectedPin({
        id: selectedDestination.id,
        name: selectedDestination.name,
        type: 'destination',
        desc: selectedDestination.tagline,
        data: selectedDestination
      });
    }
  }, [selectedDestination]);

  // Clean or draw route when route target changes
  useEffect(() => {
    if (!routeTargetId || !selectedPin || selectedPin.type !== 'destination') {
      clearRoute();
      return;
    }
    drawRoute();
  }, [routeTargetId, selectedPin]);

  const clearRoute = () => {
    if (routePolylineRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
    setRouteInfo(null);
  };

  // Draw OSRM route on map
  const drawRoute = async () => {
    if (!selectedPin || !routeTargetId || !mapInstanceRef.current || !leafletModuleRef.current) return;
    const fromDest = selectedPin.data;
    const toDest = destinations.find(d => d.id === routeTargetId);

    if (!fromDest || !toDest) return;

    setRoutingLoading(true);
    clearRoute();

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromDest.longitude},${fromDest.latitude};${toDest.longitude},${toDest.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const distanceKm = route.distance / 1000;
        let durationMin = route.duration / 60;

        // Peak hour traffic simulation (+15 mins during 07:00-09:00 or 16:30-19:00 local time)
        const localHour = new Date().getHours();
        const localMin = new Date().getMinutes();
        const decHour = localHour + localMin / 60;
        const isRushHour = (decHour >= 7 && decHour <= 9) || (decHour >= 16.5 && decHour <= 19);

        if (isRushHour) {
          durationMin += 15;
        }

        setRouteInfo({ distanceKm, durationMin, isRushHour });

        // Draw geojson line on map
        const L = leafletModuleRef.current;
        const polyline = L.geoJSON(route.geometry, {
          style: {
            color: '#cb8527', // Gold brand color
            weight: 5,
            opacity: 0.85
          }
        }).addTo(mapInstanceRef.current);

        routePolylineRef.current = polyline;

        // Auto pan map to show the whole route
        mapInstanceRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }
    } catch (e) {
      console.error("OSRM Routing failed:", e);
    } finally {
      setRoutingLoading(false);
    }
  };

  // Render Markers
  const renderMarkers = () => {
    const L = leafletModuleRef.current;
    const markerGroup = markerGroupRef.current;
    const map = mapInstanceRef.current;
    if (!L || !markerGroup || !map) return;

    markerGroup.clearLayers();

    // 1. Render Destinations
    if (activeLayer === 'all' || activeLayer === 'destinations') {
      destinations.forEach(dest => {
        const isSelected = selectedPin?.id === dest.id;
        const destIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div class="flex flex-col items-center">
              <div class="flex h-9 w-9 items-center justify-center rounded-full shadow-md border transition-transform duration-300 ${
                isSelected 
                  ? 'bg-gold-600 text-gold-50 border-gold-300 scale-110' 
                  : 'bg-royal-950 text-gold-300 border-gold-500/20'
              }">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <span class="mt-0.5 font-manrope font-bold text-[8.5px] text-royal-950 bg-white/95 backdrop-blur-sm border border-gold-200 px-1.5 py-0.5 rounded-full shadow-sm whitespace-nowrap">
                ${dest.name}
              </span>
            </div>
          `,
          iconSize: [40, 50],
          iconAnchor: [20, 45]
        });

        const marker = L.marker([dest.latitude, dest.longitude], { icon: destIcon });
        marker.on('click', () => {
          setSelectedPin({
            id: dest.id,
            name: dest.name,
            type: 'destination',
            desc: dest.tagline,
            data: dest
          });
          map.setView([dest.latitude, dest.longitude], 13);
        });
        marker.addTo(markerGroup);
      });
    }

    // 2. Render Ecosystem Partners
    if (activeLayer === 'all' || activeLayer === 'partners') {
      destinations.flatMap(d => d.partners || []).forEach(partner => {
        if (!partner.coordinates?.lat || !partner.coordinates?.lng) return;

        const partnerIcon = L.divIcon({
          className: 'custom-leaflet-partner-marker',
          html: `
            <div class="flex h-5 w-5 items-center justify-center rounded-full bg-gold-400 text-royal-950 border border-gold-600 shadow-sm hover:scale-110 transition-transform">
              <span class="text-[8px] font-extrabold font-mono">P</span>
            </div>
          `,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([partner.coordinates.lat, partner.coordinates.lng], { icon: partnerIcon });
        marker.on('click', () => {
          setSelectedPin({
            id: partner.id,
            name: partner.name,
            type: 'partner',
            desc: partner.description,
            data: partner
          });
        });
        marker.addTo(markerGroup);
      });
    }

    // 3. Render Transport Hubs
    if (activeLayer === 'all' || activeLayer === 'transport') {
      TRANSPORTATION_HUBS.forEach(hub => {
        const transportIcon = L.divIcon({
          className: 'custom-leaflet-transport-marker',
          html: `
            <div class="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white border border-slate-600 shadow-md hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bus"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M4 18V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9"/><path d="M14 18H10"/><circle cx="6.5" cy="18" r="1.5"/><circle cx="17.5" cy="18" r="1.5"/></svg>
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        const marker = L.marker([hub.lat, hub.lng], { icon: transportIcon });
        marker.on('click', () => {
          setSelectedPin({
            id: hub.id,
            name: hub.name,
            type: 'transport',
            desc: `Central transport node connecting Yogyakarta tourism hubs.`
          });
        });
        marker.addTo(markerGroup);
      });
    }

    // 4. Render Parking Lots
    if (showParking) {
      PARKING_LOTS.forEach(pk => {
        const parkingIcon = L.divIcon({
          className: 'custom-leaflet-parking-marker',
          html: `
            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white border border-blue-400 shadow-md">
              <span class="text-[9px] font-bold font-mono">P</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([pk.lat, pk.lng], { icon: parkingIcon });
        marker.on('click', () => {
          setSelectedPin({
            id: pk.id,
            name: pk.name,
            type: 'parking',
            desc: `Public authorized vehicle parking lot. Space: ${pk.capacity}.`
          });
        });
        marker.addTo(markerGroup);
      });
    }
  };

  return (
    <div id="interactive-tourism-map" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in scroll-mt-20">
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Left Column: Leaflet Map */}
        <div className="flex-1 rounded-3xl border border-gold-100 bg-gold-50/20 overflow-hidden relative shadow-lg flex flex-col h-[70vh] min-h-[500px]">
          
          {/* Layer and Traffic Overlay controls on map */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2 pointer-events-auto">
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
          </div>

          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-gold-100 shadow-md pointer-events-auto">
            <span className="text-[9px] font-mono font-bold text-royal-700 uppercase tracking-wider mb-1 block text-center">Layers</span>
            {[
              { id: 'all', label: 'All Items' },
              { id: 'destinations', label: 'Destinations' },
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

          {/* Leaflet DOM Node */}
          <div ref={mapContainerRef} className="w-full h-full z-0 bg-stone-100" />
        </div>

        {/* Right Column: Selected Node Sidebar Panel */}
        <div className="w-full lg:w-96 rounded-3xl border border-gold-100 bg-white p-5 flex flex-col justify-between shadow-md space-y-4">
          <div>
            <div className="flex items-center space-x-2 border-b border-gold-100 pb-3">
              <MapIcon className="h-5 w-5 text-gold-600 animate-pulse" />
              <h3 className="font-manrope text-base font-bold text-royal-950">Map Exploration Panel</h3>
            </div>
            
            <p className="text-xs text-royal-700/70 font-light mt-2">
              Select any pin on the map to coordinate travel routes, check parking, or find nearby hospitality partners.
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

                {/* Routing Tool (Available for Destinations) */}
                {selectedPin.type === 'destination' && selectedPin.data && (
                  <div className="space-y-3.5 border-t border-gold-50 pt-3.5">
                    
                    {/* Destination statistics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg border border-stone-100">
                        <span className="text-stone-500 font-mono text-[10px]">Price:</span>
                        <span className="font-bold text-stone-900">{selectedPin.data.ticketPrice}</span>
                      </div>
                      <div className="flex justify-between items-center bg-stone-50 p-2 rounded-lg border border-stone-100">
                        <span className="text-stone-500 font-mono text-[10px]">Rating:</span>
                        <span className="font-bold text-stone-900 flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                          {selectedPin.data.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Routing selector */}
                    <div className="bg-gold-50/30 border border-gold-100/50 rounded-2xl p-3.5 space-y-2.5">
                      <label className="block text-[10px] font-mono font-bold text-stone-600 uppercase tracking-wider">
                        🚙 Get Directions / Route To:
                      </label>
                      <select
                        value={routeTargetId}
                        onChange={e => setRouteTargetId(e.target.value)}
                        className="w-full text-xs bg-white border border-stone-200 p-2 rounded-xl focus:outline-none focus:border-gold-500 font-manrope font-medium"
                      >
                        <option value="">-- Choose Target Destination --</option>
                        {destinations
                          .filter(d => d.id !== selectedPin.id)
                          .map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))
                        }
                      </select>

                      {routingLoading && (
                        <div className="text-[10px] text-stone-500 font-mono flex items-center justify-center gap-1 py-1">
                          <RefreshCw className="h-3 w-3 animate-spin text-gold-600" />
                          <span>Generating OSRM Driving Route...</span>
                        </div>
                      )}

                      {/* Route metrics display */}
                      {routeInfo && (
                        <div className="space-y-2 animate-fade-in">
                          <div className="flex justify-between items-center text-xs font-mono border-b border-stone-100 pb-1.5 mt-1">
                            <span className="text-stone-500">Driving Distance:</span>
                            <span className="font-bold text-stone-900">{routeInfo.distanceKm.toFixed(1)} km</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-xs font-mono border-b border-stone-100 pb-1.5">
                            <span className="text-stone-500">Est. Duration:</span>
                            <span className="font-bold text-stone-900">{Math.round(routeInfo.durationMin)} mins</span>
                          </div>

                          {routeInfo.isRushHour && (
                            <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-xl text-[10px] leading-relaxed flex items-start gap-1.5">
                              <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span>
                                <strong>Rush Hour Peak Detected!</strong> Gamping-Malioboro or Solo road traffic expected (+15m delay estimated).
                              </span>
                            </div>
                          )}

                          <a
                            href={`https://www.google.com/maps/dir/?api=1&origin=${selectedPin.data.latitude},${selectedPin.data.longitude}&destination=${destinations.find(d => d.id === routeTargetId)?.latitude},${destinations.find(d => d.id === routeTargetId)?.longitude}&travelmode=driving`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-royal-950 text-white hover:bg-royal-900 text-[10px] font-bold tracking-wide transition-colors mt-2"
                          >
                            <span>Open Navigation Live on GMaps</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Jarak ke Destinasi Lain matrix */}
                    <div className="border-t border-stone-100 pt-3.5 space-y-2">
                      <span className="block text-[10px] font-mono font-bold text-stone-500 uppercase tracking-wider"> Jarak Geografis Lainnya:</span>
                      <div className="max-h-28 overflow-y-auto space-y-1.5 scrollbar-none pr-1">
                        {destinations
                          .filter(d => d.id !== selectedPin.id)
                          .map(d => {
                            const dist = calculateDistance(
                              selectedPin.data.latitude,
                              selectedPin.data.longitude,
                              d.latitude,
                              d.longitude
                            );
                            return (
                              <button
                                key={d.id}
                                onClick={() => setRouteTargetId(d.id)}
                                className="w-full flex justify-between items-center text-[10px] bg-stone-50 p-2 rounded-lg border border-stone-200/40 hover:border-gold-300 hover:bg-stone-100/50 transition-colors text-left"
                              >
                                <span className="text-stone-700 truncate max-w-[150px] font-medium">{d.name}</span>
                                <span className="font-mono font-bold text-gold-700 shrink-0">{dist.toFixed(1)} km</span>
                              </button>
                            );
                          })}
                      </div>
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
                        🎁 Exclusive Offer: {selectedPin.data.promotion}
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
                  Click on any of the destination, partner or transport pins on the map to display instant spatial information and generate routes.
                </span>
              </div>
            )}
          </div>

          <div className="bg-gold-50 border border-gold-100 rounded-2xl p-4 text-xs text-royal-700 font-light space-y-1.5">
            <h4 className="font-manrope font-bold text-xs text-royal-950">Grounded Tourist GPS Note</h4>
            <p className="leading-relaxed text-[10.5px]">
              Yogyakarta's core attractions are separated in natural subregions. GMaps redirect option displays active local street jams.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
