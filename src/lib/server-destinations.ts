import type { Destination } from '@/types';
import { mapApiToDestination } from '@/lib/destination-mapper';
import { toSlug } from '@/lib/slug';

const API_BASE = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

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
 * Walk the paginated destinations catalog for `locale` and return the first raw
 * row whose name-slug (== toSlug(name)) or stable `id` equals `slugOrId`.
 *
 * Returns:
 *  - raw record if found
 *  - null if exhausted all pages and genuinely not found
 *  - 'fetch_error' if the API was unreachable or returned an error status
 */
async function findDestinationInCatalog(slugOrId: string, locale: string): Promise<Record<string, unknown> | null | 'fetch_error'> {
  let page = 1;

  try {
    for (let guard = 0; guard < 100; guard += 1) {
      const res = await fetch(`${API_BASE}/destinations?limit=100&page=${page}`, {
        headers: { 'Accept-Language': locale },
        next: { revalidate: 3600 },
      });
      if (!res.ok) return 'fetch_error';
      const body = await res.json();
      const list = body?.data || body || [];
      if (!Array.isArray(list) || list.length === 0) return null;

      const match = list.find((d: Record<string, unknown>) => {
        const name = (d.name || d.Name || '') as string;
        const id = (d.id || d.ExternalID || '') as string;
        return toSlug(name) === slugOrId || id === slugOrId;
      });
      if (match) return match;

      const totalPages = body?.meta?.total_pages ?? page;
      if (page >= totalPages) return null;
      page += 1;
    }
  } catch {
    return 'fetch_error';
  }

  return null;
}

/**
 * Fetch a single destination by its stable `id` (e.g. "prambanan") in the
 * requested locale, via GET /destinations/:id.
 */
export async function fetchDestinationById(id: string, locale: string = 'id'): Promise<Destination | null | 'fetch_error'> {
  try {
    const res = await fetch(`${API_BASE}/destinations/${encodeURIComponent(id)}`, {
      headers: { 'Accept-Language': locale },
      next: { revalidate: 3600 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return 'fetch_error';
    const body = await res.json();
    const raw = body?.data || body;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    return mapApiToDestination(raw);
  } catch {
    return 'fetch_error';
  }
}

/**
 * Resolve a single destination by slug (toSlug(name)) or raw id.
 *
 * Returns:
 *  - Destination object if found
 *  - null if exhausted all pages and genuinely not found
 *  - 'fetch_error' if the API was unreachable or returned an error status
 *
 * Callers should treat 'fetch_error' as a transient failure (keep indexable)
 * and null as a confirmed 404 (can noindex).
 */
export async function fetchDestinationBySlug(slugOrId: string, locale: string = 'id'): Promise<Destination | null | 'fetch_error'> {
  // Pass 1: match the slug/id directly against the requested locale's catalog.
  // This works when the URL slug was derived from this locale's name.
  const direct = await findDestinationInCatalog(slugOrId, locale);
  if (direct === 'fetch_error') return 'fetch_error';
  if (direct) return mapApiToDestination(direct);

  // Pass 2 (cross-locale fallback): the URL slug may be derived from the *other*
  // locale's name (e.g. ID "Candi Ratu Boko" -> `candi-ratu-boko` is linked as
  // `/en/destinations/candi-ratu-boko`, but the EN name is "Ratu Boko Palace").
  // For non-id requests pass 1 only searched the requested locale's names, so
  // resolve the slug against the base (id) catalog to recover the stable `id`,
  // then re-fetch that id in the requested locale. (When locale already is 'id',
  // pass 1 was already the id catalog, so a miss is a genuine 404.)
  if (locale !== 'id') {
    const viaId = await findDestinationInCatalog(slugOrId, 'id');
    if (viaId === 'fetch_error') return 'fetch_error';
    if (viaId) {
      const stableId = (viaId.id || viaId.ExternalID || '') as string;
      if (stableId) return fetchDestinationById(stableId, locale);
    }
  }
  return null;
}

/**
 * Fetch this week's curated Hidden Gem selection (max 15) from the dedicated
 * API endpoint. Much cheaper than fetchAllDestinations — only 15 rows come
 * back instead of the full catalogue.
 *
 * Returns an empty array on any error so the page degrades gracefully.
 */
export async function fetchHiddenGemDestinations(locale: string = 'id'): Promise<Destination[]> {
  try {
    const res = await fetch(`${API_BASE}/destinations/hidden-gem`, {
      headers: { 'Accept-Language': locale },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body = await res.json();
    const list: unknown[] = body?.data || [];
    if (!Array.isArray(list)) return [];
    return list.map((raw) => mapApiToDestination(raw as Record<string, unknown>));
  } catch (err) {
    console.error('[hidden-gem] failed to fetch curated list:', err);
    return [];
  }
}

/**
 * Helper to match destinations by categories or keyword list.
 *
 * Two deliberate narrowings vs. a naive substring search:
 *  1. Word-boundary matching, not raw `.includes()` — otherwise a keyword
 *     like "warung" matches inside an unrelated name like "Warungboto", and
 *     "resto" matches inside the English word "restaurants".
 *  2. Only searched against name + tagline (short, curated strings), not the
 *     full free-text `description` or `location` — a long description can
 *     mention food/drink/scenery in passing (e.g. "...menikmati kopi hangat
 *     kala matahari terbenam...") without the destination actually being a
 *     culinary/sunset spot. Name and tagline are what the destination is
 *     actually about; description is prone to incidental keyword hits.
 */
function isKeywordMatch(d: Destination, keywords: string[]): boolean {
  const text = `${d.name} ${d.tagline}`.toLowerCase();
  return keywords.some((kw) => {
    const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`\\b${escaped}\\b`).test(text);
  });
}

export async function fetchCulinaryDestinations(locale: string = 'id', limit = 20): Promise<Destination[]> {
  const all = await fetchAllDestinations(locale);
  const keywords = ['culinary', 'kuliner', 'gudeg', 'soto', 'kopi', 'warung', 'makanan', 'sate', 'bakpia', 'angkringan', 'resto', 'mie', 'bakmi'];
  const matches = all.filter((d) => d.category?.toLowerCase() === 'culinary' || isKeywordMatch(d, keywords));
  return matches.length > 0 ? matches.slice(0, limit) : all.slice(0, limit);
}

export async function fetchNatureDestinations(locale: string = 'id', limit = 20): Promise<Destination[]> {
  const all = await fetchAllDestinations(locale);
  const keywords = ['nature', 'beach', 'alam', 'pantai', 'hutan', 'air terjun', 'curug', 'bukit', 'gunung', 'goa', 'embung', 'sungai', 'pinus'];
  const matches = all.filter((d) => ['nature', 'beach', 'adventure'].includes(d.category?.toLowerCase()) || isKeywordMatch(d, keywords));
  return matches.length > 0 ? matches.slice(0, limit) : all.slice(0, limit);
}

export async function fetchPhotoSpotDestinations(locale: string = 'id', limit = 20): Promise<Destination[]> {
  const all = await fetchAllDestinations(locale);
  const keywords = ['foto', 'spot', 'view', 'estetik', 'instagramable', 'tebing', 'puncak', 'candi', 'hutan', 'taman', 'swafoto'];
  // Previously `rating >= 4.5 || isKeywordMatch(...)` — since most of the
  // catalog is rated 4.5+, that OR made the keyword check almost meaningless
  // and let plenty of non-photogenic destinations onto the "Spot Foto" page.
  // Require both a decent rating AND an actual photo-spot signal.
  const matches = all.filter((d) => d.rating >= 4.5 && isKeywordMatch(d, keywords));
  return matches.length > 0 ? matches.slice(0, limit) : all.slice(0, limit);
}

export async function fetchCulturalDestinations(locale: string = 'id', limit = 20): Promise<Destination[]> {
  const all = await fetchAllDestinations(locale);
  const keywords = ['heritage', 'culture', 'candi', 'keraton', 'museum', 'budaya', 'sejarah', 'kraton', 'situs', 'taman sari', 'benteng', 'cagar'];
  const matches = all.filter((d) => ['heritage', 'culture'].includes(d.category?.toLowerCase()) || isKeywordMatch(d, keywords));
  return matches.length > 0 ? matches.slice(0, limit) : all.slice(0, limit);
}

export async function fetchSunsetDestinations(locale: string = 'id', limit = 20): Promise<Destination[]> {
  const all = await fetchAllDestinations(locale);
  const keywords = ['sunset', 'senja', 'bukit', 'pantai', 'tebing', 'puncak', 'view', 'ketinggian', 'embung', 'obelix', 'heha'];
  const matches = all.filter((d) => isKeywordMatch(d, keywords) || d.category?.toLowerCase() === 'beach');
  return matches.length > 0 ? matches.slice(0, limit) : all.slice(0, limit);
}

export async function fetchFamilyDestinations(locale: string = 'id', limit = 20): Promise<Destination[]> {
  const all = await fetchAllDestinations(locale);
  const keywords = ['family', 'keluarga', 'anak', 'taman', 'zoo', 'edukasi', 'wahana', 'museum', 'pantai', 'ramah anak', 'wisata edukasi'];
  const matches = all.filter((d) => d.category?.toLowerCase() === 'family' || isKeywordMatch(d, keywords));
  return matches.length > 0 ? matches.slice(0, limit) : all.slice(0, limit);
}

export async function fetchItineraryDestinations(locale: string = 'id', limit = 15): Promise<Destination[]> {
  const all = await fetchAllDestinations(locale);
  // Pick diverse top-rated destinations spanning nature, culture, culinary, and sunset
  if (all.length === 0) return [];
  const top = [...all].sort((a, b) => b.rating - a.rating);
  return top.slice(0, limit);
}

export async function fetchMalioboroDestinations(locale: string = 'id', limit = 20): Promise<Destination[]> {
  const all = await fetchAllDestinations(locale);
  const keywords = ['malioboro', 'titik nol', 'kraton', 'keraton', 'vredeburg', 'beringharjo', 'taman sari', 'taman pintar', 'tugu', 'alun-alun', 'kota yogyakarta', 'yogyakarta city', 'mangkubumi'];
  // Note: previously also matched on `d.location.includes('yogyakarta')`, which
  // is true for most of the province-wide catalog (the DIY region itself is
  // named Yogyakarta) and pulled in destinations far from Malioboro. subRegion
  // is the structured "is this actually in Yogyakarta city" signal; keyword
  // matching on name/tagline covers landmarks near Malioboro by name.
  const matches = all.filter((d) =>
    d.subRegion?.toLowerCase() === 'yogyakarta' ||
    isKeywordMatch(d, keywords)
  );
  return matches.length > 0 ? matches.slice(0, limit) : all.slice(0, limit);
}

export async function fetchTrendingHitsDestinations(locale: string = 'id', limit = 10): Promise<Destination[]> {
  const all = await fetchAllDestinations(locale);
  // Filter destinations with badge 'trending' or badges containing 'trending'
  const trending = all.filter((d) => {
    const badge = d.badge?.toLowerCase();
    const badges = d.badges?.map((b) => b.toLowerCase()) || [];
    return badge === 'trending' || badges.includes('trending');
  });

  if (trending.length >= limit) {
    return trending.slice(0, limit);
  }

  // Fill remaining slots with top rated / highly reviewed destinations
  const existingIds = new Set(trending.map((t) => t.id));
  const remaining = all
    .filter((d) => !existingIds.has(d.id))
    .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0) || b.rating - a.rating);

  return [...trending, ...remaining].slice(0, limit);
}

export async function fetchExoticBeachDestinations(locale: string = 'id', limit = 20): Promise<Destination[]> {
  const all = await fetchAllDestinations(locale);
  const keywords = ['pantai', 'beach', 'gunungkidul', 'pasir putih', 'tebing', 'laut'];
  
  const matches = all.filter((d) => {
    const cat = d.category?.toLowerCase();
    const isBeachOrHidden = cat === 'beach' || cat === 'hidden-gem';
    return isBeachOrHidden && isKeywordMatch(d, keywords);
  });

  if (matches.length > 0) return matches.slice(0, limit);

  const fallback = all.filter((d) => d.category?.toLowerCase() === 'beach' || isKeywordMatch(d, ['pantai', 'beach']));
  return fallback.length > 0 ? fallback.slice(0, limit) : all.slice(0, limit);
}




