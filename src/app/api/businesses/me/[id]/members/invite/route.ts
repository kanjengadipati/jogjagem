import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return proxyToBackend(`/businesses/me/${id}/members/invite`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
