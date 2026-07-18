import { NextRequest, NextResponse } from 'next/server';
import { deleteSession, getSession } from '@/lib/session';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

export async function POST(req: NextRequest) {
  // Best-effort: tell the backend to invalidate the token
  const token = await getSession();
  if (token) {
    await fetch(`${BACKEND}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }

  await deleteSession();
  return NextResponse.json({ status: 'success' });
}
