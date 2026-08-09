import { NextRequest } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export async function GET(_req: NextRequest) {
  return proxyToBackend('/ads/pricing');
}
