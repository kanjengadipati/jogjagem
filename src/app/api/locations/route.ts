import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/pleco';

export async function GET() {
  const res = await fetch(`${API_BASE}/locations`, { next: { revalidate: 3600 } });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
