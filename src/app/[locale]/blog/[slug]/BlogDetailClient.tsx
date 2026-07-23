'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import type { Article } from '@/types';
import {
  ArrowLeft, Clock, User, Calendar, Tag,
  Share2, Check, BookOpen,
} from 'lucide-react';

interface DetailMessages {
  back_to_blog: string;
  min_read: string;
  by: string;
  published: string;
  category: string;
  share: string;
  related: string;
}

const CATEGORY_LABELS: Record<string, { id: string; en: string }> = {
  panduan:   { id: 'Panduan',   en: 'Guide' },
  itinerary: { id: 'Itinerary', en: 'Itinerary' },
  kuliner:   { id: 'Kuliner',   en: 'Food' },
  budaya:    { id: 'Budaya',    en: 'Culture' },
  alam:      { id: 'Alam',      en: 'Nature' },
  tips:      { id: 'Tips',      en: 'Tips' },
  lainnya:   { id: 'Lainnya',   en: 'Other' },
};

function formatDate(dateStr?: string, locale = 'id') {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// JSON-LD Article schema for SEO
function ArticleJsonLd({ article, locale, siteUrl }: {
  article: Article;
  locale: string;
  siteUrl: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt ?? '',
    image: article.cover_image ? [article.cover_image] : [],
    datePublished: article.published_at,
    author: { '@type': 'Organization', name: article.author ?? 'Jogjagem' },
    publisher: {
      '@type': 'Organization',
      name: 'Jogjagem',
      logo: { '@type': 'ImageObject', url: `${siteUrl}/logo-gold-new.png` },
    },
    url: `${siteUrl}${locale === 'en' ? '/en' : ''}/blog/${article.slug}`,
    mainEntityOfPage: `${siteUrl}${locale === 'en' ? '/en' : ''}/blog/${article.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function BlogDetailClient({
  article,
  locale,
  messages,
}: {
  article: Article;
  locale: string;
  messages: DetailMessages;
}) {
  const [copied, setCopied] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://jogjagem.com';

  const catInfo = article.category ? CATEGORY_LABELS[article.category] : undefined;
  const catLabel = catInfo ? (locale === 'en' ? catInfo.en : catInfo.id) : article.category;

  function handleShare() {
    const url = `${siteUrl}${locale === 'en' ? '/en' : ''}/blog/${article.slug}`;
    if (navigator.share) {
      navigator.share({ title: article.title, text: article.excerpt ?? '', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  return (
    <>
      <ArticleJsonLd article={article} locale={locale} siteUrl={siteUrl} />

      <div className="min-h-screen bg-white">
        {/* Cover */}
        {article.cover_image && (
          <div className="relative w-full h-64 md:h-96 bg-gray-100 overflow-hidden">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Back link */}
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-primary transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {messages.back_to_blog}
          </Link>

          {/* Category badge */}
          {catLabel && (
            <div className="flex items-center gap-1.5 mb-4">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary capitalize">
                {catLabel}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed mb-6 border-l-4 border-primary/30 pl-4">
              {article.excerpt}
            </p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 pb-6 border-b border-gray-100 mb-8">
            {article.author && (
              <span className="flex items-center gap-1.5 font-medium text-gray-600">
                <User className="w-4 h-4" />
                {messages.by} {article.author}
              </span>
            )}
            {article.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(article.published_at, locale)}
              </span>
            )}
            {article.read_time_minutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.read_time_minutes} {messages.min_read}
              </span>
            )}
            <button
              onClick={handleShare}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-primary hover:text-primary text-gray-500 transition text-xs font-semibold cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {messages.share}
            </button>
          </div>

          {/* Article body */}
          {article.content ? (
            <div
              className="prose prose-gray prose-lg max-w-none
                prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-gray-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-gray-600 prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-ul:text-gray-600 prose-ol:text-gray-600
                prose-strong:text-gray-800
                prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400 gap-3">
              <BookOpen className="w-10 h-10" />
              <p className="text-sm">Content coming soon.</p>
            </div>
          )}

          {/* Bottom share */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary transition"
            >
              <ArrowLeft className="w-4 h-4" />
              {messages.back_to_blog}
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-sm font-bold transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {messages.share}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
