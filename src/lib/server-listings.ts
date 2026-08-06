const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

async function fetchAll<T>(path: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;

  try {
    for (let guard = 0; guard < 100; guard += 1) {
      const separator = path.includes('?') ? '&' : '?';
      const res = await fetch(`${API_BASE}${path}${separator}limit=100&page=${page}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const body = await res.json();
      const list = body?.data || body || [];
      if (!Array.isArray(list) || list.length === 0) break;
      all.push(...(list as T[]));

      const totalPages = body?.meta?.total_pages ?? page;
      if (page >= totalPages) break;
      page += 1;
    }
  } catch (err) {
    console.error(`[listings] failed to fetch all pages for ${path}:`, err);
  }

  return all;
}

export async function fetchAllEvents() {
  return fetchAll<Record<string, unknown>>('/events');
}

export async function fetchAllPublishedArticles() {
  return fetchAll<Record<string, unknown>>('/articles?status=published');
}
