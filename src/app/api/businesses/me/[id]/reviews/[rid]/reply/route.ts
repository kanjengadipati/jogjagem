import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; rid: string }> }
) {
  const { id, rid } = await params;
  const body = await req.json().catch(() => ({}));
  return proxyToBackend(`/businesses/me/${id}/reviews/${rid}/reply`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
