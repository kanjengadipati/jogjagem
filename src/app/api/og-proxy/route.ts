import { NextRequest, NextResponse } from 'next/server';

// Domains we trust to proxy (prevents open-redirect abuse)
const ALLOWED_DOMAINS = [
  'upload.wikimedia.org',
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'res.cloudinary.com',
  'i.imgur.com',
  'cdn.discordapp.com',
  'storage.googleapis.com',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing url param', { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  if (!ALLOWED_DOMAINS.includes(parsed.hostname)) {
    return new NextResponse('Domain not allowed', { status: 403 });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Jogjagem-OG-Proxy/1.0' },
      next: { revalidate: 86400 }, // cache 24h
    });

    if (!res.ok) {
      return new NextResponse('Upstream error', { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        'X-Proxy-Source': parsed.hostname,
      },
    });
  } catch {
    return new NextResponse('Proxy error', { status: 502 });
  }
}
