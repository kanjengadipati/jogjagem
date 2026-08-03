import type { Metadata } from 'next';
import DestinationDetailClient from '@/components/DestinationDetailClient';
import DestinationsPageClient from '../DestinationsPageClient';
import { TouristDestinationJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd';
import { toSlug } from '@/lib/slug';
import { categoryToSlug, slugToCategory } from '@/lib/category-slugs';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';
const SITE_NAME = 'Jogjagem';

const CATEGORY_LABELS: Record<string, { id: string; en: string }> = {
  nature: { id: 'Wisata Alam', en: 'Nature Destinations' },
  culinary: { id: 'Kuliner Legendaris', en: 'Culinary Legends' },
  heritage: { id: 'Sejarah & Budaya', en: 'Heritage & Culture' },
  adventure: { id: 'Petualangan', en: 'Adventure Destinations' },
  beach: { id: 'Pantai & Sunset', en: 'Beaches & Sunset' },
  family: { id: 'Ramah Keluarga', en: 'Family Friendly' },
  weekend: { id: 'Ide Akhir Pekan', en: 'Weekend Ideas' },
  camping: { id: 'Spot Camping', en: 'Camping Spots' },
  sunset: { id: 'Spot Sunset', en: 'Sunset Spots' },
};

function getCategoryLabel(slug: string, locale: string) {
  const categoryId = slugToCategory(slug) ?? slug;
  const category = CATEGORY_LABELS[categoryId];
  if (!category) return null;
  return locale === 'en' ? category.en : category.id;
}

async function fetchDestinationBySlug(slugStr: string) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';
    const res = await fetch(`${API_BASE}/destinations?limit=100`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const body = await res.json();
    const list = body?.data || body || [];
    if (!Array.isArray(list)) return null;
    return (
      list.find((d: any) => {
        const name = d.name || d.Name || '';
        return toSlug(name) === slugStr || (d.id || d.ExternalID) === slugStr;
      }) || null
    );
  } catch {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';
    const res = await fetch(`${API_BASE}/destinations?limit=100`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const body = await res.json();
    const list = body?.data || body || [];
    if (!Array.isArray(list)) return [];

    const params: { locale: string; slug: string[] }[] = [];
    list.forEach((d: any) => {
      const name = d.name || d.Name || '';
      const id = d.id || d.ExternalID || '';
      const slug = toSlug(name) || id;
      if (slug) {
        params.push({ locale: 'id', slug: [slug] });
        params.push({ locale: 'en', slug: [slug] });
      }
    });
    return params;
  } catch {
    return [];
  }
}

type PageProps = { params: Promise<{ slug: string[]; locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, locale } = await params;
  const slugStr = slug.join('/');
  const categoryLabel = slug.length === 1 ? getCategoryLabel(slugStr, locale) : null;

  if (categoryLabel) {
    const categoryId = slugToCategory(slugStr) ?? slugStr;
    const localizedSlug = categoryToSlug(categoryId, locale === 'en' ? 'en' : 'id');
    const pageUrl = locale === 'en' ? `${SITE_URL}/en/destinations/${localizedSlug}` : `${SITE_URL}/destinations/${localizedSlug}`;
    const title = locale === 'en'
      ? `${categoryLabel} — Jogjagem`
      : `${categoryLabel} Jogja — Jogjagem`;
    const description = locale === 'en'
      ? `Explore curated ${categoryLabel.toLowerCase()} across Yogyakarta.`
      : `Jelajahi pilihan ${categoryLabel.toLowerCase()} terkurasi di Yogyakarta.`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: pageUrl,
        siteName: SITE_NAME,
      },
      alternates: {
        canonical: pageUrl,
        languages: {
          id: `${SITE_URL}/destinations/${categoryToSlug(categoryId, 'id')}`,
          en: `${SITE_URL}/en/destinations/${categoryToSlug(categoryId, 'en')}`,
        },
      },
    };
  }

  const dest = await fetchDestinationBySlug(slugStr);

  if (!dest) {
    return {
      title: 'Destinasi Tidak Ditemukan — Jogjagem',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const name = dest.name || dest.Name || '';
  const tagline = dest.tagline || dest.Tagline || '';
  const description = dest.description || dest.Description || tagline || `Panduan wisata lengkap ${name} di Yogyakarta.`;
  const category = dest.category || dest.Category || '';
  const location = dest.location || dest.Location || '';
  const images = dest.images || dest.Images || [];
  const firstImage = images[0];
  const defaultOgImage = typeof firstImage === 'string' ? firstImage : firstImage?.url || '/og-default.png';
  const rating = dest.rating || dest.Rating || 0;
  const reviewCount = dest.review_count || dest.ReviewCount || 0;
  const latitude = dest.latitude || dest.Latitude || 0;
  const longitude = dest.longitude || dest.Longitude || 0;

  const pageUrl = locale === 'en' ? `${SITE_URL}/en/destinations/${slugStr}` : `${SITE_URL}/destinations/${slugStr}`;

  const seoTitle = locale === 'en'
    ? (dest.seo_title_en || dest.SeoTitleEn || dest.seo_title || dest.SeoTitle || '')
    : (dest.seo_title || dest.SeoTitle || '');
  const seoKeywords = locale === 'en'
    ? (dest.seo_keywords_en || dest.SeoKeywordsEn || dest.seo_keywords || dest.SeoKeywords || '')
    : (dest.seo_keywords || dest.SeoKeywords || '');
  const seoDescription = locale === 'en'
    ? (dest.seo_description_en || dest.SeoDescriptionEn || dest.seo_description || dest.SeoDescription || '')
    : (dest.seo_description || dest.SeoDescription || '');
  const ogImageUrl = dest.og_image_url || dest.OgImageUrl || '';

  const title = seoTitle || (locale === 'en' ? `${name} — Yogyakarta Tourism` : `${name} — Wisata Yogyakarta`);
  const metaDescription = seoDescription || (description.length > 160 ? description.slice(0, 157) + '...' : description);
  const ogImage = ogImageUrl || defaultOgImage;

  const fallbackKeywords = locale === 'en'
    ? [name, `${name} Yogyakarta`, `${name} jogja`, category, 'yogyakarta tourism', 'things to do in Yogyakarta']
    : [name, `wisata ${name}`, `${name} Yogyakarta`, `${name} jogja`, category, 'wisata jogja', 'tempat wisata Yogyakarta'];

  return {
    title,
    description: metaDescription,
    keywords: seoKeywords
      ? seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : fallbackKeywords,
    openGraph: {
      type: 'article',
      locale: locale === 'en' ? 'en_US' : 'id_ID',
      url: pageUrl,
      siteName: SITE_NAME,
      title,
      description: metaDescription,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${name} — ${tagline || location}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: metaDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/destinations/${slugStr}`,
        en: `${SITE_URL}/en/destinations/${slugStr}`,
      },
    },
  };
}

export default async function DestinationDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const slugStr = slug.join('/');
  const categoryId = slug.length === 1 ? slugToCategory(slugStr) : null;
  if (categoryId && CATEGORY_LABELS[categoryId]) {
    return <DestinationsPageClient initialCategory={categoryId} />;
  }

  const dest = await fetchDestinationBySlug(slugStr);

  const name = dest?.name || dest?.Name || '';
  const tagline = dest?.tagline || dest?.Tagline || '';
  const description = dest?.description || dest?.Description || tagline || '';
  const category = dest?.category || dest?.Category || '';
  const images = dest?.images || dest?.Images || [];
  const firstImage = images[0];
  const image = typeof firstImage === 'string' ? firstImage : firstImage?.url || undefined;
  const latitude = dest?.latitude || dest?.Latitude || 0;
  const longitude = dest?.longitude || dest?.Longitude || 0;
  const rating = dest?.rating || dest?.Rating || 0;
  const reviewCount = dest?.review_count || dest?.ReviewCount || 0;
  const location = dest?.location || dest?.Location || '';
  const faqs = dest?.faqs || dest?.Faqs || dest?.FAQs || [];

  return (
    <>
      {dest && (
        <>
          <TouristDestinationJsonLd
            name={name}
            description={description}
            image={image}
            url={`${SITE_URL}/destinations/${slugStr}`}
            latitude={latitude}
            longitude={longitude}
            rating={rating}
            reviewCount={reviewCount}
            address={location}
            category={category}
          />
          <BreadcrumbJsonLd
            items={[
              { name: 'Beranda', url: SITE_URL },
              { name: 'Destinasi', url: `${SITE_URL}/destinations` },
              { name, url: `${SITE_URL}/destinations/${slugStr}` },
            ]}
          />
          {Array.isArray(faqs) && faqs.length > 0 && (
            <FAQJsonLd
              items={faqs.map((faq: any) => ({
                question: faq.question || faq.Question || '',
                answer: faq.answer || faq.Answer || '',
              })).filter((item: { question: string; answer: string }) => item.question && item.answer)}
            />
          )}
        </>
      )}
      <DestinationDetailClient slug={slug} />
    </>
  );
}
