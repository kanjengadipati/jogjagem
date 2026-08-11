import type { MetadataRoute } from 'next';
import { toSlug } from '@/lib/slug';
import { CATEGORY_IDS, categoryToSlug } from '@/lib/category-slugs';
import { fetchAllDestinations } from '@/lib/server-destinations';
import { fetchAllEvents, fetchAllPublishedArticles } from '@/lib/server-listings';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

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
      url: `${SITE_URL}/wisata-jogja`,
      lastModified: NOW,
      changeFrequency: 'weekly',
      priority: 0.9,
      alternates: {
        languages: {
          id: `${SITE_URL}/wisata-jogja`,
          en: `${SITE_URL}/en/wisata-jogja`,
        },
      },
    },
    ...([
      'hidden-gem-jogja',
      'kuliner-jogja',
      'wisata-alam-jogja',
      'spot-foto-jogja',
      'wisata-budaya-jogja',
      'spot-sunset-jogja',
      'wisata-keluarga-jogja',
      'itinerary-jogja-2-3-hari',
      'wisata-sekitar-malioboro',
      'wisata-hits-jogja',
      'pantai-eksotis-jogja',
    ].map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: NOW,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
      alternates: {
        languages: {
          id: `${SITE_URL}/${slug}`,
          en: `${SITE_URL}/en/${slug}`,
        },
      },
    }))),

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
    // Location pages (one per DIY kabupaten/kota + near-yogyakarta)
    ...([
      'kota-yogyakarta', 'sleman', 'bantul', 'kulon-progo', 'gunungkidul', 'near-yogyakarta',
    ].map((region) => ({
      url: `${SITE_URL}/location/${region}`,
      lastModified: NOW,
      changeFrequency: 'weekly' as const,
      priority: 0.80,
      alternates: {
        languages: {
          id: `${SITE_URL}/location/${region}`,
          en: `${SITE_URL}/en/location/${region}`,
        },
      },
    }))),
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
    const [destinations, events, articles] = await Promise.all([
      fetchAllDestinations(),
      fetchAllEvents(),
      fetchAllPublishedArticles(),
    ]);

    if (destinations.length > 0) {
      const destinationPages: MetadataRoute.Sitemap = destinations.flatMap((d) => {
        const slug = toSlug(d.name) || d.id;
        const updated = d.updatedAt || NOW;
        const base = {
          lastModified: updated,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
        return [
          {
            ...base,
            url: `${SITE_URL}/destinations/${slug}`,
            alternates: {
              languages: {
                id: `${SITE_URL}/destinations/${slug}`,
                en: `${SITE_URL}/en/destinations/${slug}`,
              },
            },
          },
          {
            ...base,
            url: `${SITE_URL}/en/destinations/${slug}`,
            alternates: {
              languages: {
                id: `${SITE_URL}/destinations/${slug}`,
                en: `${SITE_URL}/en/destinations/${slug}`,
              },
            },
          },
        ];
      });
      staticPages.push(...destinationPages);
    }

    if (events.length > 0) {
      const eventPages: MetadataRoute.Sitemap = events.flatMap((e) => {
        const id = (e.id || e.Id || '') as string;
        const updated = (e.updated_at || e.UpdatedAt || e.updatedAt || NOW) as string;
        const base = {
          lastModified: updated,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
        return [
          {
            ...base,
            url: `${SITE_URL}/events/${id}`,
            alternates: { languages: { id: `${SITE_URL}/events/${id}`, en: `${SITE_URL}/en/events/${id}` } },
          },
          {
            ...base,
            url: `${SITE_URL}/en/events/${id}`,
            alternates: { languages: { id: `${SITE_URL}/events/${id}`, en: `${SITE_URL}/en/events/${id}` } },
          },
        ];
      });
      staticPages.push(...eventPages);
    }

    if (articles.length > 0) {
      const articlePages: MetadataRoute.Sitemap = articles.flatMap((a) => {
        const slug = (a.slug || a.Slug || '') as string;
        const updated = (a.updated_at || a.UpdatedAt || a.updatedAt || NOW) as string;
        if (!slug) return [];
        const base = {
          lastModified: updated,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
        return [
          {
            ...base,
            url: `${SITE_URL}/blog/${slug}`,
            alternates: { languages: { id: `${SITE_URL}/blog/${slug}`, en: `${SITE_URL}/en/blog/${slug}` } },
          },
          {
            ...base,
            url: `${SITE_URL}/en/blog/${slug}`,
            alternates: { languages: { id: `${SITE_URL}/blog/${slug}`, en: `${SITE_URL}/en/blog/${slug}` } },
          },
        ];
      }).filter(Boolean) as MetadataRoute.Sitemap;
      staticPages.push(...articlePages);
    }
  } catch (err) {
    // If the API is unreachable, return only static pages. Log so the drop
    // from the sitemap is visible in the platform's server logs.
    console.error('[sitemap] API unavailable, serving static URLs only:', err);
  }

  return staticPages;
}
