import 'server-only';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'pleco_session';
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

export async function getSession(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function createSession(accessToken: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: MAX_AGE,
    path: '/',
  });
}

export async function deleteSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
