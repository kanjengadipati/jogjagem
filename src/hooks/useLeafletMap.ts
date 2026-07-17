'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseLeafletMapOptions {
  center?: [number, number];
  zoom?: number;
  scrollWheelZoom?: boolean;
  zoomControl?: boolean;
  zoomControlPosition?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
}

interface UseLeafletMapReturn {
  mapRef: React.RefObject<HTMLDivElement | null>;
  mapInstance: React.MutableRefObject<any>;
  leafletRef: React.MutableRefObject<any>;
  markerGroup: React.MutableRefObject<any>;
  whenReady: (callback: (L: any, map: any) => void) => void;
}

export function useLeafletMap(options: UseLeafletMapOptions = {}): UseLeafletMapReturn {
  const {
    center = [-7.7956, 110.3695],
    zoom = 11,
    scrollWheelZoom = true,
    zoomControl = true,
    zoomControlPosition = 'bottomright',
  } = options;

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markerGroup = useRef<any>(null);
  const readyCallbacksRef = useRef<((L: any, map: any) => void)[]>([]);

  const whenReady = useCallback((callback: (L: any, map: any) => void) => {
    if (leafletRef.current && mapInstance.current) {
      callback(leafletRef.current, mapInstance.current);
    } else {
      readyCallbacksRef.current.push(callback);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    import('leaflet').then((L) => {
      leafletRef.current = L;
      const container = mapRef.current;
      if (!container) return;

      // Remove existing map if container already has one
      if ((container as any)._leaflet_id) {
        mapInstance.current?.remove();
        mapInstance.current = null;
      }

      const map = L.map(container, {
        center,
        zoom,
        scrollWheelZoom,
        zoomControl,
      });

      if (zoomControl) {
        L.control.zoom({ position: zoomControlPosition }).addTo(map);
      }

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CartoDB',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      const markers = L.layerGroup().addTo(map);
      markerGroup.current = markers;
      mapInstance.current = map;

      // Fire pending ready callbacks
      readyCallbacksRef.current.forEach((cb) => cb(L, map));
      readyCallbacksRef.current = [];
    });

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  // Only run on mount/unmount — center/zoom are initial values
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { mapRef, mapInstance, leafletRef, markerGroup, whenReady };
}
