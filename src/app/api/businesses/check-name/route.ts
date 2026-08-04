import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/pleco';

export async function GET(req: NextRequest) {
  const token = await getSession();
  const q = req.nextUrl.searchParams.get('q') ?? '';
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(
    `${API_BASE}/businesses/check-name?q=${encodeURIComponent(q)}`,
    { headers }
  );
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
