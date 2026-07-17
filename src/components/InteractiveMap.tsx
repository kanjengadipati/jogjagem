'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Map as MapIcon, MapPin, Eye, Layers, RefreshCw, Car, Flame,
  Compass, Navigation, Bus, Star, ExternalLink, ShieldAlert,
  X, ChevronUp, ChevronDown, Locate,
} from 'lucide-react';
import { Destination } from '../types';
import { destinations as destinationApi } from '../lib/api';
import { useLocation } from '../contexts/LocationContext';
import { useLeafletMap } from '../hooks/useLeafletMap';

interface InteractiveMapProps {
  onExploreDestination: (dest: Destination) => void;
  selectedDestination?: Destination | null;
}

const TRANSPORTATION_HUBS = [
  { id: 't-tugu', name: 'Yogyakarta Tugu Station', type: 'rail', lat: -7.7891, lng: 110.3634 },
  { id: 't-lempuyangan', name: 'Lempuyangan Station', type: 'rail', lat: -7.7900, lng: 110.3750 },
  { id: 't-giwangan', name: 'Giwangan Terminal', type: 'bus', lat: -7.8341, lng: 110.3925 },
];

const PARKING_LOTS = [
  { id: 'pk-malioboro', name: 'Abu Bakar Ali Parking', capacity: '150 cars, 500 motorbikes', lat: -7.7885, lng: 110.3658 },
  { id: 'pk-prambanan', name: 'Prambanan Temple Park', capacity: '300 cars, 100 buses', lat: -7.7525, lng: 110.4905 },
  { id: 'pk-depok', name: 'Parangtritis Marine Center', capacity: '200 cars', lat: -7.0200, lng: 110.3200 },
];

const toRad = (deg: number) => (deg * Math.PI) / 180;
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

type LayerFilter = 'all' | 'destinations' | 'transport';

export default function InteractiveMap({ onExploreDestination, selectedDestination }: InteractiveMapProps) {
  const { coords } = useLocation();
  const { mapRef, mapInstance, leafletRef, markerGroup, whenReady } = useLeafletMap({
    center: [-7.7956, 110.3695],
    zoom: 11,
    scrollWheelZoom: true,
    zoomControlPosition: 'bottomright',
  });

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [activeLayer, setActiveLayer] = useState<LayerFilter>('all');
  const [showParking, setShowParking] = useState(false);

  // Ensure markers render even if API data arrives before Leaflet finishes loading
  useEffect(() => {
    whenReady(() => renderMarkers());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedPin, setSelectedPin] = useState<{
    id: string; name: string; type: string; desc: string; data?: any;
  } | null>(null);

  // Routing
  const [routeTargetId, setRouteTargetId] = useState('');
  const [routeInfo, setRouteInfo] = useState<{
    distanceKm: number; durationMin: number; isRushHour: boolean;
  } | null>(null);
  const [routingLoading, setRoutingLoading] = useState(false);

  // Mobile bottom sheet
  const [sheetOpen, setSheetOpen] = useState(false);

  const routePolylineRef = useRef<any>(null);

  // Re-render markers when dependencies change
  useEffect(() => {
    if (leafletRef.current && markerGroup.current && mapInstance.current) {
      renderMarkers();
    }
  }, [destinations, activeLayer, showParking, selectedPin]);

  useEffect(() => {
    if (selectedDestination && mapInstance.current) {
      mapInstance.current.setView(
        [selectedDestination.latitude, selectedDestination.longitude], 13,
      );
      setSelectedPin({
        id: selectedDestination.id,
        name: selectedDestination.name,
        type: 'destination',
        desc: selectedDestination.tagline,
        data: selectedDestination,
      });
      setSheetOpen(true);
    }
  }, [selectedDestination]);

  useEffect(() => {
    if (!routeTargetId) { clearRoute(); return; }
    drawRoute();
  }, [routeTargetId, coords]);

  useEffect(() => {
    destinationApi.getAll().then((res) => {
      const data = (res as any).data || res;
      setDestinations(Array.isArray(data) ? data : []);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!routeTargetId) { clearRoute(); return; }
    drawRoute();
  }, [routeTargetId, coords]);

  const clearRoute = () => {
    if (routePolylineRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(routePolylineRef.current);
      routePolylineRef.current = null;
    }
    setRouteInfo(null);
  };

  const drawRoute = async () => {
    if (!routeTargetId || !mapInstance.current || !leafletRef.current) return;

    const fromDest = coords
      ? { latitude: coords.lat, longitude: coords.lng }
      : (selectedPin?.data ? selectedPin.data : null);
    const toDest = destinations.find((d) => d.id === routeTargetId);
    if (!fromDest || !toDest) return;

    setRoutingLoading(true);
    clearRoute();

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromDest.longitude},${fromDest.latitude};${toDest.longitude},${toDest.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes?.length > 0) {
        const route = data.routes[0];
        const distanceKm = route.distance / 1000;
        let durationMin = route.duration / 60;

        const localHour = new Date().getHours();
        const localMin = new Date().getMinutes();
        const decHour = localHour + localMin / 60;
        const isRushHour = (decHour >= 7 && decHour <= 9) || (decHour >= 16.5 && decHour <= 19);
        if (isRushHour) durationMin += 15;

        setRouteInfo({ distanceKm, durationMin, isRushHour });

        const L = leafletRef.current;
        const polyline = L.geoJSON(route.geometry, {
          style: { color: '#cb8527', weight: 5, opacity: 0.85 },
        }).addTo(mapInstance.current);

        polyline.eachLayer((layer: any) => {
          if (layer.getElement) {
            layer.getElement()?.classList.add('route-animated');
          }
        });

        routePolylineRef.current = polyline;
        mapInstance.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
      }
    } catch (e) {
      console.error('OSRM Routing failed:', e);
    } finally {
      setRoutingLoading(false);
    }
  };

  const renderMarkers = () => {
    const L = leafletRef.current;
    const markers = markerGroup.current;
    const map = mapInstance.current;
    if (!L || !markers || !map) return;

    markers.clearLayers();

    // Destinations
    if (activeLayer === 'all' || activeLayer === 'destinations') {
      destinations.forEach((dest) => {
        const isSelected = selectedPin?.id === dest.id;
        const destIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `
            <div style="display:flex;flex-direction:column;align-items:center">
              <div style="display:flex;height:36px;width:36px;align-items:center;justify-content:center;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.25);border:2px solid ${isSelected ? '#cb8527' : 'rgba(255,255,255,.9)'};background:${isSelected ? '#cb8527' : '#1C1A17'};color:${isSelected ? '#fff' : '#d4a853'};transform:${isSelected ? 'scale(1.15)' : 'scale(1)'};transition:all .2s">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              ${isSelected ? `<span style="margin-top:3px;font-family:'Manrope',sans-serif;font-weight:800;font-size:9px;color:#1C1A17;background:rgba(255,255,255,.95);backdrop-filter:blur(4px);padding:2px 7px;border-radius:20px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.1);border:1px solid #f5e6c8">${dest.name}</span>` : ''}
            </div>
          `,
          iconSize: [40, isSelected ? 60 : 40],
          iconAnchor: [20, isSelected ? 55 : 36],
        });

        const marker = L.marker([dest.latitude, dest.longitude], { icon: destIcon });
        marker.on('click', () => {
          setSelectedPin({ id: dest.id, name: dest.name, type: 'destination', desc: dest.tagline, data: dest });
          map.setView([dest.latitude, dest.longitude], 13);
          setSheetOpen(true);
        });
        marker.addTo(markers);
      });
    }

    // Partners
    if (activeLayer === 'all' || activeLayer === 'destinations') {
      destinations.flatMap((d) => d.partners || []).forEach((partner) => {
        if (!partner.coordinates?.lat || !partner.coordinates?.lng) return;
        const icon = L.divIcon({
          className: 'custom-partner-marker',
          html: `<div style="display:flex;height:22px;width:22px;align-items:center;justify-content:center;border-radius:50%;background:#d4a853;color:#1C1A17;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.2);font-size:9px;font-weight:900;font-family:monospace">P</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        const marker = L.marker([partner.coordinates.lat, partner.coordinates.lng], { icon });
        marker.on('click', () => {
          setSelectedPin({ id: partner.id, name: partner.name, type: 'partner', desc: partner.description, data: partner });
          setSheetOpen(true);
        });
        marker.addTo(markers);
      });
    }

    // Transport
    if (activeLayer === 'all' || activeLayer === 'transport') {
      TRANSPORTATION_HUBS.forEach((hub) => {
        const icon = L.divIcon({
          className: 'custom-transport-marker',
          html: `<div style="display:flex;height:28px;width:28px;align-items:center;justify-content:center;border-radius:50%;background:#334155;color:#fff;border:2px solid #64748b;box-shadow:0 2px 6px rgba(0,0,0,.25)"><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M16 6v6"/><path d="M4 18V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v9"/><path d="M14 18H10"/><circle cx="6.5" cy="18" r="1.5"/><circle cx="17.5" cy="18" r="1.5"/></svg></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const marker = L.marker([hub.lat, hub.lng], { icon });
        marker.on('click', () => {
          setSelectedPin({ id: hub.id, name: hub.name, type: 'transport', desc: `${hub.type === 'rail' ? 'Railway' : 'Bus'} station serving Yogyakarta.` });
          setSheetOpen(true);
        });
        marker.addTo(markers);
      });
    }

    // Parking
    if (showParking) {
      PARKING_LOTS.forEach((pk) => {
        const icon = L.divIcon({
          className: 'custom-parking-marker',
          html: `<div style="display:flex;height:24px;width:24px;align-items:center;justify-content:center;border-radius:50%;background:#2563eb;color:#fff;border:2px solid #60a5fa;box-shadow:0 1px 4px rgba(0,0,0,.2);font-size:10px;font-weight:800;font-family:monospace">P</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const marker = L.marker([pk.lat, pk.lng], { icon });
        marker.on('click', () => {
          setSelectedPin({ id: pk.id, name: pk.name, type: 'parking', desc: pk.capacity });
          setSheetOpen(true);
        });
        marker.addTo(markers);
      });
    }
  };

  const flyToUser = () => {
    if (coords && mapInstance.current) {
      mapInstance.current.setView([coords.lat, coords.lng], 14);
    }
  };

  const layerOptions: { id: LayerFilter; label: string; icon: typeof MapPin }[] = [
    { id: 'all', label: 'All', icon: Layers },
    { id: 'destinations', label: 'Places', icon: MapPin },
    { id: 'transport', label: 'Transport', icon: Bus },
  ];

  return (
    <div className="relative w-full h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] lg:h-[calc(100vh-100px)] min-h-[400px] bg-stone-100 overflow-hidden rounded-2xl md:rounded-3xl border border-stone-200/60 shadow-lg">
      {/* ── Map Container ── */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* ── Floating Controls (Top Left) ── */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {/* Layer pills */}
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-stone-200/60 p-1 flex gap-0.5">
          {layerOptions.map((l) => (
            <button
              key={l.id}
              onClick={() => setActiveLayer(l.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all ${
                activeLayer === l.id
                  ? 'bg-royal-950 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <l.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{l.label}</span>
            </button>
          ))}
        </div>

        {/* Parking toggle */}
        <button
          onClick={() => setShowParking(!showParking)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all shadow-sm border ${
            showParking
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white/95 backdrop-blur-md text-stone-600 border-stone-200/60 hover:bg-stone-50'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Parking</span>
        </button>
      </div>

      {/* ── User Location Button ── */}
      <button
        onClick={flyToUser}
        className="absolute bottom-20 md:bottom-4 right-3 z-10 w-10 h-10 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-stone-200/60 flex items-center justify-center text-stone-600 hover:text-royal-950 hover:bg-white transition-all"
      >
        <Locate className="w-4.5 h-4.5" />
      </button>

      {/* ── Desktop Sidebar ── */}
      <div className="hidden lg:flex absolute top-3 right-3 bottom-3 z-10 w-80 flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-stone-200/60 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gold-50 rounded-xl">
              <MapIcon className="w-4 h-4 text-gold-600" />
            </div>
            <div>
              <h3 className="font-manrope text-sm font-bold text-royal-950">Explore Map</h3>
              <p className="text-[10px] text-stone-400">Click pins for details & routes</p>
            </div>
          </div>

          {/* Selected pin info */}
          {selectedPin ? (
            <div className="space-y-3 animate-fade-in">
              <span className="inline-block rounded-full bg-gold-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-700 border border-gold-200">
                {selectedPin.type}
              </span>

              <h4 className="font-manrope text-sm font-bold text-royal-950 leading-snug">{selectedPin.name}</h4>
              <p className="text-[11px] text-stone-500 leading-relaxed">{selectedPin.desc}</p>

              {/* Destination details */}
              {selectedPin.type === 'destination' && selectedPin.data && (
                <div className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                      <span className="text-[9px] text-stone-400 font-mono uppercase block">Price</span>
                      <span className="text-xs font-bold text-royal-950">{selectedPin.data.ticketPrice}</span>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                      <span className="text-[9px] text-stone-400 font-mono uppercase block">Rating</span>
                      <span className="text-xs font-bold text-royal-950 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                        {selectedPin.data.rating?.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* Route selector */}
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-2">
                    <label className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-wider block">
                      Route to:
                    </label>
                    <select
                      value={routeTargetId}
                      onChange={(e) => setRouteTargetId(e.target.value)}
                      className="w-full text-[11px] bg-white border border-stone-200 px-3 py-2 rounded-xl focus:outline-none focus:border-gold-500 font-medium"
                    >
                      <option value="">Choose destination</option>
                      {destinations
                        .filter((d) => d.id !== selectedPin.id)
                        .map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>

                    {routingLoading && (
                      <div className="text-[10px] text-stone-400 flex items-center justify-center gap-1 py-1">
                        <RefreshCw className="w-3 h-3 animate-spin text-gold-600" />
                        Calculating route...
                      </div>
                    )}

                    {routeInfo && (
                      <div className="space-y-2 animate-fade-in">
                        <div className="flex justify-between text-[11px] border-b border-stone-200/60 pb-1.5">
                          <span className="text-stone-400">Distance</span>
                          <span className="font-bold text-royal-950">{routeInfo.distanceKm.toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between text-[11px] border-b border-stone-200/60 pb-1.5">
                          <span className="text-stone-400">Duration</span>
                          <span className="font-bold text-royal-950">{Math.round(routeInfo.durationMin)} min</span>
                        </div>

                        {routeInfo.isRushHour && (
                          <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-xl text-[10px] leading-relaxed flex items-start gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span><strong>Rush hour</strong> — expect +15 min delay.</span>
                          </div>
                        )}

                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${selectedPin.data.latitude},${selectedPin.data.longitude}&destination=${destinations.find((d) => d.id === routeTargetId)?.latitude},${destinations.find((d) => d.id === routeTargetId)?.longitude}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-royal-950 text-white hover:bg-royal-900 text-[10px] font-bold transition-colors"
                        >
                          Open in Google Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Nearby destinations */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-mono font-bold text-stone-400 uppercase tracking-wider block">Nearby</span>
                    <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-none">
                      {destinations
                        .filter((d) => d.id !== selectedPin.id)
                        .sort((a, b) => {
                          const distA = calculateDistance(selectedPin.data.latitude, selectedPin.data.longitude, a.latitude, a.longitude);
                          const distB = calculateDistance(selectedPin.data.latitude, selectedPin.data.longitude, b.latitude, b.longitude);
                          return distA - distB;
                        })
                        .slice(0, 6)
                        .map((d) => {
                          const dist = calculateDistance(selectedPin.data.latitude, selectedPin.data.longitude, d.latitude, d.longitude);
                          return (
                            <button
                              key={d.id}
                              onClick={() => {
                                setRouteTargetId(d.id);
                                setSelectedPin({ id: d.id, name: d.name, type: 'destination', desc: d.tagline, data: d });
                              }}
                              className="w-full flex justify-between items-center text-[10px] bg-stone-50 p-2 rounded-lg border border-stone-100 hover:border-gold-300 hover:bg-gold-50/30 transition-colors text-left"
                            >
                              <span className="text-stone-700 truncate max-w-[140px] font-medium">{d.name}</span>
                              <span className="font-mono font-bold text-gold-700 shrink-0">{dist.toFixed(1)} km</span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  <button
                    onClick={() => onExploreDestination(selectedPin.data)}
                    className="w-full py-2.5 rounded-xl bg-gold-600 text-white text-[11px] font-bold hover:bg-gold-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                  >
                    View Full Details
                    <Compass className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Partner details */}
              {selectedPin.type === 'partner' && selectedPin.data && (
                <div className="bg-gold-50 rounded-xl p-3 border border-gold-100 space-y-2">
                  {selectedPin.data.image && (
                    <img src={selectedPin.data.image} alt={selectedPin.name} className="w-full h-20 object-cover rounded-lg" />
                  )}
                  <div>
                    <span className="text-[9px] font-mono text-gold-700 uppercase font-bold">{selectedPin.data.category}</span>
                    <span className="block text-[11px] font-bold text-royal-950">{selectedPin.data.name}</span>
                    {selectedPin.data.price && <span className="block text-[10px] font-mono text-stone-600">{selectedPin.data.price}</span>}
                  </div>
                  {selectedPin.data.promotion && (
                    <div className="bg-gold-500/10 border border-gold-300 rounded-lg p-2 text-[10px] font-mono text-gold-800 font-bold">
                      {selectedPin.data.promotion}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
              <MapPin className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-[11px] font-medium text-stone-500">Tap a pin to explore</p>
              <p className="text-[10px] text-stone-400 mt-0.5">Get directions, ratings & more</p>
            </div>
          )}
        </div>

        {/* GPS note */}
        <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50">
          <p className="text-[9px] text-stone-400 leading-relaxed">
            Yogyakarta attractions span across natural subregions. Use Google Maps redirect for real-time traffic.
          </p>
        </div>
      </div>

      {/* ── Mobile Bottom Sheet ── */}
      <div
        className={`lg:hidden absolute bottom-0 left-0 right-0 z-10 transition-transform duration-300 ease-out ${
          sheetOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'
        }`}
      >
        {/* Handle */}
        <button
          onClick={() => setSheetOpen(!sheetOpen)}
          className="w-full flex flex-col items-center pt-2 pb-1 bg-white/95 backdrop-blur-md rounded-t-2xl border-t border-stone-200/60"
        >
          <div className="w-8 h-1 bg-stone-300 rounded-full" />
          {selectedPin && !sheetOpen && (
            <div className="flex items-center gap-1.5 mt-1.5 px-3 pb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-500" />
              <span className="text-[11px] font-bold text-royal-950 truncate max-w-[200px]">{selectedPin.name}</span>
              <span className="text-[9px] text-stone-400 uppercase font-mono">{selectedPin.type}</span>
            </div>
          )}
        </button>

        {/* Content */}
        <div className="bg-white/95 backdrop-blur-md border-t border-stone-200/60 max-h-[55vh] overflow-y-auto p-4 space-y-3">
          {selectedPin ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block rounded-full bg-gold-100 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold-700 border border-gold-200">
                    {selectedPin.type}
                  </span>
                  <h4 className="font-manrope text-sm font-bold text-royal-950">{selectedPin.name}</h4>
                </div>
                <button onClick={() => { setSelectedPin(null); setSheetOpen(false); }} className="p-1 rounded-lg hover:bg-stone-100">
                  <X className="w-4 h-4 text-stone-400" />
                </button>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed">{selectedPin.desc}</p>

              {selectedPin.type === 'destination' && selectedPin.data && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                      <span className="text-[9px] text-stone-400 font-mono uppercase block">Price</span>
                      <span className="text-xs font-bold text-royal-950">{selectedPin.data.ticketPrice}</span>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100">
                      <span className="text-[9px] text-stone-400 font-mono uppercase block">Rating</span>
                      <span className="text-xs font-bold text-royal-950 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-gold-400 text-gold-400" />
                        {selectedPin.data.rating?.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 space-y-2">
                    <select
                      value={routeTargetId}
                      onChange={(e) => setRouteTargetId(e.target.value)}
                      className="w-full text-[11px] bg-white border border-stone-200 px-3 py-2 rounded-xl focus:outline-none focus:border-gold-500 font-medium"
                    >
                      <option value="">Route to...</option>
                      {destinations.filter((d) => d.id !== selectedPin.id).map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>

                    {routingLoading && (
                      <div className="text-[10px] text-stone-400 flex items-center justify-center gap-1 py-1">
                        <RefreshCw className="w-3 h-3 animate-spin text-gold-600" />
                        Calculating...
                      </div>
                    )}

                    {routeInfo && (
                      <div className="space-y-1.5 animate-fade-in">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-stone-400">Distance</span>
                          <span className="font-bold text-royal-950">{routeInfo.distanceKm.toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-stone-400">Duration</span>
                          <span className="font-bold text-royal-950">{Math.round(routeInfo.durationMin)} min</span>
                        </div>
                        {routeInfo.isRushHour && (
                          <div className="bg-red-50 border border-red-200 text-red-700 p-2 rounded-xl text-[10px] flex items-start gap-1.5">
                            <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span><strong>Rush hour</strong> — expect +15 min.</span>
                          </div>
                        )}
                        <a
                          href={`https://www.google.com/maps/dir/?api=1&origin=${selectedPin.data.latitude},${selectedPin.data.longitude}&destination=${destinations.find((d) => d.id === routeTargetId)?.latitude},${destinations.find((d) => d.id === routeTargetId)?.longitude}&travelmode=driving`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-royal-950 text-white text-[10px] font-bold"
                        >
                          Open in Google Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => onExploreDestination(selectedPin.data)}
                    className="w-full py-2.5 rounded-xl bg-gold-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5"
                  >
                    View Details <Compass className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {selectedPin.type === 'partner' && selectedPin.data && (
                <div className="bg-gold-50 rounded-xl p-3 border border-gold-100 space-y-2">
                  <span className="text-[9px] font-mono text-gold-700 uppercase font-bold">{selectedPin.data.category}</span>
                  <span className="block text-[11px] font-bold text-royal-950">{selectedPin.data.name}</span>
                  {selectedPin.data.price && <span className="block text-[10px] font-mono text-stone-600">{selectedPin.data.price}</span>}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <MapPin className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-[11px] font-medium text-stone-500">Tap a pin to explore</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
