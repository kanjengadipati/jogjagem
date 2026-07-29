import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

export async function POST(req: NextRequest) {
  try {
    const { token, new_password } = await req.json();

    const backendRes = await fetch(`${BACKEND}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, new_password }),
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        { status: 'error', message: data?.message || 'Failed to reset password' },
        { status: backendRes.status || 400 },
      );
    }

    return NextResponse.json({ status: 'success', message: data?.message || 'Password updated' });
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Network error' },
      { status: 500 },
    );
  }
}
