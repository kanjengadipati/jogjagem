import type { MetadataRoute } from 'next';
import { toSlug } from '@/lib/slug';
import { CATEGORY_IDS, categoryToSlug } from '@/lib/category-slugs';
import { fetchAllDestinations } from '@/lib/server-destinations';
import { fetchAllEvents, fetchAllPublishedArticles } from '@/lib/server-listings';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

// Manual last-modified per static route. Update the date whenever the page's
// copy/content actually changes — never default back to `new Date()`, because
// an identical timestamp on every entry is ignored by Google.
const STATIC_LASTMOD: Record<string, string> = {
  '/': '2026-08-01',
  '/wisata-jogja': '2026-08-04',
  '/hidden-gem-jogja': '2026-08-04',
  '/kuliner-jogja': '2026-08-04',
  '/wisata-alam-jogja': '2026-08-04',
  '/spot-foto-jogja': '2026-08-04',
  '/wisata-budaya-jogja': '2026-08-04',
  '/spot-sunset-jogja': '2026-08-04',
  '/wisata-keluarga-jogja': '2026-08-04',
  '/itinerary-jogja-2-3-hari': '2026-08-04',
  '/wisata-sekitar-malioboro': '2026-08-04',
  '/wisata-hits-jogja': '2026-08-04',
  '/pantai-eksotis-jogja': '2026-08-04',
  '/destinations': '2026-08-01',
  '/business': '2026-07-15',
  '/events': '2026-07-15',
  '/blog': '2026-07-15',
  '/map': '2026-07-01',
  '/planner': '2026-07-01',
  '/ai': '2026-07-01',
  '/kebijakan-privasi': '2026-06-01',
  '/syarat-ketentuan': '2026-06-01',
};

type SitemapEntry = MetadataRoute.Sitemap[number];

// Build one entry per locale (id + explicit /en) so both variants are
// crawlable without depending on hreflang discovery alone.
function localizedEntries(
  path: string,
  opts: { lastModified?: string; changeFrequency: SitemapEntry['changeFrequency']; priority: number }
): SitemapEntry[] {
  const lastModified = opts.lastModified ?? STATIC_LASTMOD[path] ?? '2026-08-01';
  const idUrl = `${SITE_URL}${path}`;
  const enUrl = `${SITE_URL}/en${path}`;
  const base = { lastModified, changeFrequency: opts.changeFrequency, priority: opts.priority };
  return [
    { ...base, url: idUrl, alternates: { languages: { id: idUrl, 'x-default': idUrl, en: enUrl } } },
    { ...base, url: enUrl, alternates: { languages: { id: idUrl, 'x-default': idUrl, en: enUrl } } },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Homepage: both locales explicitly.
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: STATIC_LASTMOD['/'],
      changeFrequency: 'daily',
      priority: 1,
      alternates: { languages: { id: SITE_URL, 'x-default': SITE_URL, en: `${SITE_URL}/en` } },
    },
    {
      url: `${SITE_URL}/en`,
      lastModified: STATIC_LASTMOD['/'],
      changeFrequency: 'daily',
      priority: 1,
      alternates: { languages: { id: SITE_URL, 'x-default': SITE_URL, en: `${SITE_URL}/en` } },
    },
    ...localizedEntries('/wisata-jogja', { changeFrequency: 'weekly', priority: 0.9 }),
    ...[
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
    ].flatMap((slug) => localizedEntries(`/${slug}`, { changeFrequency: 'weekly', priority: 0.9 })),

    ...localizedEntries('/destinations', { changeFrequency: 'daily', priority: 0.9 }),

    // Category pages — /en variant uses the localized (English) category slug.
    ...CATEGORY_IDS.flatMap((category): SitemapEntry[] => {
      const idPath = `/destinations/${categoryToSlug(category, 'id')}`;
      const enPath = `/destinations/${categoryToSlug(category, 'en')}`;
      const lastModified = STATIC_LASTMOD[idPath] ?? '2026-08-01';
      const priority = category === 'hidden-gem' ? 0.85 : 0.75;
      const base = { lastModified, changeFrequency: 'weekly' as const, priority };
      const idUrl = `${SITE_URL}${idPath}`;
      const enUrl = `${SITE_URL}/en${enPath}`;
      return [
        { ...base, url: idUrl, alternates: { languages: { id: idUrl, 'x-default': idUrl, en: enUrl } } },
        { ...base, url: enUrl, alternates: { languages: { id: idUrl, 'x-default': idUrl, en: enUrl } } },
      ];
    }),

    // Location pages (one per DIY kabupaten/kota + near-yogyakarta)
    ...[
      'kota-yogyakarta', 'sleman', 'bantul', 'kulon-progo', 'gunungkidul', 'near-yogyakarta',
    ].flatMap((region) => localizedEntries(`/location/${region}`, { changeFrequency: 'weekly', priority: 0.8 })),

    ...localizedEntries('/business', { changeFrequency: 'monthly', priority: 0.5 }),
    ...localizedEntries('/events', { changeFrequency: 'weekly', priority: 0.7 }),
    ...localizedEntries('/blog', { changeFrequency: 'weekly', priority: 0.7 }),
    ...localizedEntries('/map', { changeFrequency: 'monthly', priority: 0.6 }),
    ...localizedEntries('/planner', { changeFrequency: 'monthly', priority: 0.6 }),
    ...localizedEntries('/ai', { changeFrequency: 'monthly', priority: 0.5 }),
    ...localizedEntries('/kebijakan-privasi', { changeFrequency: 'yearly', priority: 0.3 }),
    ...localizedEntries('/syarat-ketentuan', { changeFrequency: 'yearly', priority: 0.3 }),
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
        const updated = d.updatedAt || STATIC_LASTMOD['/destinations'] || '2026-08-01';
        const base = {
          lastModified: updated,
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        };
        const idUrl = `${SITE_URL}/destinations/${slug}`;
        const enUrl = `${SITE_URL}/en/destinations/${slug}`;
        return [
          {
            ...base,
            url: idUrl,
            alternates: { languages: { id: idUrl, 'x-default': idUrl, en: enUrl } },
          },
          {
            ...base,
            url: enUrl,
            alternates: { languages: { id: idUrl, 'x-default': idUrl, en: enUrl } },
          },
        ];
      });
      staticPages.push(...destinationPages);
    }

    if (events.length > 0) {
      const eventPages: MetadataRoute.Sitemap = events.flatMap((e) => {
        const id = (e.id || e.Id || '') as string;
        const updated = (e.updated_at || e.UpdatedAt || e.updatedAt || '2026-08-01') as string;
        const base = {
          lastModified: updated,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
        const idUrl = `${SITE_URL}/events/${id}`;
        const enUrl = `${SITE_URL}/en/events/${id}`;
        return [
          {
            ...base,
            url: idUrl,
            alternates: { languages: { id: idUrl, 'x-default': idUrl, en: enUrl } },
          },
          {
            ...base,
            url: enUrl,
            alternates: { languages: { id: idUrl, 'x-default': idUrl, en: enUrl } },
          },
        ];
      });
      staticPages.push(...eventPages);
    }

    if (articles.length > 0) {
      const articlePages: MetadataRoute.Sitemap = articles.flatMap((a) => {
        const slug = (a.slug || a.Slug || '') as string;
        const updated = (a.updated_at || a.UpdatedAt || a.updatedAt || '2026-08-01') as string;
        if (!slug) return [];
        const base = {
          lastModified: updated,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
        const idUrl = `${SITE_URL}/blog/${slug}`;
        const enUrl = `${SITE_URL}/en/blog/${slug}`;
        return [
          {
            ...base,
            url: idUrl,
            alternates: { languages: { id: idUrl, 'x-default': idUrl, en: enUrl } },
          },
          {
            ...base,
            url: enUrl,
            alternates: { languages: { id: idUrl, 'x-default': idUrl, en: enUrl } },
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

  // Defensive dedupe by URL (identical destination names produce identical
  // slugs in the DB); keep first occurrence, preserve order.
  const seen = new Set<string>();
  return staticPages.filter((entry) => {
    if (seen.has(entry.url)) return false;
    seen.add(entry.url);
    return true;
  });
}
