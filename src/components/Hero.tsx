import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import { Search, ChevronLeft, ChevronRight, Mic, MicOff, Camera, Loader2, Bookmark, X, Star, CalendarDays, Heart, MapPin } from 'lucide-react';
import { Destination, Festival } from '../types';
import { ai, ads, type BeAdCampaign } from '../lib/api';
import NearbyMapCard from './NearbyMapCard';
import { useLocale } from '@/contexts/LocaleContext';
import { useAuth } from '@/contexts/AuthContext';
import { AIPickCard } from './AIPickCard';
import SearchBar from './SearchBar';
import RouteMapItinerary from './RouteMapItinerary';

const BADGE_COLOR: Record<string, string> = {
  trending: 'bg-rose-500',
  hidden_gem: 'bg-violet-500',
  event: 'bg-amber-500',
  today_only: 'bg-emerald-500',
  popular: 'bg-orange-500',
  new: 'bg-cyan-500',
  photographers_pick: 'bg-fuchsia-600',
};

type TrendingItem = {
  type: 'destination' | 'event';
  id: string;
  badge: string;
  badgeType?: string;
  headline: string;
  reason: string;
  imageUrl: string;
  rating: number;
  distance: string;
  location: string;
  // Native ad fields
  isSponsored?: boolean;
  campaignId?: string;  // for trackImpression / trackClick
  targetUrl?: string;   // override link for sponsored items
};

interface HeroProps {
  destinations: Destination[];
  events?: Festival[];
  coords?: { lat: number; lng: number } | null;
  onSearchSubmit: (query: string) => void;
  onImageSearchSubmit: (imageUrl: string, reply: string, matchedDestinationIds: string[]) => void;
  onExploreDestination: (dest: Destination) => void;
  onToggleSave: (dest: Destination) => void;
  isSaved: (id: string) => boolean;
  /** Optional pre-fetched AI pick from parent — prevents a duplicate recommendMulti call */
  initialAiPick?: { destinationId: string; headline: string; reason: string; crowd: string; };
}

const HERO_SLIDES = [
  { id: 'prambanan', name: 'Prambanan Temple', tagline: 'Witness the majestic 9th-century Hindu spires rising against the golden sky.', image: 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?auto=format&fit=crop&w=1600&q=80', credit: 'Eugenia Clara' },
  { id: 'parangtritis', name: 'Parangtritis Beach', tagline: 'Where the black volcanic sand acts as a mirror for the mystical Southern Ocean sunset.', image: 'https://images.unsplash.com/photo-1602137704924-9a038cfb5253?auto=format&fit=crop&w=1600&q=80', credit: 'Unsplash' },
  { id: 'merapi', name: 'Mount Merapi', tagline: 'Feel the thrill of riding vintage 4x4 Willys jeeps through fresh volcanic ash paths.', image: 'https://images.unsplash.com/photo-1556375403-b96342fc0ee2?auto=format&fit=crop&w=1600&q=80', credit: 'Unsplash' },
  { id: 'tamansari', name: 'Taman Sari Water Castle', tagline: 'Explore hidden underground tunnels and secret bath pools of the ancient Sultans.', image: 'https://images.unsplash.com/photo-1625506276715-76ad63823181?auto=format&fit=crop&w=1600&q=80', credit: 'Gading Ihsan' },
  { id: 'goajomblang', name: 'Goa Jomblang Cave', tagline: 'Descend into a vertical primeval forest to catch the blinding column of heavenly light.', image: 'https://images.unsplash.com/photo-1628047563315-d1e8b8d222b9?auto=format&fit=crop&w=1600&q=80', credit: 'Unsplash' },
];

export default function Hero({ destinations, events = [], coords, onSearchSubmit, onImageSearchSubmit, onExploreDestination, onToggleSave, isSaved, initialAiPick }: HeroProps) {
  const { t } = useLocale();
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const heroTitleWords = t('home.hero_title').split(' ');
  const heroTitleMain = heroTitleWords.slice(0, -1).join(' ');
  const heroTitleAccent = heroTitleWords[heroTitleWords.length - 1];
  const hour = new Date().getHours();
  const greetingKey = hour < 11 ? 'hero.good_morning' : hour < 18 ? 'hero.good_afternoon' : 'hero.good_evening';
  const userName = isAuthenticated && user?.name ? user.name : 'Traveler';
  const searchClues = [
    t('hero.search_clue_hidden_gem'),
    t('hero.search_clue_kuliner'),
    t('hero.search_clue_sunset'),
    t('hero.search_clue_daytrip'),
  ];
  const heroConfig = {
    title: heroTitleMain,
    titleAccent: heroTitleAccent,
    subtitle: t('home.hero_subtitle'),
    ctaText: t('hero.fallback_cta'),
  };
  const [isRecommendationDismissed, setIsRecommendationDismissed] = useState(false);
  // 50:50 share of voice between "Jogjagem's Pick" (organic AI recommendation) and a
  // paid homepage_hero_aicard campaign. Each page load flips a coin; if it lands on sponsored
  // AND a campaign is live, the sponsored card renders instead of the organic pick in
  // the same card slot.
  const [sponsoredCampaign, setSponsoredCampaign] = useState<BeAdCampaign | null>(null);
  const heroCoinFlipRef = useRef<boolean | null>(null); // null = not decided yet this load
  const [recommendation, setRecommendation] = useState<{
    headline: string; reason: string; dest: Destination; image: string;
    temp: string; condition: string; distance: string; crowd: string;
  } | null>(null);
  const [trendingItems, setTrendingItems] = useState<TrendingItem[]>([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [expandedCardKey, setExpandedCardKey] = useState<string | null>(null);
  const expandingRef = useRef(false);
  // Auto-advance carousel state
  const trendingScrollRef = useRef<HTMLDivElement | null>(null);
  const trendingMobileScrollRef = useRef<HTMLDivElement | null>(null);
  const autoAdvanceRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [trendingPaused, setTrendingPaused] = useState(false);
  const [sponsoredNativeCampaigns, setSponsoredNativeCampaigns] = useState<BeAdCampaign[]>([]);

  useEffect(() => {
    let cancelled = false;
    ads.getBanner('homepage_hero_aicard').then((res) => {
      if (cancelled) return;
      const campaign = res.status === 'success' ? res.data ?? null : null;
      if (heroCoinFlipRef.current === null) {
        heroCoinFlipRef.current = Math.random() < 0.5; // true = show sponsored this load
      }
      if (campaign && heroCoinFlipRef.current) {
        setSponsoredCampaign(campaign);
        ads.trackImpression(campaign.id);
      }
    }).catch(() => {
      // Silently fall through to organic — a failed ad fetch should never block
      // "Jogjagem's Pick" from showing.
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (destinations.length === 0) return;
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

    // If parent already fetched a pick (e.g. from App.tsx aiPicks), use it directly
    // to avoid a duplicate recommendMulti API call.
    if (initialAiPick) {
      const dest = destinations.find(d => d.id?.toLowerCase() === initialAiPick.destinationId?.toLowerCase());
      if (dest) {
        setRecommendation({
          headline: initialAiPick.headline,
          reason: initialAiPick.reason,
          dest,
          crowd: initialAiPick.crowd,
          image: dest.images?.[0]?.url ?? '',
          temp: dest.weather?.temp || '26°C',
          condition: dest.weather?.condition || 'Sunny',
          distance: '18 min',
        });
        return; // skip independent fetch
      }
    }

    const fetchAIRecommendation = async () => {
      try {
        const res = await ai.recommendMulti(timeOfDay);
        if (res.status === 'success' && res.data?.items?.length) {
          const { destinationId, headline, reason, crowd } = res.data.items[0];
          const recommendedDest = destinations.find(d => d.id?.toLowerCase() === destinationId?.toLowerCase());
          if (recommendedDest) {
            setRecommendation({
              headline, reason, dest: recommendedDest, crowd,
              image: recommendedDest.images?.[0]?.url ?? '',
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

    Promise.all([
      ai.trending(),
      ads.getBanner('homepage_hero_trending').catch(() => null),
    ]).then(([trendingRes, nativeRes]) => {
      if (cancelled) return;

      let organic: TrendingItem[] = [];
      if (trendingRes.status === 'success' && trendingRes.data?.items?.length) {
        organic = trendingRes.data.items.slice(0, 10);
      }

      // Collect native campaign(s) if any
      const nativeCampaign = nativeRes?.status === 'success' ? nativeRes.data ?? null : null;
      if (nativeCampaign) setSponsoredNativeCampaigns([nativeCampaign]);

      // Inject sponsored at positions 3 and 8 (0-indexed: 2 and 7)
      let merged: TrendingItem[] = [...organic];
      if (nativeCampaign && organic.length > 0) {
        const sponsored: TrendingItem = {
          type: 'destination',
          id: `sponsored-${nativeCampaign.id}`,
          badge: 'Disponsori',
          badgeType: 'sponsored',
          headline: nativeCampaign.business_name || nativeCampaign.partner_name || 'Promo Spesial',
          reason: '',
          imageUrl: nativeCampaign.image_url,
          rating: 0,
          distance: '',
          location: '',
          isSponsored: true,
          campaignId: nativeCampaign.id,
          targetUrl: nativeCampaign.target_url,
        };
        // Insert at pos 2 (3rd) and pos 7 (8th), adjusting for earlier insertion
        if (merged.length >= 2) merged.splice(2, 0, sponsored);
        if (merged.length >= 8) merged.splice(8, 0, { ...sponsored, id: `sponsored-${nativeCampaign.id}-b` });
      }

      setTrendingItems(merged);
    }).catch(() => {
      ai.trending().then(res => {
        if (cancelled) return;
        if (res.status === 'success' && res.data?.items?.length) setTrendingItems(res.data.items.slice(0, 10));
      }).catch(() => { });
    }).finally(() => { if (!cancelled) setTrendingLoading(false); });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  // Auto-advance carousel for trending (4s interval, paused on hover/expand)
  useEffect(() => {
    if (trendingItems.length === 0) return;
    if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current);

    autoAdvanceRef.current = setInterval(() => {
      if (trendingPaused || expandedCardKey) return;
      const CARD_W_DESKTOP = 140 + 12; // w-[140px] + gap-3
      const CARD_W_MOBILE = 100 + 8;   // w-[100px] + gap-2
      [trendingScrollRef.current, trendingMobileScrollRef.current].forEach((el, i) => {
        if (!el) return;
        const cardW = i === 0 ? CARD_W_DESKTOP : CARD_W_MOBILE;
        const maxScroll = el.scrollWidth - el.clientWidth;
        const next = el.scrollLeft + cardW;
        el.scrollTo({ left: next >= maxScroll ? 0 : next, behavior: 'smooth' });
      });
    }, 4000);

    return () => { if (autoAdvanceRef.current) clearInterval(autoAdvanceRef.current); };
  }, [trendingItems, trendingPaused, expandedCardKey]);

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

  // Reusable trending card renderer — tap to expand (mobile-first interactive)
  const renderTrendingCard = (item: TrendingItem, keyPrefix: string, rank: number) => {
    const cardKey = `${keyPrefix}-${item.type}-${item.id}`;
    // Sponsored badge is always gold; organic uses BADGE_COLOR map
    const badgeColor = item.isSponsored ? 'bg-gold-500' : (BADGE_COLOR[item.badgeType ?? ''] ?? 'bg-gold-500');
    const dest = !item.isSponsored && item.type === 'destination' ? destinations.find(d => d.id === item.id) : null;
    const isExpanded = expandedCardKey === cardKey;
    const isMobile = keyPrefix === 'mobile';

    const handleCardClick = (e: React.MouseEvent) => {
      // Sponsored: track click + open targetUrl directly (may be external)
      if (item.isSponsored && item.campaignId && item.targetUrl) {
        e.preventDefault();
        ads.trackClick(item.campaignId);
        window.open(item.targetUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      // On mobile: first tap expands, second tap navigates
      if (isMobile) {
        if (!isExpanded) {
          e.preventDefault();
          expandingRef.current = true;
          setExpandedCardKey(cardKey);
          setTimeout(() => { expandingRef.current = false; }, 350);
          return;
        }
        // Second tap — close (navigation happens via CTA button)
        expandingRef.current = true;
        setExpandedCardKey(null);
        setTimeout(() => { expandingRef.current = false; }, 350);
        return;
      }
      // Desktop: navigate directly
      if (dest) onExploreDestination(dest);
      else if (item.type === 'destination') router.push(`/destinations/${item.id}`);
      else if (item.type === 'event') router.push(`/events/${item.id}`);
    };

    const handleCTA = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (item.isSponsored && item.campaignId && item.targetUrl) {
        ads.trackClick(item.campaignId);
        window.open(item.targetUrl, '_blank', 'noopener,noreferrer');
        return;
      }
      if (dest) onExploreDestination(dest);
      else if (item.type === 'destination') router.push(`/destinations/${item.id}`);
      else if (item.type === 'event') router.push(`/events/${item.id}`);
    };

    const handleSave = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (dest) onToggleSave(dest);
    };

    // IntersectionObserver for sponsored impression (min 1s visible)
    const sponsoredImpressionRef = (el: HTMLDivElement | null) => {
      if (!el || !item.isSponsored || !item.campaignId) return;
      let timer: ReturnType<typeof setTimeout> | null = null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            timer = setTimeout(() => { ads.trackImpression(item.campaignId!); obs.disconnect(); }, 1000);
          } else {
            if (timer) { clearTimeout(timer); timer = null; }
          }
        },
        { threshold: 0.5 }
      );
      obs.observe(el);
    };

    return (
      <div
        key={cardKey}
        ref={item.isSponsored ? sponsoredImpressionRef : undefined}
        className={`shrink-0 snap-start relative rounded-xl overflow-hidden text-left cursor-pointer select-none
          transition-all duration-300 ease-out
          ${item.isSponsored ? 'ring-1 ring-gold-400/50' : ''}
          ${isMobile
            ? isExpanded
              ? 'w-[200px] h-[220px] border border-gold-500/40'
              : 'w-[100px] h-[130px] border border-white/10 hover:border-gold-500/30'
            : 'w-[140px] h-[120px] border border-white/10 hover:border-gold-500/30'
          }
        `}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(e as any); }}
        aria-expanded={isMobile ? isExpanded : undefined}
      >
        {/* Image — full card */}
        <div className="absolute inset-0">
          {item.imageUrl
            ? <Image src={item.imageUrl} alt={item.headline} fill sizes="200px" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            : <div className="w-full h-full bg-stone-900 flex items-center justify-center"><CalendarDays className="h-8 w-8 text-white/20" /></div>
          }
        </div>

        {/* Gradient scrim */}
        <div className={`absolute inset-0 bg-gradient-to-t ${isExpanded && isMobile ? 'from-black/90 via-black/40 to-black/10' : 'from-black/75 via-black/10 to-transparent'}`} />

        {/* Rank number top-left — hidden for sponsored */}
        {!item.isSponsored && (
          <span className="absolute top-2 left-2 z-10 flex items-center justify-center w-5 h-5 rounded-full bg-gold-500 text-royal-950 text-[9px] font-black leading-none shadow-lg">
            {rank}
          </span>
        )}

        {/* Badge top-left — gold for sponsored, category color for organic */}
        <span className={`absolute top-2 ${item.isSponsored ? 'left-2' : 'left-8'} ${badgeColor} text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none`}>
          {item.isSponsored ? 'Disponsori' : item.badge}
        </span>

        {/* Event chip top-right */}
        {item.type === 'event' && !isExpanded && (
          <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white/80 text-[8px] px-1 py-0.5 rounded-full leading-none flex items-center gap-0.5">
            <CalendarDays className="h-2 w-2" />{t('hero.event')}
          </span>
        )}

        {/* Save button — expanded mobile destinations */}
        {isExpanded && isMobile && dest && (
          <button
            onClick={handleSave}
            className="absolute top-2 right-2 h-6 w-6 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
          >
            <Heart className={`h-3 w-3 transition-all ${isSaved(dest.id) ? 'fill-red-500 text-red-500' : 'text-white'}`} />
          </button>
        )}

        {/* Info overlay — bottom */}
        <div className={`absolute bottom-0 left-0 right-0 flex flex-col transition-all duration-300 ${isExpanded && isMobile ? 'p-2.5' : 'px-2 pb-2 lg:px-2.5 lg:pb-2.5'}`}>
          <p className={`font-bold text-white leading-tight drop-shadow-sm transition-all duration-300 ${isExpanded && isMobile ? 'text-[11px] line-clamp-2 mb-1.5' : 'text-[10px] lg:text-[11px] line-clamp-2 mb-1'}`}>
            {item.headline}
          </p>

          <div className="flex items-center gap-1">
            {item.type === 'destination' && item.rating > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-gold-400 font-semibold">
                <Star className="h-2.5 w-2.5 fill-gold-400" />{item.rating.toFixed(1)}
              </span>
            )}
            {item.location && isExpanded && isMobile && (
              <span className="text-[9px] text-white/60 truncate flex items-center gap-0.5">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                {item.location}
              </span>
            )}
          </div>

          {/* Expanded panel — mobile only */}
          {isExpanded && isMobile && (
            <div className="mt-2 space-y-2">
              {/* AI reason */}
              {item.reason && (
                <p className="text-[9px] text-white/65 leading-relaxed line-clamp-3">{item.reason}</p>
              )}

              {/* CTA */}
              <button
                onClick={handleCTA}
                className="w-full flex items-center justify-center gap-1 bg-gold-500 active:bg-gold-600 active:scale-[0.97] text-royal-950 font-bold text-[10px] py-1.5 rounded-lg transition-all"
              >
                {item.type === 'event' ? t('hero.event_cta') || 'Lihat Event' : t('hero.explore_cta') || 'Explore'}
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>
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
          <div className="relative mx-auto w-full max-w-7xl flex flex-col flex-1 px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-0 pb-0 lg:justify-center lg:pb-[340px]">

            {/* RECOMMENDATIONS */}
            {sponsoredCampaign ? (
              <div className="absolute top-[22px] right-4 sm:right-6 lg:right-8 z-20 w-[140px] sm:w-[185px] lg:w-[210px] flex flex-col gap-3">
                <AIPickCard
                  recommendation={{ dest: {} as Destination }}
                  isSaved={isSaved}
                  onToggleSave={onToggleSave}
                  onExplore={onExploreDestination}
                  onDismiss={() => setIsRecommendationDismissed(true)}
                  sizes="(max-width: 640px) 140px, (max-width: 1024px) 185px, 210px"
                  className="relative w-full animate-fade-in"
                  sponsored={sponsoredCampaign}
                />
                <NearbyMapCard />
              </div>
            ) : recommendation ? (
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
                  <span>{t(greetingKey, { name: userName })}</span>
                </span>
                <h1 className="font-display text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-white drop-shadow-lg leading-[1.1]">
                  {heroConfig.title} <br />
                  <span className="font-display italic text-gold-400 font-normal mt-1 sm:mt-2 block tracking-normal">{heroConfig.titleAccent}</span>
                </h1>
                <p className="text-sm sm:text-base max-w-xl font-light text-white/90 drop-shadow-md leading-relaxed">{heroConfig.subtitle}</p>
                <div className="max-w-xl w-full pt-4 md:pt-5">
                  <SearchBar
                    id="hero-conversational-search-form"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSubmit={() => { if (searchQuery.trim()) onSearchSubmit(searchQuery); }}
                    placeholder={t('hero.search_placeholder')}
                    rotatingClues={searchClues}
                    onRotatingClueClick={(clue) => {
                      setSearchQuery(clue);
                      onSearchSubmit(clue);
                    }}
                    showImageSearch
                    showVoiceSearch
                    onImageSearch={async (file) => {
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
                      finally { setIsUploadingImage(false); }
                    }}
                    onVoiceSearch={handleVoiceSearch}
                    isUploadingImage={isUploadingImage}
                    isListening={isListening}
                  />

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

            {/* Route Map Itinerary — mobile/tablet only (in-flow) */}
            <div className="block lg:hidden mt-12 mb-4">
              <RouteMapItinerary
                destinations={destinations}
                events={events}
                coords={coords}
                onExploreDestination={onExploreDestination}
              />
            </div>

            {/* Trending Now — mobile/tablet */}
            <div className="block lg:hidden pb-[82px]">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-gold-400 text-xs">✦</span>
                <span className="text-[11px] font-bold text-white tracking-wide">{t('hero.trending')}</span>
                <span className="text-gold-400 text-xs">✦</span>
              </div>
              <div
                ref={trendingMobileScrollRef}
                className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
                onScroll={() => { if (!expandingRef.current && expandedCardKey) setExpandedCardKey(null); }}
                onMouseEnter={() => setTrendingPaused(true)}
                onMouseLeave={() => setTrendingPaused(false)}
                onTouchStart={() => setTrendingPaused(true)}
                onTouchEnd={() => setTimeout(() => setTrendingPaused(false), 2000)}
              >
                {trendingLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-[100px] snap-start bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-pulse">
                      <div className="h-[60px] bg-white/10" /><div className="p-2 space-y-1"><div className="h-2 w-16 bg-white/10 rounded" /><div className="h-3 w-full bg-white/10 rounded" /></div>
                    </div>
                  ))
                  : trendingItems.map((item, idx) => renderTrendingCard(item, 'mobile', idx + 1))
                }
              </div>
            </div>

            {/* Region chips — mobile/tablet */}
            <div className="block lg:hidden pb-4">
              <nav aria-label="Wisata per Wilayah Jogja" className="flex flex-wrap gap-2">
                {[
                  { slug: 'kota-yogyakarta', label: 'Kota Yogyakarta', title: 'Wisata Kota Yogyakarta' },
                  { slug: 'sleman', label: 'Sleman', title: 'Wisata Sleman & Merapi' },
                  { slug: 'bantul', label: 'Bantul', title: 'Wisata Pantai & Kerajinan Bantul' },
                  { slug: 'kulon-progo', label: 'Kulon Progo', title: 'Wisata Alam Kulon Progo' },
                  { slug: 'gunungkidul', label: 'Gunungkidul', title: 'Wisata Pantai & Gua Gunungkidul' },
                ].map(({ slug, label, title }) => (
                  <button
                    key={slug}
                    title={title}
                    aria-label={title}
                    onClick={() => router.push(`/location/${slug}`)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border border-white/15 text-white/60 hover:border-gold-400/50 hover:text-gold-400 hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </nav>
            </div>

          </div>{/* end main content */}


          {/* RouteMap — desktop only, pinned above Trending */}
          <div className="hidden lg:block absolute bottom-[168px] left-0 right-0 z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="max-w-[calc(100%-360px)]">
                <RouteMapItinerary
                  destinations={destinations}
                  events={events}
                  coords={coords}
                  onExploreDestination={onExploreDestination}
                />
              </div>
            </div>
          </div>

          {/* Trending Now — desktop only, pinned above slide controls */}
          <div className="hidden lg:block absolute bottom-[56px] left-0 right-0 z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-gold-400 text-xs">✦</span>
                <span className="text-[11px] font-bold text-white tracking-wide">{t('hero.trending')}</span>
                <span className="text-gold-400 text-xs">✦</span>
              </div>
              <div
                ref={trendingScrollRef}
                className="flex gap-3 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory"
                onMouseEnter={() => setTrendingPaused(true)}
                onMouseLeave={() => setTrendingPaused(false)}
              >
                {trendingLoading
                  ? Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="shrink-0 w-[140px] snap-start bg-white/5 border border-white/10 rounded-xl overflow-hidden animate-pulse">
                      <div className="h-[80px] bg-white/10" /><div className="p-2.5 space-y-1.5"><div className="h-2 w-16 bg-white/10 rounded" /><div className="h-3 w-full bg-white/10 rounded" /><div className="h-2 w-10 bg-white/10 rounded" /></div>
                    </div>
                  ))
                  : trendingItems.map((item, idx) => renderTrendingCard(item, 'desktop', idx + 1))
                }
              </div>
            </div>
          </div>

          {/* Region chips — desktop, pinned below Trending Now */}
          <div className="hidden lg:block absolute bottom-4 left-0 right-0 z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <nav aria-label="Wisata per Wilayah Jogja" className="flex flex-wrap gap-2">
                {[
                  { slug: 'kota-yogyakarta', label: 'Kota Yogyakarta', title: 'Wisata Kota Yogyakarta' },
                  { slug: 'sleman', label: 'Sleman', title: 'Wisata Sleman & Merapi' },
                  { slug: 'bantul', label: 'Bantul', title: 'Wisata Pantai & Kerajinan Bantul' },
                  { slug: 'kulon-progo', label: 'Kulon Progo', title: 'Wisata Alam Kulon Progo' },
                  { slug: 'gunungkidul', label: 'Gunungkidul', title: 'Wisata Pantai & Gua Gunungkidul' },
                ].map(({ slug, label, title }) => (
                  <button
                    key={slug}
                    title={title}
                    aria-label={title}
                    onClick={() => router.push(`/location/${slug}`)}
                    className="px-3 py-1 rounded-full text-xs font-semibold border border-white/15 text-white/60 hover:border-gold-400/50 hover:text-gold-400 hover:bg-white/5 transition-all duration-200 cursor-pointer"
                  >
                    {label}
                  </button>
                ))}
              </nav>
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
