import { NextRequest, NextResponse } from 'next/server';
import { createSession } from '@/lib/session';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

export async function POST(req: NextRequest) {
  // Forward the request including cookies so the backend can read its refresh cookie
  const res = await fetch(`${BACKEND}/auth/refresh`, {
    method: 'POST',
    headers: { Cookie: req.headers.get('cookie') || '' },
    credentials: 'include',
  }).catch(() => null);

  if (!res || !res.ok) {
    return NextResponse.json({ status: 'error', message: 'Refresh failed' }, { status: 401 });
  }

  const data = await res.json().catch(() => ({}));

  if (data?.data?.access_token) {
    await createSession(data.data.access_token);
  }

  return NextResponse.json({ status: 'success', data: data.data });
}
