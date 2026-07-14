import React, { useState, useEffect, useRef } from 'react';
import { Compass, Heart, Search, ChevronLeft, ChevronRight, Mic, MicOff, Camera, Loader2 } from 'lucide-react';
import { DESTINATIONS, getPhotoCredit } from '../data';
import { Destination } from '../types';
import { ai } from '../lib/api';

interface HeroProps {
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
    image: 'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'parangtritis',
    name: 'Parangtritis Beach',
    tagline: 'Where the black volcanic sand acts as a mirror for the mystical Southern Ocean sunset.',
    image: 'https://images.unsplash.com/photo-1602137704924-9a038cfb5253?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'merapi',
    name: 'Mount Merapi',
    tagline: 'Feel the thrill of riding vintage 4x4 Willys jeeps through fresh volcanic ash paths.',
    image: 'https://images.unsplash.com/photo-1556375403-b96342fc0ee2?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tamansari',
    name: 'Taman Sari Water Castle',
    tagline: 'Explore hidden underground tunnels and secret bath pools of the ancient Sultans.',
    image: 'https://images.unsplash.com/photo-1625506276715-76ad63823181?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'goajomblang',
    name: 'Goa Jomblang Cave',
    tagline: 'Descend into a vertical primeval forest to catch the blinding column of heavenly light.',
    image: 'https://images.unsplash.com/photo-1628047563315-d1e8b8d222b9?auto=format&fit=crop&w=1600&q=80'
  }
];

export default function Hero({ onSearchSubmit, onImageSearchSubmit, onExploreDestination, onToggleSave, isSaved }: HeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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
        const { reply, matchedDestinationIds = [] } = responseData.data;
        onImageSearchSubmit(previewUrl, reply, matchedDestinationIds);
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
  const matchedDest = DESTINATIONS.find(d => d.id === slide.id);

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
      className="relative h-screen md:h-[90vh] min-h-[560px] md:min-h-[780px] w-full overflow-hidden bg-royal-950 transition-all duration-700"
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
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-4 pb-8 sm:pb-16 md:pb-20 lg:pb-24 sm:px-6 lg:px-8 pt-20 sm:pt-40">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center w-full">
          
          {/* Left Column: Title and Search */}
          <div className="lg:col-span-8 space-y-5 sm:space-y-6 text-left animate-fade-in">
            <span className="inline-flex items-center space-x-2 font-sans text-[10px] uppercase tracking-[0.08em] text-gold-400 font-semibold drop-shadow-md">
              <span>☀ GOOD MORNING, EXPLORER</span>
            </span>
            
            <h1 className="font-display text-4xl xs:text-5xl sm:text-6xl lg:text-7xl font-medium tracking-tight text-white drop-shadow-lg leading-[1.1]">
              Jogja is <br />
              <span className="font-display italic text-gold-400 font-normal mt-1 sm:mt-2 block tracking-normal">
                Calling You
              </span>
            </h1>
            
            <p className="text-sm sm:text-base max-w-xl font-light text-white/90 drop-shadow-md leading-relaxed">
              Discover unforgettable places, authentic experiences, and warm Javanese hospitality.
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

          {/* Right Column: AI Recommendation Widget matching mockup */}
          <div className="lg:col-span-4 flex flex-col justify-end items-end w-full">
            <div className="w-full max-w-[340px] bg-stone-950/45 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-left shadow-2xl animate-fade-in">
              <div className="flex items-center space-x-1.5 mb-2">
                <span className="text-xs text-gold-400">✨</span>
                <span className="text-[10px] font-sans tracking-[0.08em] uppercase font-semibold text-gold-400">AI Recommendation</span>
              </div>
              <h3 className="text-sm font-bold text-white leading-snug mb-2">
                Perfect weather for outdoor adventures today!
              </h3>
              <div className="flex items-center space-x-2 text-xs font-semibold text-white/90 mb-3 bg-white/5 py-1 px-3 rounded-lg w-max">
                <span>☀</span>
                <span>28°C • Sunny</span>
              </div>
              <button 
                onClick={() => onSearchSubmit('outdoor adventure')}
                className="text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors flex items-center space-x-1 cursor-pointer"
              >
                <span>See suggestions</span>
                <span>→</span>
              </button>
            </div>
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
              Photo: {getPhotoCredit(HERO_SLIDES[currentSlide].image)} / Unsplash
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
