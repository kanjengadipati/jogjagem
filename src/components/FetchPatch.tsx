'use client';

import { useEffect } from 'react';
import { installClientFetchPatch } from '@/lib/client-fetch';

export default function FetchPatch() {
  useEffect(() => {
    installClientFetchPatch();
  }, []);
  return null;
}