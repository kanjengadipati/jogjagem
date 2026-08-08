import { NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '@/lib/api-proxy';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; inviteId: string }> }
) {
  const { id, inviteId } = await params;
  return proxyToBackend(`/businesses/me/${id}/members/invites/${inviteId}`, {
    method: 'DELETE',
  });
}
