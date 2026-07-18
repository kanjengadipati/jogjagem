'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Map, Navigation } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import { useLocale } from '@/contexts/LocaleContext';

export default function NearbyMapCard() {
  const router = useRouter();
  const { coords, permission, requestLocation } = useLocation();
  const { t } = useLocale();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    if (!coords || !mapRef.current || mapInstance.current) return;

    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current || mapInstance.current) return;

      const map = L.map(mapRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
        dragging: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        touchZoom: false,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      const userIcon = L.divIcon({
        className: 'nearby-map-user-marker',
        html: `
          <div style="position:relative;display:flex;align-items:center;justify-content:center;width:24px;height:24px">
            <span style="position:absolute;width:24px;height:24px;border-radius:50%;background:rgba(203,133,39,.2);animation:nearby-ping 1.5s cubic-bezier(0,0,.2,1) infinite"></span>
            <span style="position:relative;width:10px;height:10px;border-radius:50%;background:#cb8527;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.3)"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([coords.lat, coords.lng], { icon: userIcon }).addTo(map);
      mapInstance.current = map;
    });

    return () => {
      cancelled = true;
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [coords]);

  if (permission === 'denied') return null;

  return (
    <>
      <style>{`
        @keyframes nearby-ping {
          75%, 100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
      <button
        onClick={() => coords ? router.push('/map') : requestLocation()}
        className="w-full group relative overflow-hidden rounded-2xl border border-gold-500/30 bg-royal-950 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer text-left"
      >
        <div className="relative h-[140px] w-full overflow-hidden">
          {coords ? (
            <div ref={mapRef} className="absolute inset-0" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-royal-800 to-royal-950 flex items-center justify-center">
              <Navigation className="h-6 w-6 text-gold-400/40" />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" style={{ zIndex: 450 }} />

          <div className="absolute top-2 left-2 bg-gold-500 border border-gold-400/10 px-2 py-0.5 rounded-full text-[8px] font-sans font-semibold text-white uppercase tracking-[0.08em] flex items-center gap-1" style={{ zIndex: 450 }}>
            <Map className="h-2 w-2" />
            {coords ? t('nearby_map.badge_near') : t('nearby_map.badge_enable')}
          </div>

          <div className="absolute bottom-2 right-2 h-6 w-6 rounded-full bg-gold-400 text-royal-950 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300" style={{ zIndex: 450 }}>
            <svg className="h-3 w-3 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="3">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-2.5 flex flex-col justify-end text-left" style={{ zIndex: 450 }}>
            <h3 className="font-manrope text-[11px] font-bold text-white leading-tight group-hover:text-gold-300 transition-colors drop-shadow">
              {t('nearby_map.heading')}
            </h3>
            <p className="text-[9px] text-white/70 mt-0.5 drop-shadow">
              {coords ? t('nearby_map.description') : t('nearby_map.tap_enable')}
            </p>
          </div>
        </div>
      </button>
    </>
  );
}
