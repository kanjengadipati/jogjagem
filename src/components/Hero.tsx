import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronLeft, ChevronRight, Mic, MicOff, Camera, Loader2, MapPin, Car, Users, Bookmark } from 'lucide-react';
import { Destination } from '../types';
import { ai } from '../lib/api';

interface HeroProps {
  destinations: Destination[];
  onSearchSubmit: (query: string) => void;
  onImageSearchSubmit: (imageUrl: string, reply: string, matchedDestinationIds: string[]) => void;
  onExploreDestination: (dest: Destination) => void;
  onToggleSave: (dest: Destination) => void;
  isSaved: (id: string) => boolean;
}

const HERO_SLIDES = [
  {
    id: 'prambanan',
    name: 'Prambanan Temple',
    tagline: 'Witness the majestic 9th-century Hindu spires rising against the golden sky.',
    image: 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?auto=format&fit=crop&w=1600&q=80',
    credit: 'Eugenia Clara'
  },
  {
    id: 'parangtritis',
    name: 'Parangtritis Beach',
    tagline: 'Where the black volcanic sand acts as a mirror for the mystical Southern Ocean sunset.',
    image: 'https://images.unsplash.com/photo-1602137704924-9a038cfb5253?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    id: 'merapi',
    name: 'Mount Merapi',
    tagline: 'Feel the thrill of riding vintage 4x4 Willys jeeps through fresh volcanic ash paths.',
    image: 'https://images.unsplash.com/photo-1556375403-b96342fc0ee2?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  },
  {
    id: 'tamansari',
    name: 'Taman Sari Water Castle',
    tagline: 'Explore hidden underground tunnels and secret bath pools of the ancient Sultans.',
    image: 'https://images.unsplash.com/photo-1625506276715-76ad63823181?auto=format&fit=crop&w=1600&q=80',
    credit: 'Gading Ihsan'
  },
  {
    id: 'goajomblang',
    name: 'Goa Jomblang Cave',
    tagline: 'Descend into a vertical primeval forest to catch the blinding column of heavenly light.',
    image: 'https://images.unsplash.com/photo-1628047563315-d1e8b8d222b9?auto=format&fit=crop&w=1600&q=80',
    credit: 'Unsplash'
  }
];

export default function Hero({ destinations, onSearchSubmit, onImageSearchSubmit, onExploreDestination, onToggleSave, isSaved }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [heroConfig, setHeroConfig] = useState({
    title: 'Jogja is',
    titleAccent: 'Calling You',
    subtitle: 'Discover unforgettable places, authentic experiences, and warm Javanese hospitality.',
    ctaText: 'Mulai Jelajahi',
  });

  const [recommendation, setRecommendation] = useState<{
    headline: string;
    reason: string;
    dest: Destination;
    image: string;
    temp: string;
    condition: string;
    distance: string;
    crowd: string;
  } | null>(null);

  useEffect(() => {
    const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';
    fetch(`${API_BASE}/config/seo?category=landing`)
      .then(r => r.json())
      .then(data => {
        if (data?.data) {
          const cfg = data.data;
          if (cfg.landing_hero_title) {
            const parts = cfg.landing_hero_title.split('\n');
            setHeroConfig({
              title: parts[0] || 'Jogja is',
              titleAccent: parts[1] || 'Calling You',
              subtitle: cfg.landing_hero_subtitle || heroConfig.subtitle,
              ctaText: cfg.landing_cta_text || heroConfig.ctaText,
            });
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (destinations.length === 0) return;

    // Determine time of day for contextual recommendations
    const hour = new Date().getHours();
    const timeOfDay = hour < 11 ? 'morning' : hour < 15 ? 'afternoon' : hour < 18 ? 'afternoon' : 'evening';

    // Set initial fast fallback from catalog before API responds
    const fallbackDest = destinations.find(d => d.id === 'merapi' || d.id === 'prambanan') || destinations[0];
    if (fallbackDest) {
      setRecommendation({
        headline: "Great outdoor adventure today ⛰️",
        reason: fallbackDest.tagline,
        dest: fallbackDest,
        image: fallbackDest.images && fallbackDest.images[0] ? fallbackDest.images[0].url : "https://images.unsplash.com/photo-1556375403-b96342fc0ee2?auto=format&fit=crop&w=400&q=80",
        temp: fallbackDest.weather?.temp || "26°C",
        condition: fallbackDest.weather?.condition || "Sunny",
        distance: "18 min",
        crowd: "Low"
      });
    }

    const fetchAIRecommendation = async () => {
      try {
        // Call the dedicated /ai/recommend endpoint
        const res = await ai.recommend(timeOfDay);

        if (res.status === 'success' && res.data) {
          const { destinationId, headline, reason, crowd } = res.data;

          // Find the destination in local catalog by id (case-insensitive)
          const recommendedDest = destinations.find(
            d => d.id?.toLowerCase() === destinationId?.toLowerCase()
          );

          if (recommendedDest) {
            const image = recommendedDest.images && recommendedDest.images[0]
              ? recommendedDest.images[0].url
              : "https://images.unsplash.com/photo-1556375403-b96342fc0ee2?auto=format&fit=crop&w=400&q=80";

            setRecommendation({
              headline,
              reason,
              dest: recommendedDest,
              image,
              temp: recommendedDest.weather?.temp || "26°C",
              condition: recommendedDest.weather?.condition || "Sunny",
              distance: "18 min",
              crowd,
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch AI recommendation", err);
      }
    };

    fetchAIRecommendation();
  }, [destinations]);

  const handleImageButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }

    setIsUploadingImage(true);

    try {
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = error => reject(error);
      });

      const previewUrl = URL.createObjectURL(file);

      const responseData = await ai.imageSearch(base64Data, file.type);
      if (responseData.status === 'success' && responseData.data) {
        const { reply, matchedDestinationIds } = responseData.data;
        const safeIds = Array.isArray(matchedDestinationIds) ? matchedDestinationIds : [];
        onImageSearchSubmit(previewUrl, reply, safeIds);
      } else {
        throw new Error(responseData.message || "Failed to analyze image");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error scanning image: " + err.message);
    } finally {
      setIsUploadingImage(false);
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];
  const matchedDest = destinations.find(d => d.id === slide.id);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearchSubmit(searchQuery);
    }
  };

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Please try Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID'; // Supports Indonesian query, since Jogja is in Indonesia
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        setSearchQuery(transcript);
        onSearchSubmit(transcript);
      }
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const handleExplore = () => {
    if (matchedDest) {
      onExploreDestination(matchedDest);
    }
  };

  const handleSave = () => {
    if (matchedDest) {
      onToggleSave(matchedDest);
    }
  };

  return (
    <div 
      id="hero-section-container" 
      className="relative min-h-screen md:min-h-[900px] lg:h-[90vh] lg:min-h-[780px] w-full overflow-hidden bg-royal-950 transition-all duration-700"
    >
      {/* Background Slides */}
      {HERO_SLIDES.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? 'opacity-70 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
          style={{ transitionProperty: 'opacity, transform' }}
        >
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover object-center filter brightness-90"
            referrerPolicy="no-referrer"
          />
          {/* Elegant Dark Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-royal-950 via-royal-950/20 to-royal-950/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-royal-950/40 via-transparent to-royal-950/40" />
        </div>
      ))}

      {/* Hero Interactive Area */}
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pb-8 sm:pb-16 md:pb-20 lg:pb-24 sm:px-6 lg:px-8 pt-20 sm:pt-32 md:pt-28">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end md:items-center w-full">
          
          {/* Left Column: Title and Search */}
          <div className="md:col-span-7 lg:col-span-8 space-y-5 sm:space-y-6 text-left animate-fade-in">
            <span className="inline-flex items-center space-x-2 font-sans text-[10px] uppercase tracking-[0.08em] text-gold-400 font-semibold drop-shadow-md">
              <span>☀ GOOD MORNING, EXPLORER</span>
            </span>
            
            <h1 className="font-display text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-white drop-shadow-lg leading-[1.1]">
              {heroConfig.title} <br />
              <span className="font-display italic text-gold-400 font-normal mt-1 sm:mt-2 block tracking-normal">
                {heroConfig.titleAccent}
              </span>
            </h1>
            
            <p className="text-sm sm:text-base max-w-xl font-light text-white/90 drop-shadow-md leading-relaxed">
              {heroConfig.subtitle}
            </p>

            {/* Premium Transparent/Semi-transparent Search Bar Pill with High Legibility */}
            <div className="max-w-xl w-full pt-1">
              <form 
                id="hero-conversational-search-form"
                onSubmit={handleSearchSubmit} 
                className="relative flex items-center rounded-full border border-white/20 bg-black/35 hover:bg-black/45 backdrop-blur-md p-1 shadow-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-gold-500/50 focus-within:border-gold-400"
              >
                <Search className="ml-4 h-5 w-5 text-white/70 shrink-0" />
                
                <input
                  type="text"
                  placeholder="Where would you like to explore today?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-3 pl-3 pr-36 sm:pr-14 text-sm text-white placeholder-white/60 focus:outline-none font-sans"
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="absolute right-1 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={handleImageButtonClick}
                    disabled={isUploadingImage}
                    className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all shrink-0 disabled:opacity-50"
                    title="Search by image"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Camera className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`flex h-9 w-9 items-center justify-center rounded-full transition-all shrink-0 ${
                      isListening
                        ? 'bg-red-500/20 text-red-400 animate-pulse'
                        : 'hover:bg-white/10 text-white/70 hover:text-white'
                    }`}
                    title="Search by voice"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button
                    type="submit"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 hover:bg-gold-600 active:scale-95 text-white transition-all shadow-md shrink-0"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </form>
              
              {/* Search Suggestions Pills exactly like mockup */}
              <div className="hidden md:flex mt-3.5 flex-wrap items-center gap-2 text-xs text-white/90 px-1">
                <span className="text-white/60 font-medium">Try:</span>
                {[
                  { label: 'Best sunset', value: 'Best sunset' },
                  { label: 'Hidden waterfall', value: 'Hidden waterfall' },
                  { label: 'Coffee with view', value: 'Coffee with view' },
                  { label: 'Festival tonight', value: 'Festival tonight' }
                ].map((pill) => (
                  <button 
                    key={pill.label}
                    type="button" 
                    onClick={() => {
                      setSearchQuery(pill.value);
                      onSearchSubmit(pill.value);
                    }} 
                    className="bg-black/30 hover:bg-black/50 border border-white/10 hover:border-gold-500/40 px-3.5 py-1 rounded-full text-[11px] font-sans text-white/90 transition-all cursor-pointer"
                  >
                    '{pill.label}'
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Recommendation Widget */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col justify-end items-end w-full">
            {recommendation ? (
              <div className="w-full max-w-full md:max-w-[380px] lg:max-w-[420px] bg-stone-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 lg:p-5 text-left shadow-2xl animate-fade-in">
                {/* Header */}
                <div className="flex items-center space-x-2 mb-2 lg:mb-3">
                  <span className="text-gold-400 text-xs lg:text-sm">✦✦</span>
                  <span className="text-[9px] lg:text-[10px] font-sans tracking-[0.12em] uppercase font-bold text-gold-400">AI Recommendation</span>
                </div>

                {/* Main Content: text + image */}
                <div className="flex gap-3 lg:gap-4 mb-3 lg:mb-4">
                  {/* Left: text */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm lg:text-base font-bold text-white leading-snug mb-1">
                      {recommendation.headline}
                    </h3>
                    <p className="text-[10px] lg:text-[12px] text-white/60 leading-relaxed mb-2 lg:mb-3 line-clamp-3">
                      {recommendation.reason}
                    </p>

                    {/* Location */}
                    <div className="flex items-start space-x-1.5">
                      <MapPin className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-gold-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs lg:text-sm font-bold text-white truncate max-w-[150px] lg:max-w-[200px]">
                          {recommendation.dest.name}
                        </p>
                        <p className="text-[9px] lg:text-[11px] text-white/50">
                          {recommendation.dest.subRegion ? `${recommendation.dest.subRegion}, ` : ''}Yogyakarta
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right: image */}
                  <div className="shrink-0 w-[80px] lg:w-[110px]">
                    <img
                      src={recommendation.image}
                      alt={recommendation.dest.name}
                      className="w-full h-[100px] lg:h-[120px] object-cover rounded-xl shadow-md border border-white/5"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Stats Chips (Moved below image & text to span full width) */}
                <div className="flex items-center gap-1.5 lg:gap-2 flex-wrap mb-3 lg:mb-4">
                  <div className="flex items-center space-x-1 lg:space-x-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1 lg:px-2.5 lg:py-1.5">
                    <span className="text-[10px] lg:text-xs">☀️</span>
                    <div>
                      <p className="text-[10px] lg:text-[11px] font-bold text-white leading-none">{recommendation.temp}</p>
                      <p className="text-[8px] lg:text-[9px] text-white/50">{recommendation.condition}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 lg:space-x-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1 lg:px-2.5 lg:py-1.5">
                    <Car className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-green-400" />
                    <div>
                      <p className="text-[10px] lg:text-[11px] font-bold text-white leading-none">{recommendation.distance}</p>
                      <p className="text-[8px] lg:text-[9px] text-white/50">from you</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 lg:space-x-1.5 bg-white/5 border border-white/10 rounded-lg px-2 py-1 lg:px-2.5 lg:py-1.5">
                    <Users className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-purple-400" />
                    <div>
                      <p className="text-[10px] lg:text-[11px] font-bold text-white leading-none">{recommendation.crowd}</p>
                      <p className="text-[8px] lg:text-[9px] text-white/50">Crowd</p>
                    </div>
                  </div>
                </div>

                {/* CTA Row */}
                <div className="flex items-center gap-2 lg:gap-3 mt-1">
                  <button
                    onClick={() => onExploreDestination(recommendation.dest)} 
                    className="flex-1 flex items-center justify-center space-x-1.5 bg-gold-500 hover:bg-gold-400 active:scale-95 text-stone-950 font-bold text-xs lg:text-sm py-2 lg:py-2.5 px-3 lg:px-4 rounded-xl transition-all shadow-lg shadow-gold-500/20 cursor-pointer"
                  >
                    <span>Explore {recommendation.dest.name.split(' ')[0]}</span>
                    <span>→</span>
                  </button>
                  
                  {(() => {
                    const isRecommendationSaved = isSaved(recommendation.dest.id);
                    return (
                      <button 
                        onClick={() => onToggleSave(recommendation.dest)}
                        className={`flex items-center space-x-1 lg:space-x-1.5 transition-colors text-[10px] lg:text-xs font-medium cursor-pointer whitespace-nowrap ${
                          isRecommendationSaved ? 'text-gold-400 font-semibold' : 'text-white/60 hover:text-white/90'
                        }`}
                      >
                        <Bookmark className={`h-3 w-3 lg:h-3.5 lg:w-3.5 ${isRecommendationSaved ? 'fill-gold-400 text-gold-400' : ''}`} />
                        <span>{isRecommendationSaved ? 'Saved' : 'Save for later'}</span>
                      </button>
                    );
                  })()}
                </div>

                {/* Footer */}
                <div className="flex items-center space-x-1.5 mt-2.5 lg:mt-3 pt-2.5 lg:pt-3 border-t border-white/10">
                  <span className="text-gold-400 text-[9px] lg:text-[10px]">✦✦</span>
                  <p className="text-[9px] lg:text-[10px] text-white/40">Recommendations are personalized based on weather, time &amp; popular places.</p>
                </div>
              </div>
            ) : (
              /* Skeleton Loader */
              <div className="w-full max-w-full md:max-w-[380px] lg:max-w-[420px] bg-stone-950/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-left shadow-2xl animate-pulse">
                <div className="h-3 w-28 bg-white/10 rounded mb-4" />
                <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-white/15 rounded mb-2" />
                    <div className="h-3 w-full bg-white/10 rounded mb-1" />
                    <div className="h-3 w-2/3 bg-white/10 rounded mb-3" />
                    <div className="h-4 w-24 bg-white/10 rounded" />
                  </div>
                  <div className="shrink-0 w-[110px] h-[120px] bg-white/10 rounded-xl" />
                </div>
                <div className="h-8 w-full bg-white/15 rounded-xl" />
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar: Slider Indicators, Navigation Arrows and Location Label */}
        <div className="hidden md:flex mt-12 pt-6 border-t border-white/10 items-center justify-between w-full gap-4">
          
          {/* Location Badge on Left */}
          <div className="flex items-center space-x-2.5 text-white/90">
            <span className="text-gold-400 text-sm">📍</span>
            <div className="text-left">
              <span className="block text-sm font-bold tracking-tight text-white">{slide.name}</span>
              <span className="block text-[10px] font-mono text-white/50 tracking-wider">Sleman, Yogyakarta</span>
            </div>
          </div>

          {/* Slider line indicators and circle arrows */}
          <div className="flex items-center space-x-6">
            
            {/* Slider lines */}
            <div className="flex items-center space-x-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-0.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentSlide ? 'w-8 bg-gold-400' : 'w-4 bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Slider Circle Arrow Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="h-8 w-8 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="h-8 w-8 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/5 flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Photo Credit */}
            <div className="text-[10px] font-mono text-white/40 mt-1">
              Photo: {HERO_SLIDES[currentSlide].credit} / Unsplash
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
