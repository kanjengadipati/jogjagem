'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Heart, Share2, Star, Clock, Ticket, Sparkles, 
  MapPin, ShieldAlert, CheckCircle, HelpCircle, Thermometer,
  CloudSun, Phone, Tag, Hotel, Coffee, Utensils, Compass, 
  Footprints, MessageSquare, Map, Camera, Video, Eye, Award, 
  ChevronRight, Calendar, Users, Send, AlertTriangle, Play,
  ShoppingBag, Landmark, ArrowRight, Check, HeartHandshake,
  MapPinned, Sunrise, Sunset, Flame, ChevronDown, Sparkle
} from 'lucide-react';
import { Destination, EcosystemPartner, Review } from '@/types';
import { DESTINATIONS, getPhotoCredit } from '@/data';
import AIFloatingAssistant from '@/components/AIFloatingAssistant';

interface DestinationDetailProps {
  destination: Destination;
  onBack: () => void;
  onToggleSave: (dest: Destination) => void;
  isSaved: boolean;
  onSelectPartnerOnMap?: (partner: EcosystemPartner) => void;
}

export default function DestinationDetail({ 
  destination, 
  onBack, 
  onToggleSave, 
  isSaved,
  onSelectPartnerOnMap
}: DestinationDetailProps) {
  // States
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video' | '360' | 'drone' | 'reels'>('photos');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [selectedMapFilter, setSelectedMapFilter] = useState<'all' | 'partner' | 'parking' | 'hotel' | 'resto' | 'guide'>('all');
  const [selectedMapPartner, setSelectedMapPartner] = useState<EcosystemPartner | null>(destination.partners[0] || null);
  const [likedReviewIds, setLikedReviewIds] = useState<Set<string>>(new Set());
  const [bookmarkedTipIds, setBookmarkedTipIds] = useState<Set<number>>(new Set());
  const [activeEcosystemTab, setActiveEcosystemTab] = useState<'stay' | 'eat' | 'experience' | 'shop' | 'move' | 'guide'>('stay');
  const [copied, setCopied] = useState(false);
  
  // Custom Reviews state to support comments/reactions
  const [communityReviews, setCommunityReviews] = useState<Review[]>(destination.reviews);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'Solo' | 'Couple' | 'Family' | 'Friends'>('all');
  const [newCommentText, setNewCommentText] = useState<{[reviewId: string]: string}>({});
  const [reviewComments, setReviewComments] = useState<{[reviewId: string]: {user: string, avatar: string, text: string}[]}>({
    'r1': [
      { user: 'Budi Santoso', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150', text: 'Sangat setuju! Sunrise di sini tiada duanya.' }
    ]
  });

  // Ticket booking modal state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [ticketCategory, setTicketCategory] = useState<'domestic' | 'foreign'>('domestic');
  const [ticketBooked, setTicketBooked] = useState(false);

  // Offer success states
  const [claimedOffers, setClaimedOffers] = useState<Set<string>>(new Set());

  // Interactive Live Journey simulated context
  const [currentAssistantTime, setCurrentAssistantTime] = useState('09:15 AM');
  const [liveCrowdLevel, setLiveCrowdLevel] = useState<'Low' | 'Moderate' | 'High'>('Low');
  const [selectedJourneyActionIdx, setSelectedJourneyActionIdx] = useState<number | null>(null);

  // Clock effect for AI live journey
  useEffect(() => {
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    setCurrentAssistantTime(`${formattedHours}:${minutes} ${ampm}`);

    // Dynamic crowd level mock based on actual time
    if (hours >= 9 && hours <= 14) {
      setLiveCrowdLevel('High');
    } else if (hours >= 15 && hours <= 18) {
      setLiveCrowdLevel('Moderate');
    } else {
      setLiveCrowdLevel('Low');
    }
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLikeReview = (id: string) => {
    const newLiked = new Set(likedReviewIds);
    if (newLiked.has(id)) {
      newLiked.delete(id);
    } else {
      newLiked.add(id);
    }
    setLikedReviewIds(newLiked);
  };

  const toggleBookmarkTip = (idx: number) => {
    const newBookmarks = new Set(bookmarkedTipIds);
    if (newBookmarks.has(idx)) {
      newBookmarks.delete(idx);
    } else {
      newBookmarks.add(idx);
    }
    setBookmarkedTipIds(newBookmarks);
  };

  const handleClaimOffer = (offerId: string) => {
    const newClaimed = new Set(claimedOffers);
    newClaimed.add(offerId);
    setClaimedOffers(newClaimed);
  };

  const handleAddComment = (reviewId: string) => {
    const text = newCommentText[reviewId];
    if (!text || !text.trim()) return;

    const currentComments = reviewComments[reviewId] || [];
    const updated = [
      ...currentComments,
      {
        user: 'You (Traveler)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150',
        text: text.trim()
      }
    ];

    setReviewComments({
      ...reviewComments,
      [reviewId]: updated
    });
    setNewCommentText({
      ...newCommentText,
      [reviewId]: ''
    });
  };

  // Mocked specific details based on current destination to keep it 100% immersive
  const getAIRecommendations = () => {
    switch (destination.id) {
      case 'prambanan':
        return [
          { text: "Walk to the Shiva Temple first (less crowded)", time: "09:20 AM" },
          { text: "Best photography spot is on the north gate archway", time: "10:30 AM" },
          { text: "Golden Hour starts at 5:18 PM tonight", time: "05:18 PM" },
          { text: "Ramayana Ballet open stage starts at 7:30 PM", time: "07:30 PM" },
          { text: "Abhayagiri Scenic Resto is 3.2 km away and perfect for sunset dinner", time: "05:45 PM" }
        ];
      case 'malioboro':
        return [
          { text: "Explore southern pedestrian walk first before shops open", time: "08:30 AM" },
          { text: "Visit Beringharjo Market second floor for pure royal batik roll", time: "10:00 AM" },
          { text: "Lesehan food stall seating gets filled up by 6:30 PM", time: "06:30 PM" },
          { text: "Live gamelan music starting near Tugu monument at 7:00 PM", time: "07:00 PM" }
        ];
      case 'parangtritis':
        return [
          { text: "Head to Gumuk Pasir Dunes first before sand gets extremely hot", time: "09:00 AM" },
          { text: "Hire an ATV to explore the dark volcanic tide pools on the east", time: "03:30 PM" },
          { text: "Reflective mirror photography is best exactly at 5:30 PM", time: "05:30 PM" },
          { text: "Grab fresh grilled sea prawns at Depok Beach", time: "01:00 PM" }
        ];
      case 'merapi':
        return [
          { text: "Lava tour jeeps are best booked before peak 10:00 AM heat", time: "07:30 AM" },
          { text: "Visit Underground Kaliadem Bunker (temperature drops inside)", time: "11:00 AM" },
          { text: "Try a warm cup of robusta roasted over volcanic soil at Kopi Merapi", time: "01:30 PM" },
          { text: "Heavy afternoon mountain mist starts rolling in around 3 PM", time: "03:00 PM" }
        ];
      case 'tamansari':
        return [
          { text: "Take the secret passage into the central Bathing Pools", time: "09:15 AM" },
          { text: "Sumur Gumuling underground staircase light beam peaks at noon", time: "11:45 AM" },
          { text: "Stroll around the pastel corridors of Cyber Village", time: "02:00 PM" },
          { text: "Cool down at the local boutique Water Castle Cafe", time: "03:00 PM" }
        ];
      default:
        return [
          { text: "Arrive immediately to secure local guide entry", time: "08:30 AM" },
          { text: "Peak sunlight creates stunning light play across the structures", time: "11:30 AM" },
          { text: "Check with local information center for evening festivals", time: "04:30 PM" }
        ];
    }
  };

  const getSuggestedTimeline = () => {
    switch (destination.id) {
      case 'prambanan':
        return [
          { time: "08:00", title: "Prambanan Morning Exploration", desc: "Beat the crowds and witness the golden spires before the sun gets too high." },
          { time: "10:30", title: "Ratu Boko Temple Ruins", desc: "Head 10 minutes south to explore the beautiful scenic gateway on the hills." },
          { time: "12:00", title: "Gudeg Yu Djum Lunch", desc: "Savor the absolute culinary crown of slow-stewed sweet jackfruit." },
          { time: "14:00", title: "Taman Sari Secret Water Castle", desc: "Walk through subterranean passages and turquoise bathing pools." },
          { time: "17:30", title: "Parangtritis Beach Sunset", desc: "Gaze at the vast southern sea as the waves reflect the burning sky." },
          { time: "19:00", title: "Ramayana Ballet Spectacular", desc: "Conclude with world-class traditional ballet with Prambanan as a back-drop." }
        ];
      case 'malioboro':
        return [
          { time: "09:00", title: "Beringharjo Batik Discovery", desc: "Immerse yourself in Yogyakarta's oldest traditional textile hub." },
          { time: "11:30", title: "Sultan's Palace (Kraton)", desc: "Witness real royal Javanese court guards and heritage collections." },
          { time: "13:00", title: "Lesehan Traditional Lunch", desc: "Sit on cozy bamboo mats and try warm local delicacies." },
          { time: "15:00", title: "Taman Sari Water Castle", desc: "Explore the bathing chambers of the princesses." },
          { time: "17:30", title: "Fort Vredeburg Museum Garden", desc: "Enjoy the cool air as colonial architectural monuments light up." },
          { time: "19:00", title: "Malioboro Evening Live Music", desc: "Sip local charcoal coffee (Kopi Joss) to the tunes of street gamelans." }
        ];
      default:
        return [
          { time: "08:00", title: "Scenic Morning Trek", desc: "Explore the surrounding natural beauty with local guides." },
          { time: "11:30", title: "Traditional Handcraft Class", desc: "Learn to carve silver or draw hand-drawn batik patterns." },
          { time: "13:00", title: "Volcanic Soil Organic Lunch", desc: "Feast on farm-to-table Javanese vegetables." },
          { time: "15:00", title: "Hidden Waterfall Plunge", desc: "Cool off in crystal-clear freshwater pools." },
          { time: "17:30", title: "Hilltop Sunset Viewpoint", desc: "Witness panoramic vistas stretching across the Indian Ocean." }
        ];
    }
  };

  const getSimulatedUpcomingEvents = () => {
    switch (destination.id) {
      case 'prambanan':
        return [
          { id: 'ev1', title: 'Ramayana Ballet - Full Moon Edition', date: 'Jul 18, 2026', time: '19:30', price: 'IDR 200,000', badge: 'Must Watch', countdown: 'In 5 Days', img: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=400' },
          { id: 'ev2', title: 'Jogja International Heritage Walk', date: 'Aug 12, 2026', time: '06:00', price: 'Free Entry', badge: 'Global Event', countdown: 'In 29 Days', img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=400' }
        ];
      case 'malioboro':
        return [
          { id: 'ev3', title: 'Malioboro Night Creative Street Carnival', date: 'Tonight', time: '20:00', price: 'Free', badge: 'Live Tonight', countdown: 'Tonight • 8 PM', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=400' },
          { id: 'ev4', title: 'Royal Palace Grebeg Festival', date: 'Jul 25, 2026', time: '08:00', price: 'Free', badge: 'Royal Ritual', countdown: 'In 12 Days', img: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400' }
        ];
      default:
        return [
          { id: 'ev5', title: 'Menoreh Hill Sunset acoustic session', date: 'Jul 19, 2026', time: '17:00', price: 'IDR 50,000', badge: 'Unplugged', countdown: 'In 6 Days', img: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=400' }
        ];
    }
  };

  const getTravelerStories = () => {
    return [
      { id: 'st1', user: 'Sophia Laurent', location: 'France', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150', tag: 'Couple Traveler', text: 'Watching the dawn break over these ancient volcanic stone pillars was a sacred experience. I have traveled across 40 countries, but the hospitality of Yogyakarta is unmatched.', img: destination.images[0] },
      { id: 'st2', user: 'Yuki Tanaka', location: 'Japan', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150', tag: 'Photography Enthusiast', text: 'My best advice: hire one of the elder guides waiting at the gate. Pak Joko translated ancient carved stone reliefs for us that described royal folklore from 1,200 years ago.', img: destination.images[1] || destination.images[0] },
      { id: 'st3', user: 'Budi Santoso', location: 'Indonesia', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150', tag: 'Solo Explorer', text: 'Don’t forget to explore the back zone where the lesser-known temples sit quietly away from tourist groups. It feels like real Indiana Jones archaeological ruins.', img: destination.images[2] || destination.images[0] }
    ];
  };

  // Filter reviews
  const filteredReviews = communityReviews.filter(rev => {
    if (reviewFilter === 'all') return true;
    // Simple custom matching based on review id or date to simulate filter
    if (reviewFilter === 'Solo' && rev.id === 'r3') return true;
    if (reviewFilter === 'Couple' && rev.id === 'r1') return true;
    if (reviewFilter === 'Family' && rev.id === 'r2') return true;
    return rev.id === 'r1' || rev.id === 'r2'; // Default matching for friends
  });

  const activeEcosystemPartners = destination.partners.filter(p => {
    if (activeEcosystemTab === 'stay') return p.category === 'hotel';
    if (activeEcosystemTab === 'eat') return p.category === 'restaurant' || p.category === 'cafe';
    if (activeEcosystemTab === 'experience') return p.category === 'rental' || p.category === 'agent';
    if (activeEcosystemTab === 'shop') return p.category === 'souvenir';
    if (activeEcosystemTab === 'move') return p.category === 'rental' || p.category === 'transport';
    if (activeEcosystemTab === 'guide') return p.category === 'guide';
    return true;
  });

  // Calculate ticket pricing
  const calculatePrice = () => {
    const rate = ticketCategory === 'domestic' ? 50000 : 375000;
    return (rate * ticketQuantity).toLocaleString('id-ID');
  };

  return (
    <div id={`tourism-hub-page-${destination.id}`} className="bg-[#fcfbfa] min-h-screen text-[#1b1c16] font-sans">
      
      <AIFloatingAssistant destination={destination} />

      {/* 1. EXQUISITE STICKY NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-[#0f100c]/90 backdrop-blur-md border-b border-white/5 text-white transition-all duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Logo / Back Button */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors flex items-center space-x-1.5 text-gold-300 hover:text-white"
              title="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="hidden sm:inline text-xs font-mono tracking-widest uppercase">BACK</span>
            </button>
            <div className="h-4 w-[1px] bg-white/15 hidden sm:block" />
            <div className="flex items-center space-x-2">
              <span className="text-gold-400 font-bold text-lg leading-none">Ψ</span>
              <div className="flex flex-col -space-y-1">
                <span className="text-[8px] font-mono tracking-[0.1em] text-gold-300 font-semibold uppercase">EXPLORE</span>
                <span className="font-manrope text-sm font-extrabold tracking-widest">JOGJA</span>
              </div>
            </div>
          </div>

          {/* Center Links (National Geographic & Airbnb Style) */}
          <div className="hidden lg:flex items-center space-x-8 text-xs font-mono tracking-widest uppercase text-white/70">
            <button onClick={onBack} className="hover:text-gold-300 transition-colors">Explore</button>
            <a href="#suggested-journey-section" className="hover:text-gold-300 transition-colors">Journey</a>
            <a href="#ecosystem-section" className="hover:text-gold-300 transition-colors">Ecosystem</a>
            <a href="#interactive-map-section" className="hover:text-gold-300 transition-colors">Route Map</a>
            <a href="#community-stories" className="hover:text-gold-300 transition-colors">Stories</a>
            <a href="#exclusive-vouchers" className="hover:text-gold-300 transition-colors">Vouchers</a>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => onToggleSave(destination)}
              className={`p-2 rounded-full hover:bg-white/10 transition-all ${isSaved ? 'text-gold-400' : 'text-white/80'}`}
              title="Bookmark Destination"
            >
              <Heart className={`h-5 w-5 ${isSaved ? 'fill-gold-400 text-gold-400' : ''}`} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            {copied && (
              <span className="absolute top-16 right-4 sm:right-20 bg-gold-400 text-royal-950 font-mono text-[10px] font-bold px-3 py-1 rounded-full shadow-md animate-fade-in border border-gold-300">
                COPIED COHESIVE LINK!
              </span>
            )}

            <div className="h-8 w-8 rounded-full overflow-hidden border border-gold-400/30">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150" 
                alt="Traveler Profile" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>

        </div>
      </nav>

      {/* 2. HERO GALLERY (80vh) */}
      <section className="relative h-[72vh] md:h-[80vh] w-full bg-[#0f100c] overflow-hidden">
        
        {/* Parallax Main Image Slider */}
        <div className="absolute inset-0">
          <img 
            src={destination.images[activeImageIdx]} 
            alt={destination.name} 
            className="w-full h-full object-cover opacity-85 transition-all duration-700 transform scale-102 filter brightness-[0.78]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f100c]/90 via-[#0f100c]/20 to-transparent" />
        </div>

        {/* Floating Badges Stack & Overlay Description */}
        <div className="absolute inset-0 flex flex-col justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 z-10 text-white">
          
          {/* Top Row: UNESCO and Local Zone badges */}
          <div className="flex flex-wrap items-center gap-2.5 mt-2">
            <span className="bg-gold-500/90 backdrop-blur-md border border-gold-400/20 text-white text-[9px] md:text-[10px] font-mono tracking-widest uppercase px-3.5 py-1 rounded-full font-bold shadow-lg flex items-center space-x-1.5">
              <Award className="h-3 w-3 animate-pulse" />
              <span>{destination.category === 'heritage' ? 'UNESCO WORLD HERITAGE' : 'CURATED HIGHLANDS'}</span>
            </span>
            <span className="bg-white/10 backdrop-blur-md border border-white/15 text-gold-200 text-[9px] md:text-[10px] font-mono tracking-widest uppercase px-3.5 py-1 rounded-full shadow-md">
              Sultanate Core Zone
            </span>
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[9px] md:text-[10px] font-mono tracking-widest uppercase px-3.5 py-1 rounded-full font-bold">
              ● OPEN TODAY
            </span>
          </div>

          {/* Bottom Row: Immersive Meta info & CTA Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end w-full">
            
            {/* Title, rating, location */}
            <div className="lg:col-span-8 text-left space-y-3">
              <div className="flex items-center space-x-2">
                <span className="flex items-center text-amber-400 text-sm">
                  {"★★★★★".split('').map((char, i) => (
                    <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                  ))}
                </span>
                <span className="text-sm font-semibold font-mono text-gold-200 mt-0.5">{destination.rating} ({destination.reviewCount} reviews)</span>
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6.5xl tracking-tight leading-[1.05] text-white">
                {destination.name}
              </h1>

              <p className="font-sans text-sm md:text-base text-gold-100/95 italic font-medium tracking-wide max-w-2xl leading-relaxed">
                "{destination.tagline}"
              </p>

              {/* Geographic Region Label */}
              <div className="flex items-center space-x-2 text-white/80 text-xs md:text-sm font-mono pt-1">
                <MapPin className="h-4 w-4 text-gold-400 shrink-0" />
                <span>{destination.location} • {destination.subRegion} Division</span>
              </div>
            </div>

            {/* Live traveler count badge (Right Column on Desktop) */}
            <div className="lg:col-span-4 flex flex-col items-start lg:items-end space-y-4">
              <div className="bg-black/45 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex items-center space-x-3 text-left w-full sm:w-auto shadow-2xl">
                <div className="flex -space-x-2.5">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150" className="h-7 w-7 rounded-full border-2 border-royal-950 object-cover" />
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150" className="h-7 w-7 rounded-full border-2 border-royal-950 object-cover" />
                  <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150" className="h-7 w-7 rounded-full border-2 border-royal-950 object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gold-300 font-mono tracking-wider font-bold uppercase">LIVE FEED</span>
                  <span className="text-xs text-white/95 font-semibold">1,240 travelers exploring now</span>
                </div>
              </div>

              {/* Action Trigger Buttons exactly like mockup */}
              <div className="flex flex-wrap gap-2.5 w-full justify-start lg:justify-end">
                <button 
                  onClick={() => setShowTicketModal(true)}
                  className="flex-1 sm:flex-initial bg-gold-400 hover:bg-gold-500 text-royal-950 font-bold px-5 py-3 rounded-full text-xs uppercase tracking-widest transition-all hover:shadow-xl active:scale-97 flex items-center justify-center space-x-2"
                >
                  <Ticket className="h-4 w-4" />
                  <span>Buy Admission</span>
                </button>
                <button 
                  onClick={() => onToggleSave(destination)}
                  className={`px-5 py-3 rounded-full text-xs uppercase tracking-widest transition-all backdrop-blur-md border flex items-center justify-center space-x-1.5 ${
                    isSaved 
                      ? 'bg-gold-400/25 border-gold-400 text-gold-300' 
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                  <span>{isSaved ? 'Bookmarked' : 'Save'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Bottom Tabs for Media Selector Panel */}
          <div className="border-t border-white/10 pt-4 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
            <div className="flex overflow-x-auto scrollbar-none w-full sm:w-auto -mx-4 px-4 sm:mx-0 sm:px-0 space-x-1 sm:space-x-2.5">
              {[
                { id: 'photos', label: `Photos 1,248`, icon: Camera },
                { id: 'video', label: 'Cinematic 4K', icon: Video },
                { id: '360', label: '360° View', icon: Eye },
                { id: 'drone', label: 'Drone Flyby', icon: Compass },
                { id: 'reels', label: 'Travel Reels', icon: Play }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveMediaTab(tab.id as any);
                      if (tab.id === 'photos') setActiveImageIdx(0);
                    }}
                    className={`flex-shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono tracking-widest uppercase transition-all ${
                      activeMediaTab === tab.id
                        ? 'bg-gold-400 text-royal-950 font-bold'
                        : 'bg-white/5 border border-white/10 text-white/80 hover:bg-white/15'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Photo Slide Indicators (Mini Carousel Strip) */}
            <div className="hidden sm:flex items-center space-x-2.5">
              {destination.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveImageIdx(idx);
                    setActiveMediaTab('photos');
                  }}
                  className={`relative h-11 w-16 overflow-hidden rounded-lg border transition-all ${
                    idx === activeImageIdx && activeMediaTab === 'photos'
                      ? 'border-gold-400 scale-105 shadow-md shadow-gold-500/20'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Photo Credit */}
            <div className="absolute bottom-3 right-4 z-10">
              <span className="bg-black/50 backdrop-blur-sm text-white/70 text-[10px] font-mono px-2 py-0.5 rounded">
                Photo: {getPhotoCredit(destination.images[activeImageIdx])} / Unsplash
              </span>
            </div>
          </div>

        </div>

      </section>

      {/* BODY CONTENT - Elegant grid wrapper */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT 8-COLUMN MAIN BODY PANELS */}
          <div className="lg:col-span-8 space-y-12 text-left">
            
            {/* 3. AI SMART SUMMARY BLOCK */}
            <div className="bg-[#f5edd6]/50 border border-gold-200/55 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-gold-600 animate-pulse" />
                <h3 className="font-manrope text-xs uppercase tracking-[0.15em] text-gold-700 font-extrabold">
                  AI Smart Curator Analysis
                </h3>
              </div>
              
              <p className="font-display text-xl sm:text-2xl text-royal-950 font-medium leading-normal italic">
                "This majestic sight is highly recommended for Sunrise Enthusiasts, Cultural Collectors, Architectural Photographers and Multi-generational Families."
              </p>

              <div className="border-t border-gold-200/40 pt-6 grid grid-cols-2 sm:grid-cols-3 gap-5">
                {[
                  { label: "Optimal Visit Hour", value: destination.id === 'prambanan' ? "03:30 PM - 05:15 PM" : "09:00 AM - 11:30 AM", detail: "Golden hour light", icon: Clock },
                  { label: "Estimated Duration", value: "2.5 Hours", detail: "Slow paced walks", icon: Footprints },
                  { label: "Visiting Season", value: "Dry Months (May-Oct)", detail: "Cloudless sunsets", icon: CloudSun },
                  { label: "Terrain Level", value: "Flat Stone Pathway", detail: "Minimal stairs", icon: Landmark },
                  { label: "Accessibility Status", value: "Wheelchair Friendly", detail: "Ramps & flat paved", icon: CheckCircle },
                  { label: "Climate Comfort", value: `Live ${destination.weather.temp} • Sunny`, detail: "Mild volcanic wind", icon: Thermometer }
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex space-x-3 items-start">
                      <div className="bg-white p-2 rounded-xl border border-gold-200/30 text-gold-600 shrink-0 shadow-sm">
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono tracking-wider uppercase text-royal-700/60 leading-none mb-1">{item.label}</span>
                        <span className="text-xs font-bold text-royal-950 leading-tight">{item.value}</span>
                        <span className="text-[9px] text-royal-700/60 font-light mt-0.5">{item.detail}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. DESTINATION STORY (Editorial Layout) */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Landmark className="h-5 w-5 text-gold-600" />
                <h2 className="font-manrope text-xs uppercase tracking-[0.15em] text-royal-700 font-extrabold">
                  The Editorial Story & Heritage
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Story description text with expandable transition */}
                <div className="md:col-span-7 space-y-4">
                  <h3 className="font-display text-2.5xl text-royal-950 leading-snug">
                    Where ancient mythology meets volcanic limestone stone mastery.
                  </h3>
                  
                  {/* Dropcap paragraph */}
                  <p className="text-royal-700 text-sm leading-relaxed font-light first-letter:text-4xl first-letter:font-display first-letter:float-left first-letter:mr-2.5 first-letter:text-gold-600 first-letter:font-extrabold">
                    {destination.description}
                  </p>

                  <div className={`transition-all duration-500 overflow-hidden ${storyExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="border-l-2 border-gold-400 pl-4 py-1.5 my-4 bg-gold-50/45 rounded-r-xl">
                      <p className="font-display italic text-sm text-gold-800 leading-relaxed">
                        "{destination.story}"
                      </p>
                    </div>
                    <p className="text-royal-700 text-sm leading-relaxed font-light">
                      Constructed to rival the Borobudur temple, the majestic structure was built with massive local volcanic rock materials without using any adhesive compounds, holding together solely through interlocking grooves.
                    </p>
                  </div>

                  <button 
                    onClick={() => setStoryExpanded(!storyExpanded)}
                    className="text-xs font-mono font-bold uppercase tracking-widest text-gold-700 hover:text-gold-900 border-b-2 border-gold-400/20 hover:border-gold-600 pb-0.5 transition-all flex items-center space-x-1 pt-2"
                  >
                    <span>{storyExpanded ? 'COLLAPSE HERITAGE TEXT' : 'READ HISTORICAL LEGEND'}</span>
                    <ChevronDown className={`h-3 w-3 transform transition-transform ${storyExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Decorative Side Photo Frame */}
                <div className="md:col-span-5">
                  <div className="relative rounded-2xl overflow-hidden border border-gold-200/30 shadow-md group aspect-[4/3] bg-royal-950">
                    <img 
                      src={destination.images[1] || destination.images[0]} 
                      alt="Stone Carvings Relief" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end text-left">
                      <span className="text-[9px] font-mono text-gold-300 tracking-widest uppercase">DETAIL RELIEF</span>
                      <span className="text-xs font-semibold text-white">Interlocking stone reliefs representing epics.</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* 5. CONTINUE YOUR EXPERIENCE (TRAVELER NEEDS CARDS) */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-200/40 pb-3">
                <div className="flex items-center space-x-2">
                  <Compass className="h-5 w-5 text-gold-600 animate-spin-slow" />
                  <h2 className="font-manrope text-xs uppercase tracking-[0.15em] text-royal-700 font-extrabold">
                    Continue Your Experience
                  </h2>
                </div>
                <span className="text-xs text-stone-500">Based on your customized traveler intent</span>
              </div>

              {/* Bento Grid layout with gorgeous styled cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { title: "Stay Nearby", icon: Hotel, desc: "Boutique heritage suites", color: "text-[#2e4d3c] bg-emerald-50 border-emerald-100", label: "🏨 STAY" },
                  { title: "Eat Traditional", icon: Utensils, desc: "Ancient recipes & cafes", color: "text-[#7c4d12] bg-amber-50 border-amber-100", label: "🍜 CULINARY" },
                  { title: "Experiences", icon: Sparkles, desc: "Volcano offroads & art", color: "text-[#6c2e7c] bg-purple-50 border-purple-100", label: "🎭 DISCOVER" },
                  { title: "Local Shopping", icon: ShoppingBag, desc: "Pure silver & batik guilds", color: "text-[#7c1212] bg-red-50 border-red-100", label: "🛍 CRAFT" },
                  { title: "Private Guide", icon: Users, desc: "Licensed expert historians", color: "text-[#125c7c] bg-blue-50 border-blue-100", label: "👨 SERVICE" },
                  { title: "Transportation", icon: MapPinned, desc: "Royal chariots & rental", color: "text-[#4d4d4d] bg-stone-50 border-stone-100", label: "🚗 RIDE" }
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        const tabId = item.title.toLowerCase().includes('stay') ? 'stay' :
                                      item.title.toLowerCase().includes('eat') ? 'eat' :
                                      item.title.toLowerCase().includes('exp') ? 'experience' :
                                      item.title.toLowerCase().includes('shop') ? 'shop' :
                                      item.title.toLowerCase().includes('guide') ? 'guide' : 'move';
                        setActiveEcosystemTab(tabId as any);
                        const el = document.getElementById('ecosystem-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group p-4 border rounded-2xl cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all bg-white"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[9px] font-mono font-bold tracking-wider text-stone-500">{item.label}</span>
                        <div className={`p-2 rounded-xl border ${item.color}`}>
                          <Icon className="h-4.5 w-4.5" />
                        </div>
                      </div>
                      <h4 className="font-manrope font-bold text-sm text-stone-900 group-hover:text-gold-600 transition-colors">{item.title}</h4>
                      <p className="text-[10px] text-stone-500 font-light mt-0.5">{item.desc}</p>
                      
                      <div className="mt-4 pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold text-gold-600 bg-gold-50 px-1.5 py-0.5 rounded">AI Picked</span>
                        <span className="text-[9px] text-stone-400 font-bold group-hover:text-stone-900 transition-all flex items-center">
                          <span>Browse</span>
                          <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 6. INTERACTIVE MAP SECTION */}
            <div id="interactive-map-section" className="space-y-6 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-200/40 pb-3">
                <div className="flex items-center space-x-2">
                  <Map className="h-5 w-5 text-gold-600" />
                  <h2 className="font-manrope text-xs uppercase tracking-[0.15em] text-royal-700 font-extrabold">
                    Ecosystem Interactive Route Map
                  </h2>
                </div>
                <span className="text-xs font-mono text-gold-700">LAT {destination.latitude.toFixed(4)} • LNG {destination.longitude.toFixed(4)}</span>
              </div>

              {/* High Fidelity Custom Map Grid Canvas */}
              <div className="relative rounded-3xl overflow-hidden border border-gold-200/50 shadow-lg bg-stone-900/5 aspect-16/10">
                {/* SVG Mock Map Grid */}
                <div className="absolute inset-0 bg-[#e7e1d5] opacity-90 p-4 flex flex-col justify-between overflow-hidden">
                  
                  {/* Stylized background lines mimicking roads */}
                  <div className="absolute inset-0 z-0">
                    <svg className="w-full h-full opacity-30 stroke-[#cb8527]" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="10" y1="0" x2="90" y2="100" strokeWidth="0.5" />
                      <line x1="0" y1="40" x2="100" y2="60" strokeWidth="0.5" />
                      <line x1="20" y1="100" x2="80" y2="0" strokeWidth="0.5" />
                      <circle cx="50" cy="50" r="30" strokeWidth="0.2" fill="none" />
                      <circle cx="50" cy="50" r="15" strokeWidth="0.2" fill="none" />
                    </svg>
                  </div>

                  {/* Dynamic Markers Overlay based on filter selection */}
                  <div className="absolute inset-0 z-10">
                    
                    {/* Destination Center Marker (Star) */}
                    <div className="absolute top-[48%] left-[48%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-royal-950 text-gold-300 border-2 border-gold-400 shadow-2xl animate-bounce">
                        <Sparkle className="h-5 w-5 fill-gold-400" />
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span>
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-royal-950 bg-white/90 px-2 py-0.5 rounded-full border border-gold-300 shadow mt-1">
                        {destination.name}
                      </span>
                    </div>

                    {/* Partner markers on mock coordinates */}
                    {destination.partners.map((partner, index) => {
                      const isSelected = selectedMapPartner?.id === partner.id;
                      // Unique position for each partner on grid
                      const positions = [
                        { top: '22%', left: '30%' },
                        { top: '28%', left: '72%' },
                        { top: '65%', left: '25%' },
                        { top: '75%', left: '60%' },
                        { top: '40%', left: '80%' }
                      ];
                      const pos = positions[index % positions.length];
                      
                      return (
                        <div 
                          key={partner.id} 
                          style={{ top: pos.top, left: pos.left }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                        >
                          <button 
                            onClick={() => setSelectedMapPartner(partner)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border shadow-md transition-all ${
                              isSelected 
                                ? 'bg-gold-500 text-white border-white scale-125 z-20' 
                                : 'bg-white text-royal-950 border-gold-200 hover:scale-110 z-10'
                            }`}
                          >
                            {partner.category === 'hotel' ? <Hotel className="h-3.5 w-3.5" /> :
                             partner.category === 'restaurant' || partner.category === 'cafe' ? <Utensils className="h-3.5 w-3.5" /> :
                             partner.category === 'guide' ? <Users className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
                          </button>
                        </div>
                      );
                    })}

                    {/* Common Tourist Spots Pin (Hospital, Toilet, Parking) */}
                    <div className="absolute top-[18%] left-[78%] flex flex-col items-center">
                      <div className="p-1 bg-gray-600 text-white rounded-md text-[8px] font-bold border border-white flex items-center space-x-0.5">
                        <MapPin className="h-2 w-2" />
                        <span>🅿 SECURE PARKING</span>
                      </div>
                    </div>
                    
                    <div className="absolute top-[85%] left-[20%] flex flex-col items-center">
                      <div className="p-1 bg-teal-600 text-white rounded-md text-[8px] font-bold border border-white flex items-center space-x-0.5">
                        <Flame className="h-2 w-2" />
                        <span>🚽 ECO TOILETS</span>
                      </div>
                    </div>

                    <div className="absolute top-[65%] left-[82%] flex flex-col items-center">
                      <div className="p-1 bg-red-600 text-white rounded-md text-[8px] font-bold border border-white flex items-center space-x-0.5">
                        <AlertTriangle className="h-2 w-2" />
                        <span>🏥 EMERGENCY CARE</span>
                      </div>
                    </div>

                  </div>

                  {/* Filter Overlay Buttons */}
                  <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-gold-200/50 p-2.5 rounded-2xl flex flex-col gap-1.5 shadow-lg w-40">
                    <span className="text-[8px] font-mono font-bold tracking-wider text-royal-700/60 uppercase border-b pb-1">Filter Map Pins</span>
                    {[
                      { id: 'all', label: 'All Markers', icon: Map },
                      { id: 'partner', label: 'Verified Partners', icon: Award },
                      { id: 'parking', label: 'Secure Parking', icon: Compass },
                      { id: 'toilet', label: 'Eco Toilets', icon: Flame },
                      { id: 'hospital', label: 'Emergency', icon: ShieldAlert }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedMapFilter(f.id as any)}
                        className={`text-[9px] font-mono font-bold text-left py-1 px-1.5 rounded-lg flex items-center space-x-1.5 transition-all ${
                          selectedMapFilter === f.id ? 'bg-gold-800 text-white' : 'text-royal-700/80 hover:bg-gold-50'
                        }`}
                      >
                        <f.icon className="h-3 w-3 shrink-0" />
                        <span>{f.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Selected Partner Details Floating Card */}
                  {selectedMapPartner && (
                    <div className="absolute bottom-4 left-4 right-4 z-20 bg-royal-950/95 backdrop-blur-md border border-white/10 text-white p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-fade-in">
                      <div className="flex items-center space-x-3 text-left w-full sm:w-auto">
                        <img src={selectedMapPartner.image} className="h-14 w-14 rounded-xl object-cover border border-white/10 shrink-0" />
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[8px] font-mono font-bold tracking-widest text-gold-300 uppercase">{selectedMapPartner.category}</span>
                            <span className="text-[8px] font-mono text-emerald-400 font-semibold">• VERIFIED PARTNER</span>
                          </div>
                          <h4 className="font-manrope font-bold text-sm text-white">{selectedMapPartner.name}</h4>
                          <p className="text-[10px] text-white/70 font-light leading-none mt-0.5">{selectedMapPartner.distance} • {selectedMapPartner.price}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                        <div className="text-right">
                          <span className="block text-xs font-bold text-amber-400">★ {selectedMapPartner.rating.toFixed(1)}</span>
                          <span className="block text-[8px] font-mono text-white/50">{selectedMapPartner.promotion || 'Special Voucher'}</span>
                        </div>
                        <a 
                          href={`tel:${selectedMapPartner.phone || '+62274'}`}
                          className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all text-xs"
                          title="Call Partner"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <button 
                          onClick={() => {
                            if (selectedMapPartner.promotion) handleClaimOffer(selectedMapPartner.id);
                          }}
                          className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-widest transition-all ${
                            claimedOffers.has(selectedMapPartner.id) 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-gold-400 hover:bg-gold-500 text-royal-950'
                          }`}
                        >
                          {claimedOffers.has(selectedMapPartner.id) ? 'CLAIMED ✓' : 'CLAIM VOUCHER'}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* 7. AI SUGGESTED JOURNEY TIMELINE */}
            <div id="suggested-journey-section" className="space-y-6 scroll-mt-20">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-200/40 pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-gold-600" />
                  <h2 className="font-manrope text-xs uppercase tracking-[0.15em] text-royal-700 font-extrabold">
                    AI Suggested Cohesive Journey
                  </h2>
                </div>
                <span className="text-xs text-stone-500">Personalized timeline centered around this destination</span>
              </div>

              {/* Connected timeline layout exactly like description */}
              <div className="relative border-l border-gold-300 pl-6 ml-4 py-2 space-y-6">
                {getSuggestedTimeline().map((step, idx) => {
                  const isCurrentDestStep = step.title.toLowerCase().includes(destination.name.split(' ')[0].toLowerCase());
                  return (
                    <div key={idx} className="relative text-left">
                      
                      {/* Circle node connector */}
                      <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 rounded-full border-2 bg-white transition-all ${
                        isCurrentDestStep 
                          ? 'border-gold-500 scale-125' 
                          : 'border-stone-400'
                      }`} />

                      <div className="flex items-baseline space-x-2.5">
                        <span className="font-mono text-xs font-extrabold text-gold-700">{step.time}</span>
                        <h4 className="font-manrope text-sm font-bold text-stone-900 flex items-center space-x-2">
                          <span>{step.title}</span>
                          {isCurrentDestStep && (
                            <span className="bg-gold-400 text-royal-950 text-[8px] font-mono font-bold tracking-widest uppercase px-1.5 py-0.5 rounded">
                              Current Station
                            </span>
                          )}
                        </h4>
                      </div>
                      <p className="text-xs text-stone-600 font-light mt-1 max-w-xl leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 8. UPCOMING EVENTS AROUND THIS DESTINATION */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-stone-200/40 pb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gold-600" />
                  <h2 className="font-manrope text-xs uppercase tracking-[0.15em] text-royal-700 font-extrabold">
                    Upcoming Events Around Here
                  </h2>
                </div>
                <span className="text-xs text-stone-500">Don't miss out tonight and this week</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {getSimulatedUpcomingEvents().map(event => (
                  <div key={event.id} className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-stone-200/10 shadow-md bg-royal-950">
                    <img src={event.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                    
                    {/* Top Countdown Badge */}
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded-full">
                      {event.countdown}
                    </div>

                    {/* Event Content details */}
                    <div className="absolute bottom-0 inset-x-0 p-4 text-left">
                      <span className="text-[8px] font-mono text-gold-300 tracking-widest uppercase font-bold">{event.badge}</span>
                      <h4 className="font-manrope text-sm font-bold text-white leading-tight mt-0.5 group-hover:text-gold-200 transition-colors">{event.title}</h4>
                      <p className="text-[10px] text-white/70 font-light mt-1">{event.date} • {event.time} • {event.price}</p>
                      
                      <button 
                        onClick={() => {
                          setTicketCategory('domestic');
                          setShowTicketModal(true);
                        }}
                        className="mt-3 w-full bg-white/10 hover:bg-gold-400 hover:text-royal-950 text-white font-mono text-[9px] uppercase tracking-widest py-1.5 rounded-lg border border-white/15 hover:border-transparent transition-all font-bold"
                      >
                        BOOK EVENT ENTRY TICKET
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. REVIEWS & COMMUNITY EXPERIENCE FEED */}
            <div id="community-stories" className="space-y-6 scroll-mt-20">
              
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-200/40 pb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-gold-600 animate-pulse" />
                  <h2 className="font-manrope text-xs uppercase tracking-[0.15em] text-royal-700 font-extrabold">
                    Traveler Experience Feed
                  </h2>
                </div>
                
                {/* Profile Filter pills */}
                <div className="flex overflow-x-auto scrollbar-none gap-1 bg-stone-100 p-1 rounded-xl shrink-0">
                  {['all', 'Solo', 'Couple', 'Family', 'Friends'].map(type => (
                    <button
                      key={type}
                      onClick={() => setReviewFilter(type as any)}
                      className={`text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-lg transition-all ${
                        reviewFilter === type ? 'bg-royal-950 text-white font-semibold' : 'text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {type === 'all' ? 'All Profiles' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feed List */}
              <div className="space-y-6">
                {filteredReviews.map(review => {
                  const commentsList = reviewComments[review.id] || [];
                  const isLiked = likedReviewIds.has(review.id);
                  return (
                    <div key={review.id} className="bg-white border border-stone-200/50 p-5 rounded-2xl space-y-4 shadow-sm text-left">
                      
                      {/* Top Header Row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={review.userAvatar} className="h-10 w-10 rounded-full object-cover border border-gold-200" />
                          <div>
                            <span className="block text-xs font-bold text-[#1c1a17]">{review.userName}</span>
                            <span className="block text-[9px] font-mono text-stone-500/80 uppercase">
                              {review.id === 'r1' ? 'France • Couple' : review.id === 'r2' ? 'Japan • Family' : 'Indonesia • Solo'} • {review.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-1 font-mono text-[10px] font-bold text-royal-950">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{review.rating.toFixed(1)}</span>
                        </div>
                      </div>

                      {/* Travel Story */}
                      <div className="space-y-2">
                        <p className="text-xs text-stone-700 leading-relaxed font-light italic">
                          "{review.comment}"
                        </p>
                        
                        {/* Custom traveler tips segment inside story */}
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-left">
                          <span className="text-[9px] font-mono font-bold text-gold-700 uppercase tracking-widest block mb-1">PRO-TIP FROM TRAVELER</span>
                          <p className="text-[10px] text-stone-600 leading-relaxed font-medium">
                            {review.id === 'r1' ? 'Sunset silhouettes are beautiful but there are heavy lines for photos. Seek out the small northern temple for empty majestic backgrounds.' :
                             review.id === 'r2' ? 'Hiring a local licensed guild was only IDR 250k. He literally pointed out details we would have completely missed in the Hindu relief structures.' :
                             'Head back to Malioboro via Becak local carriage for only IDR 50k. Negotiate politely with a warm smile.'}
                          </p>
                        </div>

                        {/* Travel Parameters Badge Row */}
                        <div className="flex flex-wrap gap-2 pt-1 text-[9px] font-mono text-stone-500">
                          <span className="bg-stone-100 px-2 py-0.5 rounded-full">Est Budget: {review.id === 'r1' ? 'IDR 500k' : 'IDR 300k'}</span>
                          <span className="bg-stone-100 px-2 py-0.5 rounded-full">Visited with: {review.id === 'r1' ? 'Partner' : 'Family'}</span>
                        </div>
                      </div>

                      {/* Interaction Row (React, save tip, comment) */}
                      <div className="border-t border-stone-100 pt-3.5 flex flex-wrap items-center justify-between gap-4 text-xs font-mono tracking-wider text-stone-500">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => toggleLikeReview(review.id)}
                            className={`flex items-center space-x-1 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500 font-bold' : ''}`}
                          >
                            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                            <span>{isLiked ? 'Helpful (16)' : 'Helpful (15)'}</span>
                          </button>
                          
                          <button className="flex items-center space-x-1 hover:text-gold-700">
                            <MessageSquare className="h-4 w-4" />
                            <span>Comments ({commentsList.length})</span>
                          </button>
                        </div>

                        <button className="text-[9px] font-mono text-gold-700 bg-gold-50/70 border border-gold-200/50 px-2.5 py-1 rounded-lg hover:bg-gold-100 transition-colors">
                          SAVE TRAVEL TIPS
                        </button>
                      </div>

                      {/* Expandable comments drawer */}
                      {commentsList.length > 0 && (
                        <div className="bg-stone-50/80 p-3 rounded-xl border border-stone-100 space-y-3.5">
                          {commentsList.map((comm, cIdx) => (
                            <div key={cIdx} className="flex space-x-2.5 items-start text-xs border-b border-stone-100 last:border-0 pb-2 last:pb-0">
                              <img src={comm.avatar} className="h-6 w-6 rounded-full object-cover" />
                              <div className="flex-1 text-left">
                                <span className="font-bold text-[#1c1a17] text-[10px]">{comm.user}</span>
                                <p className="text-stone-600 font-light text-[10px] leading-relaxed mt-0.5">{comm.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add comment input */}
                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          type="text"
                          placeholder="Add comment to travel story..."
                          value={newCommentText[review.id] || ''}
                          onChange={(e) => setNewCommentText({ ...newCommentText, [review.id]: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 text-[10.5px] px-3.5 py-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-500"
                        />
                        <button 
                          onClick={() => handleAddComment(review.id)}
                          className="p-2 bg-royal-950 text-white rounded-xl hover:bg-gold-500 transition-colors"
                        >
                          <Send className="h-3.5 w-3.5" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* 10. AI REVIEW SUMMARY BLOCK */}
            <div className="bg-[#FAF6F0] border border-gold-100/70 rounded-3xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-gold-600" />
                <h3 className="font-manrope text-xs uppercase tracking-[0.15em] text-royal-700 font-extrabold">
                  AI Review Aggregator & Analyst
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Visitors Love */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono tracking-widest text-emerald-700 uppercase font-bold">Visitors Love (PROS)</span>
                  <div className="space-y-2.5">
                    {[
                      { topic: "Sunrise Backdrop & Light", rating: 4.9, pct: "98%" },
                      { topic: "Ancient Relic Craftsmanship", rating: 4.8, pct: "94%" },
                      { topic: "Site Cleanliness & Toilet", rating: 4.7, pct: "89%" }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-[#1c1a17]">{item.topic}</span>
                          <span className="text-[9px] text-stone-500 font-mono">Satisfied rating • {item.rating}</span>
                        </div>
                        <span className="bg-emerald-50 text-emerald-800 font-mono font-bold text-[10px] px-2 py-0.5 rounded-full">{item.pct}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visitors Mention */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono tracking-widest text-amber-700 uppercase font-bold">Visitors Mention (CONS)</span>
                  <div className="space-y-2.5">
                    {[
                      { topic: "Parking lot distance to gate", issue: "Requires short tram walk", color: "border-amber-200 bg-amber-50" },
                      { topic: "Ticket queue line at noon", issue: "Recommend booking online", color: "border-amber-200 bg-amber-50" },
                      { topic: "Hot afternoon temperature", issue: "Bring hat & custom umbrella", color: "border-amber-200 bg-amber-50" }
                    ].map((item, i) => (
                      <div key={i} className={`flex items-start justify-between text-xs p-2 border rounded-xl ${item.color}`}>
                        <div className="flex flex-col text-left">
                          <span className="font-bold text-stone-900">{item.topic}</span>
                          <span className="text-[9px] text-stone-600 mt-0.5">{item.issue}</span>
                        </div>
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* RIGHT 4-COLUMN AUXILIARY STICKY PANEL */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 16. AI LIVE JOURNEY MODE (Signature travel companion) */}
            <div className="sticky top-22 z-20 bg-royal-950 text-white rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gold-400 animate-ping" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gold-300 font-bold">Journey Assistant Panel</span>
                </div>
                <span className="text-[9px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-gold-200 font-bold">LIVE JOURNEY</span>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[9px] text-white/50 font-mono tracking-wider">Exploring Now:</span>
                <h4 className="font-display text-xl text-white tracking-tight">{destination.name}</h4>
              </div>

              {/* Live Context metrics strip */}
              <div className="grid grid-cols-3 gap-2 py-1">
                <div className="bg-white/5 p-2 rounded-xl text-center">
                  <span className="block text-[8px] font-mono text-white/40 uppercase">TIME</span>
                  <span className="text-xs font-bold text-gold-300 font-mono mt-0.5 block">{currentAssistantTime}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl text-center">
                  <span className="block text-[8px] font-mono text-white/40 uppercase">WEATHER</span>
                  <span className="text-xs font-bold text-gold-300 font-mono mt-0.5 block">{destination.weather.temp} ☀</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl text-center">
                  <span className="block text-[8px] font-mono text-white/40 uppercase">CROWD</span>
                  <span className={`text-xs font-bold font-mono mt-0.5 block ${liveCrowdLevel === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {liveCrowdLevel}
                  </span>
                </div>
              </div>

              {/* Dynamic recommendation list */}
              <div className="space-y-2.5 text-left pt-1">
                <span className="text-[9px] font-mono text-gold-400/90 tracking-widest uppercase font-bold block">Live Recommendation Cards</span>
                {getAIRecommendations().map((rec, i) => (
                  <div 
                    key={i}
                    onClick={() => setSelectedJourneyActionIdx(i === selectedJourneyActionIdx ? null : i)}
                    className={`p-3 rounded-xl cursor-pointer border text-xs transition-all flex justify-between items-start gap-3 text-left ${
                      selectedJourneyActionIdx === i 
                        ? 'bg-gold-400/20 border-gold-400 text-white' 
                        : 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <p className="font-medium">{rec.text}</p>
                      <span className="text-[9px] font-mono text-white/40">Expected completion: {rec.time}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-gold-400 shrink-0 transform transition-transform ${selectedJourneyActionIdx === i ? 'rotate-90' : ''}`} />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => setShowTicketModal(true)}
                className="w-full py-2.5 bg-gold-400 hover:bg-gold-500 text-royal-950 text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-colors shadow-md"
              >
                BOOK LIVE COMPANION SESSION
              </button>
            </div>

            {/* 11. TOURISM ECOSYSTEM INTENT RAILS */}
            <div id="ecosystem-section" className="bg-white border border-stone-200/50 rounded-3xl p-5 shadow-sm space-y-4 text-left scroll-mt-20">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-1.5">
                  <Award className="h-4 w-4 text-gold-600" />
                  <span className="text-xs font-manrope font-bold text-stone-900">Ecosystem Intent Rail</span>
                </div>
                <span className="text-[9px] font-mono bg-gold-50 text-gold-700 px-2 py-0.5 rounded-full font-bold">MONETIZED PARTNERS</span>
              </div>

              {/* Horiz intent slider */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2 border-b border-stone-100">
                {[
                  { id: 'stay', label: 'Stay' },
                  { id: 'eat', label: 'Culinary' },
                  { id: 'experience', label: 'Vibe' },
                  { id: 'shop', label: 'Shop' },
                  { id: 'guide', label: 'Guide' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveEcosystemTab(item.id as any)}
                    className={`text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-full shrink-0 transition-all ${
                      activeEcosystemTab === item.id 
                        ? 'bg-royal-950 text-white font-bold' 
                        : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/10'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Partner Card list */}
              <div className="space-y-3 pt-1">
                {activeEcosystemPartners.length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-4 text-center">No verified partner found under this category.</p>
                ) : (
                  activeEcosystemPartners.map(partner => (
                    <div 
                      key={partner.id}
                      className="group border border-stone-100 p-2.5 rounded-xl flex space-x-3 hover:border-gold-300 hover:bg-stone-50/50 transition-all duration-300 text-left"
                    >
                      <img src={partner.image} className="h-14 w-14 rounded-lg object-cover border shrink-0 bg-stone-100" />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[8px] font-mono font-bold tracking-widest text-gold-700 uppercase leading-none">{partner.category}</span>
                            <span className="text-[9px] font-bold text-amber-500 font-mono">★ {partner.rating}</span>
                          </div>
                          <h4 className="font-manrope text-xs font-bold text-stone-900 group-hover:text-gold-700 transition-all truncate mt-0.5">{partner.name}</h4>
                          <p className="text-[9px] text-stone-500 font-light truncate">{partner.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between border-t border-stone-100/60 pt-1 mt-1 text-[9px] font-mono text-stone-500">
                          <span className="font-bold text-stone-800">{partner.price}</span>
                          <span>{partner.distance}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 12. EXCLUSIVE OFFERS / PROMOTIONS */}
            <div id="exclusive-vouchers" className="bg-[#FAF7F2] border border-gold-200/50 rounded-3xl p-5 shadow-sm text-left scroll-mt-20">
              <div className="flex items-center space-x-2 border-b border-gold-100 pb-3 mb-4">
                <Tag className="h-4.5 w-4.5 text-gold-600 animate-pulse" />
                <h3 className="font-manrope text-xs uppercase tracking-[0.15em] text-gold-800 font-extrabold">
                  Exclusive Offers Around Here
                </h3>
              </div>

              <div className="space-y-3.5">
                {[
                  { id: 'off1', title: '10% Off Royal Spa Therapy', partner: 'The Phoenix Hotel', code: 'PHOENIXROYAL10', detail: 'Valid on royal herbal massage packages' },
                  { id: 'off2', title: 'Free Traditional Dessert', partner: 'Abhayagiri Fine Dining', code: 'ABHAYAGIRIDESSERT', detail: 'Complimentary Wedang Rondhe hot ginger tea bowl' },
                  { id: 'off3', title: 'Free GoPro 4K Recording', partner: 'Merapi Jeep Guild 88', code: 'MERAPIJEEP4K', detail: 'Valid with private sunrise jeep package bookings' }
                ].map(offer => {
                  const isClaimed = claimedOffers.has(offer.id);
                  return (
                    <div key={offer.id} className="border border-gold-200 bg-white p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                      {/* Decorative punch holes */}
                      <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FAF7F2] border-r border-gold-200" />
                      <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FAF7F2] border-l border-gold-200" />

                      <div className="text-left px-1.5">
                        <span className="text-[8px] font-mono text-stone-500 block uppercase leading-none">{offer.partner}</span>
                        <h4 className="font-manrope text-xs font-extrabold text-stone-900 mt-1 leading-tight">{offer.title}</h4>
                        <p className="text-[9.5px] text-stone-500 font-light leading-snug mt-1">{offer.detail}</p>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-dashed border-stone-200 flex items-center justify-between px-1.5">
                        <span className="text-[9px] font-mono text-gold-700 bg-gold-50 border border-gold-100 px-2 py-0.5 rounded uppercase font-bold tracking-wide">
                          {offer.code}
                        </span>
                        
                        <button 
                          onClick={() => handleClaimOffer(offer.id)}
                          disabled={isClaimed}
                          className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition-all ${
                            isClaimed 
                              ? 'bg-emerald-600 text-white border-transparent' 
                              : 'bg-gold-400 hover:bg-gold-500 text-royal-950 border-gold-400'
                          }`}
                        >
                          {isClaimed ? 'CLAIMED ✓' : 'CLAIM'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 13. SIMILAR DESTINATIONS */}
            <div className="bg-white border border-stone-200/50 rounded-3xl p-5 shadow-sm text-left space-y-4">
              <span className="text-[9px] font-mono font-bold tracking-widest text-gold-700 uppercase block leading-none">PEOPLE ALSO EXPLORED</span>
              
              <div className="space-y-3.5">
                {DESTINATIONS.filter(d => d.id !== destination.id).slice(0, 3).map(similar => (
                  <div 
                    key={similar.id} 
                    onClick={() => {
                      onBack();
                      // Timeout to simulate navigating
                      setTimeout(() => {
                        const card = document.getElementById(`destination-card-${similar.id}`);
                        if (card) card.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="group flex items-center space-x-3 cursor-pointer text-left"
                  >
                    <img src={similar.images[0]} className="h-12 w-16 rounded-xl object-cover shrink-0 bg-stone-100" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-manrope text-xs font-bold text-stone-900 group-hover:text-gold-600 transition-all truncate leading-tight">{similar.name}</h4>
                      <p className="text-[9px] text-stone-500 font-light truncate mt-0.5">{similar.tagline}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-stone-400 shrink-0 group-hover:text-gold-600 transition-all" />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 14. TRAVEL STORIES (INSTAGRAM-STYLE MASONRY) */}
      <section className="bg-[#FAF6F0] border-t border-b border-gold-200/30 py-12 text-left">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center space-x-2 border-b border-gold-100 pb-3">
            <Camera className="h-5 w-5 text-gold-600 animate-pulse" />
            <h2 className="font-manrope text-xs uppercase tracking-[0.15em] text-royal-700 font-extrabold">
              Traveler Stories & Visual Highlights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {getTravelerStories().map(story => (
              <div key={story.id} className="bg-white border border-stone-200/40 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group cursor-pointer hover:shadow-md transition-shadow">
                {/* Visual image box */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-royal-950">
                  <img src={story.img} className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[8.5px] font-mono text-stone-700 font-semibold border">
                    {story.tag}
                  </div>
                </div>

                {/* Traveler feedback text */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-stone-700 font-light leading-relaxed">
                    "{story.text}"
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                    <div className="flex items-center space-x-2">
                      <img src={story.avatar} className="h-7 w-7 rounded-full object-cover border" />
                      <div className="text-left">
                        <span className="block text-[10px] font-bold text-stone-900 leading-none">{story.user}</span>
                        <span className="block text-[8px] font-mono text-stone-500 leading-none mt-0.5">{story.location} traveler</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-gold-700 bg-gold-50 px-2 py-0.5 rounded-md font-bold">AI highlight</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 15. TICKET BOOKING MODAL (IMMERSIVE INTERACTION) */}
      {showTicketModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-royal-950/80 backdrop-blur-sm p-4">
          <div className="bg-white border border-gold-200 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-fade-in text-left">
            
            {/* Modal Header */}
            <div className="bg-royal-950 text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-mono tracking-widest text-gold-300 font-bold uppercase leading-none">Admission Pass</span>
                <h3 className="font-display text-lg text-white mt-1 leading-none">{destination.name}</h3>
              </div>
              <button 
                onClick={() => {
                  setShowTicketModal(false);
                  setTicketBooked(false);
                }}
                className="text-white/60 hover:text-white font-mono text-xs cursor-pointer"
              >
                [ CLOSE ]
              </button>
            </div>

            {/* Modal Body */}
            {ticketBooked ? (
              <div className="p-6 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow border border-emerald-300 animate-bounce">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-manrope font-bold text-base text-stone-900">Your Yogyakarta Royal Pass is Booked!</h4>
                <p className="text-xs text-stone-600 font-light max-w-xs mx-auto">
                  A high-resolution companion PDF barcode and secure token voucher has been synchronized to your email and cached for offline travel access.
                </p>
                <div className="p-3 bg-stone-50 rounded-xl border border-dashed font-mono text-[10px] text-left text-stone-700 max-w-xs mx-auto space-y-1">
                  <span className="block font-bold border-b pb-1 mb-1">PASS SUMMARY DETAILS:</span>
                  <span>Destination: {destination.name}</span>
                  <span className="block">Quantity: {ticketQuantity} x {ticketCategory.toUpperCase()}</span>
                  <span className="block font-bold text-gold-700">Total Price Paid: IDR {calculatePrice()}</span>
                  <span className="block text-[8px] text-stone-400">Security Hash: {Math.random().toString(16).substr(2, 8).toUpperCase()}</span>
                </div>
                <button 
                  onClick={() => {
                    setShowTicketModal(false);
                    setTicketBooked(false);
                  }}
                  className="w-full bg-royal-950 hover:bg-gold-500 text-white hover:text-royal-950 font-mono text-xs uppercase tracking-widest py-3 rounded-full font-bold transition-colors"
                >
                  DISMISS VIEW
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                
                {/* Category selector */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Select Citizen Category</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setTicketCategory('domestic')}
                      className={`p-3 border rounded-xl text-xs text-left flex flex-col justify-between transition-all ${
                        ticketCategory === 'domestic' 
                          ? 'border-gold-500 bg-gold-50/50 text-[#1c1a17] font-bold' 
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-[8px] font-mono tracking-widest text-stone-500 uppercase">Domestic</span>
                      <span className="mt-2 text-stone-900 font-bold">IDR 50,000</span>
                    </button>
                    <button
                      onClick={() => setTicketCategory('foreign')}
                      className={`p-3 border rounded-xl text-xs text-left flex flex-col justify-between transition-all ${
                        ticketCategory === 'foreign' 
                          ? 'border-gold-500 bg-gold-50/50 text-[#1c1a17] font-bold' 
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-[8px] font-mono tracking-widest text-stone-500 uppercase">International</span>
                      <span className="mt-2 text-stone-900 font-bold">IDR 375,000</span>
                    </button>
                  </div>
                </div>

                {/* Quantity input */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">Quantity Tickets</span>
                  <div className="flex items-center space-x-3 bg-stone-50 border p-2 rounded-xl w-max">
                    <button 
                      onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                      className="px-2.5 py-1 bg-white hover:bg-stone-200 rounded-lg text-xs font-bold border cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs font-extrabold text-stone-900 w-6 text-center">{ticketQuantity}</span>
                    <button 
                      onClick={() => setTicketQuantity(ticketQuantity + 1)}
                      className="px-2.5 py-1 bg-white hover:bg-stone-200 rounded-lg text-xs font-bold border cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total pricing strip */}
                <div className="border-t pt-4 flex items-center justify-between text-xs">
                  <div className="text-left">
                    <span className="text-[8px] font-mono text-stone-500 uppercase tracking-wider">Estimated Pass Price</span>
                    <span className="block font-display text-lg text-gold-700 font-extrabold mt-0.5">IDR {calculatePrice()}</span>
                  </div>
                  <button 
                    onClick={() => setTicketBooked(true)}
                    className="bg-royal-950 hover:bg-gold-500 text-white hover:text-royal-950 font-mono text-xs uppercase tracking-widest py-3 px-6 rounded-full font-bold transition-all shadow-md active:scale-97"
                  >
                    CONFIRM & BOOK
                  </button>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-left flex items-start space-x-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 font-light leading-relaxed">
                    Royal passes can be cancelled and fully refunded up to 24 hours prior to travel date. Present PDF code directly at VIP scanning gate.
                  </p>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
