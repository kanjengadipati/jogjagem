import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import BlogDetailClient from './BlogDetailClient';
import type { Article } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jogjagem.com';

async function fetchArticle(slug: string, locale: string): Promise<Article | null> {
  try {
    const res = await fetch(`${API_BASE}/articles/slug/${slug}`, {
      headers: { 'Accept-Language': locale },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json?.data as Article) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await fetchArticle(slug, locale);

  if (!article) {
    return { title: 'Article Not Found' };
  }

  const title = article.seo_title || article.title;
  const description = article.seo_description || article.excerpt || '';
  const keywords = article.seo_keywords || '';
  const ogImage = article.og_image || article.cover_image || '';
  const canonicalUrl = `${SITE_URL}${locale === 'en' ? '/en' : ''}/blog/${slug}`;

  return {
    title,
    description,
    keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonicalUrl,
      publishedTime: article.published_at,
      authors: article.author ? [article.author] : undefined,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        id: `${SITE_URL}/blog/${slug}`,
        en: `${SITE_URL}/en/blog/${slug}`,
      },
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const article = await fetchArticle(slug, locale);

  if (!article) notFound();

  const t = await getTranslations({ locale, namespace: 'blog' });

  return (
    <BlogDetailClient
      article={article}
      locale={locale}
      messages={{
        back_to_blog: t('back_to_blog'),
        min_read: t('min_read'),
        by: t('by'),
        published: t('published'),
        category: t('category'),
        share: t('share'),
        related: t('related'),
      }}
    />
  );
}
