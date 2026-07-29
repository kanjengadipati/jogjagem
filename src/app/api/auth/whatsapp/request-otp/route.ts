import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const backendRes = await fetch(`${BACKEND}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await backendRes.json().catch(() => ({}));
    if (!backendRes.ok) {
      return NextResponse.json(
        { status: 'error', message: data?.message || 'Unable to send OTP' },
        { status: backendRes.status || 400 }
      );
    }
    return NextResponse.json({ status: 'success', data });
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Network error' },
      { status: 500 }
    );
  }
}
