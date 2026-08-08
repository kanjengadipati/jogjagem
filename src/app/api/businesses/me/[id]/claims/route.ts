import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return proxyToBackend(`/listing-claims/me?business_external_id=${id}`);
}
