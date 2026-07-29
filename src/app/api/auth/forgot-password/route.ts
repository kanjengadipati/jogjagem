import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const backendRes = await fetch(`${BACKEND}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await backendRes.json().catch(() => ({}));

    if (!backendRes.ok) {
      return NextResponse.json(
        { status: 'error', message: data?.message || 'Failed to send reset email' },
        { status: backendRes.status || 500 },
      );
    }

    return NextResponse.json({ status: 'success', message: data?.message || 'Reset link sent' });
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Network error' },
      { status: 500 },
    );
  }
}
