import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jogjagem.com';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

const FIXED_DATE = '2025-01-01T00:00:00.000Z';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: FIXED_DATE,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/destinations`,
      lastModified: FIXED_DATE,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: FIXED_DATE,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/map`,
      lastModified: FIXED_DATE,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/planner`,
      lastModified: FIXED_DATE,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/ai`,
      lastModified: FIXED_DATE,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const [destRes, eventRes] = await Promise.all([
      fetch(`${API_BASE}/destinations`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/events`, { next: { revalidate: 3600 } }),
    ]);

    if (destRes.ok) {
      const body = await destRes.json();
      const list = body?.data || body || [];
      if (Array.isArray(list)) {
        const destinationPages: MetadataRoute.Sitemap = list.map((d: any) => {
          const name = d.name || d.Name || '';
          const id = d.id || d.ExternalID || '';
          const slug = toSlug(name) || id;
          const updated = d.updated_at || d.UpdatedAt || d.updatedAt || FIXED_DATE;
          return {
            url: `${SITE_URL}/destinations/${slug}`,
            lastModified: updated,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          };
        });
        staticPages.push(...destinationPages);
      }
    }

    if (eventRes.ok) {
      const body = await eventRes.json();
      const list = body?.data || body || [];
      if (Array.isArray(list)) {
        const eventPages: MetadataRoute.Sitemap = list.map((e: any) => {
          const id = e.id || e.Id || '';
          const updated = e.updated_at || e.UpdatedAt || e.updatedAt || FIXED_DATE;
          return {
            url: `${SITE_URL}/events/${id}`,
            lastModified: updated,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          };
        });
        staticPages.push(...eventPages);
      }
    }
  } catch {
    // If API is unreachable, return only static pages
  }

  return staticPages;
}
