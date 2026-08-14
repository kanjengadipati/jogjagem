const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

export interface ServerEvent {
  id: string;
  title: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Fetch every event via paginated requests, mirroring fetchAllDestinations.
 *
 * The API caps `limit` (see httpx.ParsePagination / MaxLimit), so a single
 * request can silently truncate the list. This walks all pages using
 * `meta.total_pages` and returns the raw server order (active → upcoming →
 * completed). Server-side only (relies on Next.js fetch cache).
 */
export async function fetchAllEvents(locale: string = 'id'): Promise<ServerEvent[]> {
  const all: ServerEvent[] = [];
  let page = 1;

  try {
    for (let guard = 0; guard < 100; guard += 1) {
      const res = await fetch(`${API_BASE}/events?limit=100&page=${page}`, {
        headers: { 'Accept-Language': locale },
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const body = await res.json();
      const list = body?.data || [];
      if (!Array.isArray(list) || list.length === 0) break;
      all.push(...list.map((raw: Record<string, unknown>) => ({
        id: String(raw.id || ''),
        title: String(raw.title || ''),
        start_date: typeof raw.start_date === 'string' ? raw.start_date : undefined,
        end_date: typeof raw.end_date === 'string' ? raw.end_date : undefined,
      })));

      const totalPages = body?.meta?.total_pages ?? page;
      if (page >= totalPages) break;
      page += 1;
    }
  } catch (err) {
    console.error('[events] failed to fetch all pages:', err);
  }

  return all;
}
