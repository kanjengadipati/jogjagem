import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; campaignId: string }> }
) {
  const { id, campaignId } = await params;
  const body = await req.json().catch(() => ({}));
  return proxyToBackend(`/businesses/me/${id}/ad-campaigns/${campaignId}/invoice`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
