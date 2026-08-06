import type { Destination } from '@/types';
import { mapApiToDestination } from '@/lib/destination-mapper';
import { toSlug } from '@/lib/slug';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

/**
 * Fetch every destination via paginated requests.
 *
 * The API caps `limit` at 100 (see httpx.ParsePagination / MaxLimit), so a
 * single request silently truncates the list. This walks all pages using the
 * `meta.total_pages` returned by the API and maps results to the app's
 * `Destination` shape. Server-side only (relies on Next.js fetch cache).
 */
export async function fetchAllDestinations(locale: string = 'id'): Promise<Destination[]> {
  const all: Destination[] = [];
  let page = 1;

  try {
    for (let guard = 0; guard < 100; guard += 1) {
      const res = await fetch(`${API_BASE}/destinations?limit=100&page=${page}`, {
        headers: { 'Accept-Language': locale },
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const body = await res.json();
      const list = body?.data || body || [];
      if (!Array.isArray(list) || list.length === 0) break;
      all.push(...list.map((raw: Record<string, unknown>) => mapApiToDestination(raw)));

      const totalPages = body?.meta?.total_pages ?? page;
      if (page >= totalPages) break;
      page += 1;
    }
  } catch (err) {
    console.error('[destinations] failed to fetch all pages:', err);
  }

  return all;
}

/**
 * Resolve a single destination by slug (toSlug(name)) or raw id.
 *
 * Pages are walked in order and the search stops as soon as a match is found,
 * so destinations early in the list resolve with a single request.
 */
export async function fetchDestinationBySlug(slugOrId: string, locale: string = 'id'): Promise<Destination | null> {
  let page = 1;

  for (let guard = 0; guard < 100; guard += 1) {
    const res = await fetch(`${API_BASE}/destinations?limit=100&page=${page}`, {
      headers: { 'Accept-Language': locale },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    const list = body?.data || body || [];
    if (!Array.isArray(list) || list.length === 0) return null;

    const match = list.find((d: Record<string, unknown>) => {
      const name = (d.name || d.Name || '') as string;
      const id = (d.id || d.ExternalID || '') as string;
      return toSlug(name) === slugOrId || id === slugOrId;
    });
    if (match) return mapApiToDestination(match);

    const totalPages = body?.meta?.total_pages ?? page;
    if (page >= totalPages) return null;
    page += 1;
  }

  return null;
}
