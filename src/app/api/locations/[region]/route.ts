import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/pleco';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ region: string }> }
) {
  const { region } = await params;
  const lang = req.headers.get('Accept-Language') ?? 'id';
  const res = await fetch(`${API_BASE}/locations/${encodeURIComponent(region)}`, {
    headers: { 'Accept-Language': lang },
    next: { revalidate: 3600 },
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
