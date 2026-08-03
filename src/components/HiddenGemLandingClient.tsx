'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import Header from '@/components/Header';
import DestinationCard from '@/components/DestinationCard';
import { Destination } from '@/types';
import Image from 'next/image';
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';

export default function HiddenGemLandingClient({ destinations, locale }: { destinations: Destination[]; locale: string }) {
  const router = useRouter();
  const { t } = useLocale();
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('explore_jogja_saved_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedDestinations(parsed);
      }
    } catch {}
    setHydrated(true);
  }, []);

  const handleToggleSave = (dest: Destination) => {
    setSavedDestinations(prev => {
      const exists = prev.some(d => d.id === dest.id);
      const next = exists ? prev.filter(d => d.id !== dest.id) : [...prev, dest];
      try { localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const isSaved = (id: string) => savedDestinations.some(d => d.id === id);

  return (
    <AuthProvider>
      <LocationProvider>
        <div className="min-h-screen bg-[#faf9f6] flex flex-col">
          <Header activeTab="discover" setActiveTab={() => router.push('/')} savedCount={savedDestinations.length} isOverHero={false} />

      <main className="flex-1">
        <section className="relative bg-royal-950 pt-20 pb-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(214,161,71,0.08)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(214,161,71,0.05)_0%,_transparent_60%)]" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => router.push('/destinations')}
              className="flex items-center gap-1.5 text-gold-400/70 hover:text-gold-300 transition-colors mb-8 group"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="text-sm font-medium">{t('destinations_page.back_to_explore') || 'Kembali ke Destinasi'}</span>
            </button>

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-gold-400" />
                  <span className="text-xs font-semibold uppercase tracking-widest text-gold-400">
                    {locale === 'en' ? 'Hidden Gems' : t('category.hidden-gem') || 'Hidden Gem'}
                  </span>
                </div>
                <h1 className="font-manrope text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                  {locale === 'en' ? 'Hidden Gems Yogyakarta' : 'Hidden Gem Jogja'}
                </h1>
                <p className="mt-3 text-sm sm:text-base text-white/50 font-light max-w-lg">
                  {locale === 'en'
                    ? `${destinations.length} secret destinations waiting to be explored. Off-the-beaten-path spots for the curious traveler.`
                    : `${destinations.length} destinasi tersembunyi menunggu untuk dieksplorasi. Spot di luar jalur umum untuk traveler yang penasaran.`}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-manrope text-lg font-bold text-royal-950 mb-1">
                  {locale === 'en' ? 'Read the Complete Guide' : 'Baca Panduan Lengkap'}
                </h3>
                <p className="text-sm text-stone-600 max-w-xl">
                  {locale === 'en'
                    ? 'Looking for more hidden gems? Our travel guide covers secret spots, local tips, and off-the-beaten-path destinations across Yogyakarta.'
                    : 'Mencari hidden gem lain? Panduan perjalanan kami mencakup spot tersembunyi, tips lokal, dan destinasi di luar jalur umum di seluruh Yogyakarta.'}
                </p>
              </div>
              <a
                href={`/${locale}/blog/hidden-gems-yogyakarta`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-600 text-white text-sm font-bold hover:bg-teal-700 transition-colors shrink-0"
              >
                {locale === 'en' ? 'Read Guide' : 'Baca Panduan'}
                <ArrowLeft className="h-4 w-4 rotate-180" />
              </a>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 pb-2">
          <p className="text-xs text-stone-500">
            {locale === 'en' ? `${destinations.length} hidden gems found` : `${destinations.length} hidden gem ditemukan`}
          </p>
        </div>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {destinations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 border border-dashed border-gold-200 rounded-3xl bg-white text-center px-6">
              <Sparkles className="h-10 w-10 text-gold-300 mb-4" />
              <span className="block text-base font-semibold text-royal-950 mb-1">
                {locale === 'en' ? 'No hidden gems found' : 'Hidden gem tidak ditemukan'}
              </span>
              <span className="block text-sm text-stone-500">
                {locale === 'en' ? 'Check back later for new discoveries.' : 'Cek kembali nanti untuk penemuan baru.'}
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
              {destinations.map((dest, index) => (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  onExplore={(d) => router.push(`/destinations/${d.id}`)}
                  onToggleSave={handleToggleSave}
                  isSaved={isSaved(dest.id)}
                  className={index % 7 === 0 ? 'col-span-2' : ''}
                />
              ))}
            </div>
          )}
        </section>

        <footer className="bg-royal-950 text-white border-t border-royal-900 py-12 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Image src="/logo-gold-new.png" alt="Jogjagem" width={24} height={24} className="h-6 w-auto" />
                <span className="font-manrope font-bold text-sm tracking-[0.08em] uppercase text-white">Jogjagem</span>
              </div>
              <p className="text-[10px] text-gold-100/40 font-mono tracking-widest uppercase mt-1">
                {t('footer.tagline')}
              </p>
            </div>
            <div className="text-[10px] font-mono text-gold-200/40 uppercase tracking-widest space-y-1">
              <p>{t('footer.copyright')}</p>
              <p>{t('footer.made_with')}</p>
              <p>{t('footer.build_by')}</p>
            </div>
          </div>
        </footer>
      </main>
    </div>
      </LocationProvider>
    </AuthProvider>
  );
}
