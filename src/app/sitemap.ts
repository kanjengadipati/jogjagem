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
      alternates: {
        languages: {
          id: SITE_URL,
          en: `${SITE_URL}/en`,
        },
      },
    },
    {
      url: `${SITE_URL}/destinations`,
      lastModified: FIXED_DATE,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          id: `${SITE_URL}/destinations`,
          en: `${SITE_URL}/en/destinations`,
        },
      },
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: FIXED_DATE,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          id: `${SITE_URL}/events`,
          en: `${SITE_URL}/en/events`,
        },
      },
    },
    {
      url: `${SITE_URL}/map`,
      lastModified: FIXED_DATE,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          id: `${SITE_URL}/map`,
          en: `${SITE_URL}/en/map`,
        },
      },
    },
    {
      url: `${SITE_URL}/planner`,
      lastModified: FIXED_DATE,
      changeFrequency: 'monthly',
      priority: 0.6,
      alternates: {
        languages: {
          id: `${SITE_URL}/planner`,
          en: `${SITE_URL}/en/planner`,
        },
      },
    },
    {
      url: `${SITE_URL}/ai`,
      lastModified: FIXED_DATE,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: {
          id: `${SITE_URL}/ai`,
          en: `${SITE_URL}/en/ai`,
        },
      },
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
            alternates: {
              languages: {
                id: `${SITE_URL}/destinations/${slug}`,
                en: `${SITE_URL}/en/destinations/${slug}`,
              },
            },
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
            alternates: {
              languages: {
                id: `${SITE_URL}/events/${id}`,
                en: `${SITE_URL}/en/events/${id}`,
              },
            },
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
