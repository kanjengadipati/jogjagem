import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

/**
 * GET /api/auth/session
 * Returns the access token from the httpOnly cookie so the client can
 * hydrate its in-memory auth state on page load / reload.
 */
export async function GET() {
  const token = await getSession();

  if (!token) {
    return NextResponse.json({ status: 'error', message: 'No session' }, { status: 401 });
  }

  return NextResponse.json({ status: 'success', data: { access_token: token } });
}
