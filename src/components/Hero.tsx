import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { Search, ChevronLeft, ChevronRight, Mic, MicOff, Camera, Loader2, Bookmark, X, Star, CalendarDays } from 'lucide-react';
import { Destination } from '../types';
import { ai } from '../lib/api';
import NearbyMapCard from './NearbyMapCard';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { AIPickCard } from './AIPickCard';

const BADGE_COLOR: Record<string, string> = {
  'Spesial Hari Ini': 'bg-orange-500',
  'Trending': 'bg-blue-500',
  'Populer': 'bg-teal-500',
  'Cahaya Surga': 'bg-purple-500',
  'Warisan Budaya': 'bg-amber-600',
  'Alam Terbaik': 'bg-green-600',
  'Ikon Dunia': 'bg-rose-500',
  'Akan Datang': 'bg-indigo-500',
  'Hidden Gem': 'bg-emerald-600',
};

type TrendingItem = {
  type: 'destination' | 'event';
  id: string;
  badge: string;
  headline: string;
  reason: string;
  imageUrl: string;
  rating: number;
  distance: string;
  location: string;
};

interface HeroProps {
  destinations: Destination[];
  onSearchSubmit: (query: string) => void;
  onImageSearchSubmit: (imageUrl: string, reply: string, matchedDestinationIds: string[]) => void;
  onExploreDestination: (dest: Destination) => void;
  onToggleSave: (dest: Destination) => void;
  isSaved: (id: string) => boolean;
}

const HERO_SLIDES = [
  { id: 'prambanan', name: 'Prambanan Temple', tagline: 'Witness the majestic 9th-century Hindu spires rising against the golden sky.', image: 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?auto=format&fit=crop&w=1600&q=80', credit: 'Eugenia Clara' },
  { id: 'parangtritis', name: 'Parangtritis Beach', tagline: 'Where the black volcanic sand acts as a mirror for the mystical Southern Ocean sunset.', image: 'https://images.unsplash.com/photo-1602137704924-9a038cfb5253?auto=format&fit=crop&w=1600&q=80', credit: 'Unsplash' },
  { id: 'merapi', name: 'Mount Merapi', tagline: 'Feel the thrill of riding vintage 4x4 Willys jeeps through fresh volcanic ash paths.', image: 'https://images.unsplash.com/photo-1556375403-b96342fc0ee2?auto=format&fit=crop&w=1600&q=80', credit: 'Unsplash' },
  { id: 'tamansari', name: 'Taman Sari Water Castle', tagline: 'Explore hidden underground tunnels and secret bath pools of the ancient Sultans.', image: 'https://images.unsplash.com/photo-1625506276715-76ad63823181?auto=format&fit=crop&w=1600&q=80', credit: 'Gading Ihsan' },
  { id: 'goajomblang', name: 'Goa Jomblang Cave', tagline: 'Descend into a vertical primeval forest to catch the blinding column of heavenly light.', image: 'https://images.unsplash.com/photo-1628047563315-d1e8b8d222b9?auto=format&fit=crop&w=1600&q=80', credit: 'Unsplash' },
];

export default function Hero({ destinations, onSearchSubmit, onImageSearchSubmit, onExploreDestination, onToggleSave, isSaved }: HeroProps) {
  const { t } = useLocale();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [heroConfig] = useState({
    title: 'Jelajahi Yogyakarta',
    titleAccent: 'Lebih Dalam',
    subtitle: 'Temukan hidden gems, kekayaan budaya, cita rasa lokal, dan pengalaman autentik yang membuat setiap perjalanan lebih bermakna.',
    ctaText: 'Mulai Jelajahi',
  });
  const [isRecommendationDismissed, setIsRecommendationDismissed] = useState(false);
  const [recommendation, setRecommendation] = useState<{
    headline: string; reason: string; dest: Destination; image: string;
    temp: string; condition: string; distance: string; crowd: string;
  } | null>(null);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    if (destinations.length === 0) return;
    const hour = new Date().getHours();
    const timeOfDay = hour < 11 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
    const fallbackDest = destinations.find(d => d.id === 'merapi' || d.id === 'prambanan') || destinations[0];
    if (fallbackDest) {
      setRecommendation({
        headline: t('hero.fallback_headline'),
        reason: fallbackDest.tagline,
        dest: fallbackDest,
        image: fallbackDest.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1556375403-b96342fc0ee2?auto=format&fit=crop&w=400&q=80',
        temp: fallbackDest.weather?.temp || '26°C',
        condition: fallbackDest.weather?.condition || 'Sunny',
        distance: '18 min', crowd: t('hero.fallback_crowd'),
      });
    }
    const fetchAIRecommendation = async () => {
      try {
        // Use /multi endpoint (singular /recommend returns 502)
        const res = await ai.recommendMulti(timeOfDay);
        if (res.status === 'success' && res.data?.items?.length) {
          const { destinationId, headline, reason, crowd } = res.data.items[0];
          const recommendedDest = destinations.find(d => d.id?.toLowerCase() === destinationId?.toLowerCase());
          if (recommendedDest) {
            setRecommendation({
              headline, reason, dest: recommendedDest, crowd,
              image: recommendedDest.images?.[0]?.url ?? 'https://images.unsplash.com/photo-1556375403-b96342fc0ee2?auto=format&fit=crop&w=400&q=80',
              temp: recommendedDest.weather?.temp || '26°C',
              condition: recommendedDest.weather?.condition || 'Sunny',
              distance: '18 min',
            });
          }
        }
      } catch (err) { console.error('Failed to fetch AI recommendation', err); }
    };
    fetchAIRecommendation();
  }, [destinations]);

  useEffect(() => {
    let cancelled = false;
    setTrendingLoading(true);
    ai.trending()
      .then(res => {
        if (cancelled) return;
        if (res.status === 'success' && res.data?.items?.length) {
          setTrendingItems(res.data.items);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setTrendingLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) onSearchSubmit(searchQuery);
  };

  const handleImageButtonClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert(t('hero.upload_image_file')); return; }
    setIsUploadingImage(true);
    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
      });
      const previewUrl = URL.createObjectURL(file);
      const responseData = await ai.imageSearch(base64Data, file.type);
      if (responseData.status === 'success' && responseData.data) {
        const { reply, matchedDestinationIds } = responseData.data;
        onImageSearchSubmit(previewUrl, reply, Array.isArray(matchedDestinationIds) ? matchedDestinationIds : []);
      } else { throw new Error(responseData.message || 'Failed to analyze image'); }
    } catch (err: any) { console.error(err); alert(t('hero.error_scanning_image') + err.message); }
    finally { setIsUploadingImage(false); if (e.target) e.target.value = ''; }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert(t('hero.voice_not_supported')); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) { setSearchQuery(transcript); onSearchSubmit(transcript); }
    };
    if (isListening) recognition.stop(); else recognition.start();
  };

  // Reusable trending card renderer
  const renderTrendingCard = (item: TrendingItem, keyPrefix: string) => {
    const badgeColor = BADGE_COLOR[item.badge] ?? 'bg-gold-500';
    const dest = item.type === 'destination' ? destinations.find(d => d.id === item.id) : null;
    return (
      <button
        key={`${keyPrefix}-${item.type}-${item.id}`}
        type="button"
        onClick={() => {
          if (dest) {
            onExploreDestination(dest);
          } else if (item.type === 'destination') {
            router.push(`/destinations/${item.id}`);
          } else if (item.type === 'event') {
            router.push(`/events/${item.id}`);
          }
        }}
        className="shrink-0 w-[100px] lg:w-[140px] snap-start bg-stone-950/60 border border-white/10 rounded-xl overflow-hidden text-left active:scale-95 transition-transform cursor-pointer hover:border-gold-500/30"
      >
        <div className="relative h-[60px] lg:h-[80px]">
          {item.imageUrl
            ? <Image src={item.imageUrl} alt={item.headline} fill priority sizes="140px" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            : <div className="w-full h-full bg-white/5 flex items-center justify-center"><CalendarDays className="h-8 w-8 text-white/20" /></div>
          }
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className={`absolute top-2 left-2 ${badgeColor} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none`}>
            {item.badge}
          </span>
          {item.type === 'event' && (
            <span className="absolute top-2 right-2 bg-black/50 text-white/80 text-[8px] px-1 py-0.5 rounded-full leading-none flex items-center gap-0.5">
              <CalendarDays className="h-2 w-2" />{t('hero.event')}
            </span>
          )}
        </div>
        <div className="p-2 lg:p-2.5">
          <p className="text-[10px] lg:text-[11px] font-bold text-white leading-tight line-clamp-2 mb-1">{item.headline}</p>
          <div className="flex items-center gap-1">
            {item.type === 'destination' && item.rating > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-gold-400 font-semibold">
                <Star className="h-2.5 w-2.5 fill-gold-400" />{item.rating.toFixed(1)}
              </span>
            )}
            {item.location && <span className="text-[9px] text-white/50 truncate">{item.location}</span>}
          </div>
        </div>
      </button>
    );
  };

  return (
    <>
      <style>{`@keyframes marqueeScroll { 0% { transform: translateX(0); } 70% { transform: translateX(-50%); } 100% { transform: translateX(0); } }`}</style>
      <div
        id="hero-section-container"
        className="relative min-h-[calc(100svh-64px)] lg:h-[calc(100vh-80px)] lg:min-h-[680px] w-full bg-royal-950 overflow-hidden"
      >
        {/* ── Background slides ── */}
        <div className="absolute inset-0 overflow-hidden">
          {HERO_SLIDES.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-70' : 'opacity-0'}`}
            >
              <Image src={item.image} alt={item.name} fill sizes="(max-width: 1024px) 100vw, 1200px" className="h-full w-full object-cover object-center brightness-90" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-royal-950/20 to-royal-950/40" />
              <div className="absolute inset-0 bg-gradient-to-r from-royal-950/40 via-transparent to-royal-950/40" />
            </div>
          ))}
        </div>

        {/* ── Foreground ── */}
        <div className="relative z-10 flex flex-col min-h-[calc(100svh-64px)] lg:min-h-[680px] lg:h-[calc(100vh-80px)]">

          {/* ── Main content area (single, authoritative) ── */}
          <div className="relative mx-auto w-full max-w-7xl flex flex-col flex-1 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-0 pb-0 lg:justify-center lg:pb-[240px]">

            {/* RECOMMENDATIONS */}
            {recommendation ? (
              <div className="absolute top-[22px] right-4 sm:right-6 lg:right-8 z-20 w-[140px] sm:w-[185px] lg:w-[210px] flex flex-col gap-3">
                <AIPickCard
                  recommendation={recommendation}
                  isSaved={isSaved}
                  onToggleSave={onToggleSave}
                  onExplore={onExploreDestination}
                  onDismiss={() => setIsRecommendationDismissed(true)}
                  sizes="(max-width: 640px) 140px, (max-width: 1024px) 185px, 210px"
                  className="relative w-full animate-fade-in"
                />
                <NearbyMapCard />
              </div>
            ) : !isRecommendationDismissed ? (
              <div className="absolute top-[22px] right-4 sm:right-6 lg:right-8 z-20 w-[140px] sm:w-[185px] lg:w-[210px] flex flex-col gap-3">
                <div className="bg-stone-950/90 backdrop-blur-md border border-gold-500/30 rounded-2xl overflow-hidden shadow-2xl animate-pulse aspect-[2/3]">
                  <div className="px-3 pt-3 pb-2.5">
                    <div className="h-2 w-28 bg-white/10 rounded mb-2" /><div className="h-3.5 w-full bg-white/15 rounded mb-1.5" />
                    <div className="h-2.5 w-full bg-white/10 rounded mb-1" /><div className="h-2.5 w-3/4 bg-white/10 rounded mb-2.5" />
                    <div className="flex justify-between"><div className="h-2 w-16 bg-white/10 rounded" /><div className="h-2 w-12 bg-white/10 rounded" /></div>
                  </div>
                </div>
                <NearbyMapCard />
              </div>
            ) : null}

            {/* Title + Search */}
            <div className="flex-1 flex items-center lg:block lg:flex-none lg:items-start">
              <div className="max-w-2xl space-y-0.5 sm:space-y-1 text-left animate-fade-in pr-36 sm:pr-0">
                <span className="inline-flex items-center space-x-2 font-sans text-[10px] uppercase tracking-[0.08em] text-gold-400 font-semibold drop-shadow-md">
                  <span>{t('hero.good_morning', { name: isAuthenticated && user?.name ? user.name : 'Traveler' })}</span>
                </span>
                <h1 className="font-display text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-white drop-shadow-lg leading-[1.1]">
                  {heroConfig.title} <br />
                  <span className="font-display italic text-gold-400 font-normal mt-1 sm:mt-2 block tracking-normal">{heroConfig.titleAccent}</span>
                </h1>
                <p className="text-sm sm:text-base max-w-xl font-light text-white/90 drop-shadow-md leading-relaxed">{heroConfig.subtitle}</p>
                <div className="max-w-xl w-full pt-4 md:pt-5">
                  <form id="hero-conversational-search-form" onSubmit={handleSearchSubmit} className="relative flex items-center rounded-full border border-white/20 bg-black/35 hover:bg-black/45 backdrop-blur-md p-1 shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-gold-500/50 focus-within:border-gold-400">
                    <Search className="ml-4 h-5 w-5 text-white/70 shrink-0" />
                    <input type="text" placeholder={t('hero.search_placeholder')} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-transparent py-3 pl-3 pr-28 text-sm text-white placeholder-white/60 focus:outline-none font-sans" />
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div className="absolute right-1 flex items-center space-x-1">
                      <button type="button" onClick={handleImageButtonClick} disabled={isUploadingImage} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all shrink-0 disabled:opacity-50" title={t('hero.search_by_image')}>
                        {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                      </button>
                      <button type="button" onClick={handleVoiceSearch} className={`flex h-9 w-9 items-center justify-center rounded-full transition-all shrink-0 ${isListening ? 'bg-red-500/20 text-red-400 animate-pulse' : 'hover:bg-white/10 text-white/70 hover:text-white'}`} title={t('hero.search_by_voice')}>
                        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </button>
                      <button type="submit" className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 hover:bg-gold-600 active:scale-95 text-white transition-all shadow-md shrink-0">
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>

            {/* Slide caption — mobile only, above trending */}
            <div className="flex lg:hidden items-center justify-between mt-[30px] mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-gold-400 text-xs">📍</span>
                <div>
                  <span className="block text-xs font-bold tracking-tight text-white drop-shadow">{slide.name}</span>
                  <span className="block text-[9px] font-mono text-white/50">{t('hero.location_sleman')}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1.5">
                  {HERO_SLIDES.map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-0.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'w-6 bg-gold-400' : 'w-3 bg-white/30'}`} aria-label={`Go to slide ${idx + 1}`} />
                  ))}
                </div>
                <button onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="h-6 w-6 rounded-full border border-white/20 flex items-center justify-center text-white/70" aria-label="Previous slide">
                  <ChevronLeft className="h-3 w-3" />
                </button>
                <button onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)} className="h-6 w-6 rounded-full border border-white/20 flex items-center justify-center text-white/70" aria-label="Next slide">
                  <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Trending Now — mobile/tablet */}
            <div className="block lg:hidden pb-[82px]">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-gold-400 text-xs">✦</span>
                <span className="text-[11px] font-bold text-white tracking-wide">{t('hero.trending')}</span>
                <span className="text-gold-400 text-xs">✦</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
                {trendingLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="shrink-0 w-[100px] snap-start bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-pulse">
                        <div className="h-[60px] bg-white/10" /><div className="p-2 space-y-1"><div className="h-2 w-16 bg-white/10 rounded" /><div className="h-3 w-full bg-white/10 rounded" /></div>
                      </div>
                    ))
                  : trendingItems.map(item => renderTrendingCard(item, 'mobile'))
                }
              </div>
            </div>

          </div>{/* end main content */}


          {/* Trending Now — desktop only, pinned above slide controls */}
          <div className="hidden lg:block absolute bottom-[56px] left-0 right-0 z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-gold-400 text-xs">✦</span>
                <span className="text-[11px] font-bold text-white tracking-wide">{t('hero.trending')}</span>
                <span className="text-gold-400 text-xs">✦</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory">
                {trendingLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="shrink-0 w-[140px] snap-start bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-pulse">
                        <div className="h-[80px] bg-white/10" /><div className="p-2.5 space-y-1.5"><div className="h-2 w-16 bg-white/10 rounded" /><div className="h-3 w-full bg-white/10 rounded" /><div className="h-2 w-10 bg-white/10 rounded" /></div>
                      </div>
                    ))
                  : trendingItems.map(item => renderTrendingCard(item, 'desktop'))
                }
              </div>
            </div>
          </div>

          {/* Slide controls — desktop only */}
          <div className="hidden lg:flex absolute bottom-4 left-0 right-0 z-10 pointer-events-none">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex justify-end pointer-events-auto">
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center space-x-2.5 text-white/90">
                  <span className="text-gold-400 text-sm">📍</span>
                  <div className="text-left">
                    <span className="block text-sm font-bold tracking-tight text-white">{slide.name}</span>
                    <span className="block text-[10px] font-mono text-white/50 tracking-wider">{t('hero.location_sleman')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    {HERO_SLIDES.map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-0.5 rounded-full transition-all duration-300 cursor-pointer ${idx === currentSlide ? 'w-8 bg-gold-400' : 'w-4 bg-white/30 hover:bg-white/50'}`} aria-label={`Go to slide ${idx + 1}`} />
                    ))}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)} className="h-8 w-8 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer" aria-label="Previous slide">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)} className="h-8 w-8 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer" aria-label="Next slide">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-[10px] font-mono text-white/40">{t('common.photo')} {HERO_SLIDES[currentSlide].credit} / Unsplash</div>
                </div>
              </div>
            </div>
          </div>

        </div>{/* end foreground */}
      </div>{/* end hero container */}
    </>
  );
}
