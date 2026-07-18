'use client';

import Link from 'next/link';
import { MapPin, ArrowLeft, Home } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

export default function NotFound() {
  const { t } = useLocale();
  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-gold-50 border border-gold-200 flex items-center justify-center mx-auto mb-6">
          <MapPin className="h-10 w-10 text-gold-500" />
        </div>
        <h1 className="font-manrope text-4xl font-bold text-royal-950 mb-2">404</h1>
        <h2 className="font-manrope text-xl font-semibold text-stone-700 mb-3">
          {t('not_found.heading')}
        </h2>
        <p className="text-sm text-stone-500 mb-8 leading-relaxed">
          {t('not_found.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold-400 hover:bg-gold-500 text-royal-950 text-sm font-mono font-bold uppercase tracking-widest rounded-xl transition-colors"
          >
            <Home className="h-4 w-4" />
            {t('not_found.home')}
          </Link>
          <Link
            href="/destinations"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-stone-200 hover:border-gold-300 text-stone-700 text-sm font-mono font-bold uppercase tracking-widest rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('not_found.all_destinations')}
          </Link>
        </div>
      </div>
    </div>
  );
}
