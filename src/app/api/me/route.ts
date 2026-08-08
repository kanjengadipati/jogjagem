import { NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export async function GET() {
  return proxyToBackend('/auth/profile');
}

export async function PATCH(req: Request) {
  const body = await req.json().catch(() => ({}));
  return proxyToBackend('/auth/profile', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
