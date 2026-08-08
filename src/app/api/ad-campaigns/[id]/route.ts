import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/ads/campaigns/${id}`);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  return proxyToBackend(`/ads/campaigns/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/ads/campaigns/${id}`, { method: 'DELETE' });
}
