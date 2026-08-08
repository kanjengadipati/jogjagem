import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/pleco';

/**
 * Proxies a request to the backend using the httpOnly session cookie's access
 * token. Mirrors the admin portal's /api/businesses/* proxy routes so cloned
 * business-platform components can be ported with minimal changes.
 */
export async function proxyToBackend(
  path: string,
  options: RequestInit = {}
): Promise<NextResponse> {
  const token = await getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
