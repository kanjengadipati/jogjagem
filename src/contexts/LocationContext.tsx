'use client';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'explore_jogja_location_v1';

interface LocationData {
  status: 'granted' | 'denied';
  coords?: { lat: number; lng: number };
}

interface LocationContextType {
  coords: { lat: number; lng: number } | null;
  permission: 'granted' | 'prompt' | 'denied';
  hasPrompted: boolean;
  requestLocation: () => Promise<void>;
  dismissPrompt: () => void;
}

const LocationContext = createContext<LocationContextType>({
  coords: null,
  permission: 'prompt',
  hasPrompted: false,
  requestLocation: async () => {},
  dismissPrompt: () => {},
});

function readStorage(): LocationData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStorage(data: LocationData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export const LocationProvider = ({ children }: { children: React.ReactNode }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [permission, setPermission] = useState<'granted' | 'prompt' | 'denied'>('prompt');
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    const saved = readStorage();
    if (saved) {
      setPermission(saved.status);
      setHasPrompted(true);
      if (saved.status === 'granted' && saved.coords) {
        setCoords(saved.coords);
      }
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) return;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const newCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setCoords(newCoords);
      setPermission('granted');
      setHasPrompted(true);
      writeStorage({ status: 'granted', coords: newCoords });
    } catch {
      setPermission('denied');
      setHasPrompted(true);
      writeStorage({ status: 'denied' });
    }
  }, []);

  const dismissPrompt = useCallback(() => {
    setPermission('denied');
    setHasPrompted(true);
    writeStorage({ status: 'denied' });
  }, []);

  return (
    <LocationContext.Provider value={{ coords, permission, hasPrompted, requestLocation, dismissPrompt }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => useContext(LocationContext);
