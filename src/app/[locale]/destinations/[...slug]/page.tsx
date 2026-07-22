import type { Metadata } from 'next';
import DestinationDetailClient from '@/components/DestinationDetailClient';
import { TouristDestinationJsonLd, BreadcrumbJsonLd, FAQJsonLd } from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jogjagem.com';
const SITE_NAME = 'Jogjagem';

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function fetchDestinationBySlug(slugStr: string) {
  try {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';
    const res = await fetch(`${API_BASE}/destinations`, { next: { revalidate: 3600 } });
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
    const res = await fetch(`${API_BASE}/destinations`, { next: { revalidate: 3600 } });
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
  const dest = await fetchDestinationBySlug(slugStr);

  if (!dest) {
    return {
      title: 'Destinasi Tidak Ditemukan',
      description: 'Destinasi wisata yang Anda cari tidak ditemukan di Jogjagem.',
      robots: { index: false },
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

  const seoTitle = dest.seo_title || dest.SeoTitle || '';
  const seoKeywords = dest.seo_keywords || dest.SeoKeywords || '';
  const seoDescription = dest.seo_description || dest.SeoDescription || '';
  const ogImageUrl = dest.og_image_url || dest.OgImageUrl || '';

  const title = seoTitle || `${name} — Wisata Yogyakarta`;
  const metaDescription = seoDescription || (description.length > 160 ? description.slice(0, 157) + '...' : description);
  const ogImage = ogImageUrl || defaultOgImage;

  return {
    title,
    description: metaDescription,
    keywords: seoKeywords
      ? seoKeywords.split(',').map((k: string) => k.trim()).filter(Boolean)
      : [name, `wisata ${name}`, `${name} Yogyakarta`, `${name} jogja`, category, 'wisata jogja', 'tempat wisata Yogyakarta'],
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
