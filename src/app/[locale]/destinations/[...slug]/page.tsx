import type { Metadata } from 'next';
import DestinationDetailClient from '@/components/DestinationDetailClient';
import DestinationsPageClient from '../DestinationsPageClient';
import { TouristDestinationJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd';
import { toSlug } from '@/lib/slug';
import { categoryToSlug, slugToCategory } from '@/lib/category-slugs';
import { fetchAllDestinations, fetchDestinationBySlug } from '@/lib/server-destinations';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';
const SITE_NAME = 'Jogjagem';

const CATEGORY_LABELS: Record<string, { id: string; en: string }> = {
  'hidden-gem': { id: 'Hidden Gem', en: 'Hidden Gems' },
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

export async function generateStaticParams() {
  try {
    const list = await fetchAllDestinations();
    const params: { locale: string; slug: string[] }[] = [];
    list.forEach((d) => {
      const slug = toSlug(d.name) || d.id;
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

  const dest = await fetchDestinationBySlug(slugStr, locale);

  if (dest === 'fetch_error') {
    // Transient API failure — keep indexable so Google retries later.
    const pageUrl = locale === 'en'
      ? `${SITE_URL}/en/destinations/${slugStr}`
      : `${SITE_URL}/destinations/${slugStr}`;
    return {
      title: slugStr.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') +
        (locale === 'en' ? ' — Yogyakarta Tourism' : ' — Wisata Yogyakarta'),
      robots: { index: true, follow: true },
      alternates: { canonical: pageUrl },
    };
  }

  if (!dest) {
    // Confirmed 404 — destination does not exist in the database.
    return {
      title: 'Destinasi Tidak Ditemukan — Jogjagem',
      robots: { index: false, follow: false },
    };
  }

  const name = dest.name || '';
  const tagline = dest.tagline || '';
  const description = dest.description || tagline || `Panduan wisata lengkap ${name} di Yogyakarta.`;
  const category = dest.category || '';
  const location = dest.location || '';
  const images = dest.images || [];
  const firstImage = images[0];
  const defaultOgImage = typeof firstImage === 'string' ? firstImage : firstImage?.url || '/og-default.png';
  const rating = dest.rating || 0;
  const reviewCount = dest.reviewCount || 0;
  const latitude = dest.latitude || 0;
  const longitude = dest.longitude || 0;

  const pageUrl = locale === 'en' ? `${SITE_URL}/en/destinations/${slugStr}` : `${SITE_URL}/destinations/${slugStr}`;

  const seoTitle = locale === 'en' ? (dest.seoTitleEn || dest.seoTitle || '') : (dest.seoTitle || '');
  const seoKeywords = locale === 'en' ? (dest.seoKeywordsEn || dest.seoKeywords || '') : (dest.seoKeywords || '');
  const seoDescription = locale === 'en' ? (dest.seoDescriptionEn || dest.seoDescription || '') : (dest.seoDescription || '');
  const ogImageUrl = dest.ogImageUrl || '';

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
  const { slug, locale } = await params;
  const slugStr = slug.join('/');
  const categoryId = slug.length === 1 ? slugToCategory(slugStr) : null;
  if (categoryId && CATEGORY_LABELS[categoryId]) {
    const initialDestinations = await fetchAllDestinations(locale);
    return <DestinationsPageClient initialCategory={categoryId} initialDestinations={initialDestinations} />;
  }

  const destResult = await fetchDestinationBySlug(slugStr, locale);
  // treat fetch_error the same as null for rendering — show not-found UI
  const dest = destResult === 'fetch_error' ? null : destResult;

  const name = dest?.name || '';
  const tagline = dest?.tagline || '';
  const description = dest?.description || tagline || '';
  const category = dest?.category || '';
  const images = dest?.images || [];
  const firstImage = images[0];
  const image = typeof firstImage === 'string' ? firstImage : firstImage?.url || undefined;
  const latitude = dest?.latitude || 0;
  const longitude = dest?.longitude || 0;
  const rating = dest?.rating || 0;
  const reviewCount = dest?.reviewCount || 0;
  const location = dest?.location || '';
  const faqs = dest?.faqs || [];

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
      <DestinationDetailClient slug={slug} initialData={dest} />
    </>
  );
}
