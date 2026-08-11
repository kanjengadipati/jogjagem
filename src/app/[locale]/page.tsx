import { Suspense } from 'react';
import ClientShell from '@/components/ClientShell';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

if (!process.env.NEXT_PUBLIC_API_BASE) {
  console.warn('[SEO Shell] NEXT_PUBLIC_API_BASE is not set — falling back to localhost:8081. SEO shell will be empty in production unless env var is configured.');
}

import { toSlug } from '@/lib/slug';

async function getTopDestinations() {
  try {
    const res = await fetch(`${API_BASE}/destinations`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const body = await res.json();
    const list = body?.data || body || [];
    if (!Array.isArray(list)) return [];
    const topIds = ['prambanan', 'parangtritis', 'malioboro', 'tamansari', 'merapi', 'kalibiru'];
    return topIds
      .map((id) => {
        const d = list.find((item: any) => (item.id || item.ExternalID) === id);
        if (!d) return null;
        const name = d.name || d.Name || '';
        const images = d.images || d.Images || [];
        const firstImage = images[0];
        const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url || '';
        const tagline = d.tagline || d.Tagline || '';
        const category = d.category || d.Category || '';
        return { id, name, slug: toSlug(name), imageUrl, tagline, category };
      })
      .filter((d): d is { id: string; name: string; slug: string; imageUrl: string; tagline: string; category: string } => d !== null);
  } catch (err) {
    console.error('[SEO Shell] Failed to fetch top destinations:', err);
    return [];
  }
}

function SeoShell({ destinations }: { destinations: Array<{ id: string; name: string; slug: string; imageUrl: string; tagline: string; category: string }> }) {
  return (
    <div className="sr-only">
      <h1>Jogjagem — Jelajahi Yogyakarta Lebih Dalam</h1>
      <p>Temukan destinasi wisata terbaik di Yogyakarta. Panduan lengkap Candi Prambanan, Malioboro, Pantai Parangtritis, Gunung Merapi, dan 100+ destinasi lainnya.</p>
      <nav aria-label="Popular destinations">
        <ul>
          {destinations.map((dest) => (
            <li key={dest.id}>
              <a href={`${SITE_URL}/destinations/${dest.slug}`}>
                <span>{dest.name}</span>
                <span>{dest.tagline}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label="Categories">
        <ul>
          <li><a href={`${SITE_URL}/destinations?category=heritage`}>Heritage</a></li>
          <li><a href={`${SITE_URL}/destinations?category=adventure`}>Adventure</a></li>
          <li><a href={`${SITE_URL}/destinations?category=nature`}>Nature</a></li>
          <li><a href={`${SITE_URL}/destinations?category=beach`}>Beach</a></li>
          <li><a href={`${SITE_URL}/destinations/hidden-gem`}>Hidden Gem</a></li>
          <li><a href={`${SITE_URL}/destinations?category=culinary`}>Culinary</a></li>
        </ul>
      </nav>
      <nav aria-label="Footer">
        <ul>
          <li><a href={`${SITE_URL}/destinations`}>Destinasi</a></li>
          <li><a href={`${SITE_URL}/events`}>Events</a></li>
          <li><a href={`${SITE_URL}/map`}>Map</a></li>
          <li><a href={`${SITE_URL}/planner`}>Planner</a></li>
          <li><a href={`${SITE_URL}/ai`}>AI Assistant</a></li>
        </ul>
      </nav>
    </div>
  );
}

export default async function Page() {
  const destinations = await getTopDestinations();

  return (
    <>
      <SeoShell destinations={destinations} />
      <Suspense>
        <ClientShell />
      </Suspense>
    </>
  );
}
