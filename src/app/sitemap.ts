import type { MetadataRoute } from 'next';
import { toSlug } from '@/lib/slug';
import { CATEGORY_IDS, categoryToSlug } from '@/lib/category-slugs';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

const NOW = new Date().toISOString();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categoryPages: MetadataRoute.Sitemap = CATEGORY_IDS.map((category) => ({
    url: `${SITE_URL}/destinations/${categoryToSlug(category, 'id')}`,
    lastModified: NOW,
    changeFrequency: 'weekly',
    priority: category === 'hidden-gem' ? 0.85 : 0.75,
    alternates: {
      languages: {
        id: `${SITE_URL}/destinations/${categoryToSlug(category, 'id')}`,
        en: `${SITE_URL}/en/destinations/${categoryToSlug(category, 'en')}`,
      },
    },
  }));

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: NOW,
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
      lastModified: NOW,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          id: `${SITE_URL}/destinations`,
          en: `${SITE_URL}/en/destinations`,
        },
      },
    },
    ...categoryPages,
    {
      url: `${SITE_URL}/business`,
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: {
          id: `${SITE_URL}/business`,
          en: `${SITE_URL}/en/business`,
        },
      },
    },
    {
      url: `${SITE_URL}/events`,
      lastModified: NOW,
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
      url: `${SITE_URL}/blog`,
      lastModified: NOW,
      changeFrequency: 'weekly',
      priority: 0.7,
      alternates: {
        languages: {
          id: `${SITE_URL}/blog`,
          en: `${SITE_URL}/en/blog`,
        },
      },
    },
    {
      url: `${SITE_URL}/map`,
      lastModified: NOW,
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
      lastModified: NOW,
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
      lastModified: NOW,
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: {
          id: `${SITE_URL}/ai`,
          en: `${SITE_URL}/en/ai`,
        },
      },
    },
    {
      url: `${SITE_URL}/kebijakan-privasi`,
      lastModified: NOW,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          id: `${SITE_URL}/kebijakan-privasi`,
          en: `${SITE_URL}/en/kebijakan-privasi`,
        },
      },
    },
    {
      url: `${SITE_URL}/syarat-ketentuan`,
      lastModified: NOW,
      changeFrequency: 'yearly',
      priority: 0.3,
      alternates: {
        languages: {
          id: `${SITE_URL}/syarat-ketentuan`,
          en: `${SITE_URL}/en/syarat-ketentuan`,
        },
      },
    },
  ];

  try {
    const [destRes, eventRes, articleRes] = await Promise.all([
      fetch(`${API_BASE}/destinations`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/events`, { next: { revalidate: 3600 } }),
      fetch(`${API_BASE}/articles?status=published`, { next: { revalidate: 3600 } }),
    ]);

    if (destRes.ok) {
      const body = await destRes.json();
      const list = body?.data || body || [];
      if (Array.isArray(list)) {
        const destinationPages: MetadataRoute.Sitemap = list.map((d: any) => {
          const name = d.name || d.Name || '';
          const id = d.id || d.ExternalID || '';
          const slug = toSlug(name) || id;
          const updated = d.updated_at || d.UpdatedAt || d.updatedAt || NOW;
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
          const updated = e.updated_at || e.UpdatedAt || e.updatedAt || NOW;
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

    if (articleRes.ok) {
      const body = await articleRes.json();
      const list = body?.data || body || [];
      if (Array.isArray(list)) {
        const articlePages: MetadataRoute.Sitemap = list.map((a: any) => {
          const slug = a.slug || a.Slug || '';
          const updated = a.updated_at || a.UpdatedAt || a.updatedAt || NOW;
          if (!slug) return null;
          return {
            url: `${SITE_URL}/blog/${slug}`,
            lastModified: updated,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
            alternates: {
              languages: {
                id: `${SITE_URL}/blog/${slug}`,
                en: `${SITE_URL}/en/blog/${slug}`,
              },
            },
          };
        }).filter(Boolean) as MetadataRoute.Sitemap;
        staticPages.push(...articlePages);
      }
    }
  } catch {
    // If API is unreachable, return only static pages
  }

  return staticPages;
}
