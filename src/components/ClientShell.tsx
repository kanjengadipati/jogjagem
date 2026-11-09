'use client';

import { useEffect } from 'react';
import LocationPermissionModal from '@/components/LocationPermissionModal';
import App from '@/App';
import { installClientFetchPatch } from '@/lib/client-fetch';

export default function ClientShell() {
  useEffect(() => {
    installClientFetchPatch();
  }, []);
  return (
    <>
      <LocationPermissionModal />
      <App />
    </>
  );
}
