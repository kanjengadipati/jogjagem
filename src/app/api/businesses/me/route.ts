import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export async function GET() {
  return proxyToBackend('/businesses/me');
}
