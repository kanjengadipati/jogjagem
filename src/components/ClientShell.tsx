'use client';

import LocationPermissionModal from '@/components/LocationPermissionModal';
import App from '@/App';

export default function ClientShell() {
  return (
    <>
      <LocationPermissionModal />
      <App />
    </>
  );
}
