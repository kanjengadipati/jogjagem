'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Heart, Share2, Star, Clock, Ticket, Sparkles, 
  MapPin, ShieldAlert, CheckCircle, HelpCircle, Thermometer,
  CloudSun, Phone, Tag, Hotel, Coffee, Utensils, Compass, 
  Footprints, MessageSquare, Map, Camera, Video, Eye, Award, 
  ChevronRight, Calendar, Users, AlertTriangle, Play,
  ShoppingBag, Landmark, ArrowRight, Check, HeartHandshake,
  MapPinned, Sunrise, Sunset, Flame, ChevronDown, Sparkle, Pencil, X
} from 'lucide-react';
import { Destination, EcosystemPartner, Review } from '@/types';
import { events as eventsApi, reviews as reviewsApi, destinations as destinationsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { inferTravelerIntent, orderCardsByIntent, IntentProfile } from '@/lib/travelerIntent';
import AIFloatingAssistant from '@/components/AIFloatingAssistant';

interface DestinationDetailProps {
  destination: Destination;
  allDestinations?: Destination[];
  onBack: () => void;
  onToggleSave: (dest: Destination) => void;
  isSaved: boolean;
  onSelectPartnerOnMap?: (partner: EcosystemPartner) => void;
}

export default function DestinationDetail({ 
  destination, 
  allDestinations = [],
  onBack, 
  onToggleSave, 
  isSaved,
  onSelectPartnerOnMap
}: DestinationDetailProps) {
  const { user, isAuthenticated } = useAuth();
  const userInitials = user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : 'YG';
  // States
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'video' | '360' | 'drone' | 'reels'>('photos');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [selectedMapFilter, setSelectedMapFilter] = useState<'all' | 'partner' | 'parking' | 'hotel' | 'resto' | 'guide' | 'toilet' | 'hospital'>('all');
  const [selectedMapPartner, setSelectedMapPartner] = useState<EcosystemPartner | null>(destination.partners[0] || null);
  const [likedReviewIds, setLikedReviewIds] = useState<Set<string>>(new Set());
  const [bookmarkedTipIds, setBookmarkedTipIds] = useState<Set<number>>(new Set());
  const [activeEcosystemTab, setActiveEcosystemTab] = useState<'stay' | 'eat' | 'experience' | 'shop' | 'move' | 'guide'>('stay');
  const ecosystemPausedUntilRef = React.useRef<number>(0);
  const ecosystemTabs = ['stay', 'eat', 'experience', 'shop', 'guide'] as const;
  const [selectedPartner, setSelectedPartner] = useState<EcosystemPartner | null>(null);

  // Leaflet refs for detail map
  const detailMapContainerRef = useRef<HTMLDivElement>(null);
  const detailMapInstanceRef = useRef<any>(null);
  const detailMarkerGroupRef = useRef<any>(null);

  // Initialize and update Detail Page Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !detailMapContainerRef.current) return;

    import('leaflet').then((L) => {
      // Clear previous map instance if any
      if (detailMapInstanceRef.current) {
        detailMapInstanceRef.current.remove();
        detailMapInstanceRef.current = null;
      }

      const container = detailMapContainerRef.current;
      if (!container) return;

      const map = L.map(container, {
        center: [destination.latitude, destination.longitude],
        zoom: 14,
        scrollWheelZoom: false, // disable scroll zoom for page scroll safety
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CartoDB',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      const markerGroup = L.layerGroup().addTo(map);
      detailMarkerGroupRef.current = markerGroup;
      detailMapInstanceRef.current = map;

      // Draw markers
      // 1. Center Destination
      const centerIcon = L.divIcon({
        className: 'custom-detail-center-marker',
        html: `
          <div class="relative flex h-11 w-11 items-center justify-center rounded-full bg-royal-950 text-gold-300 border-2 border-gold-400 shadow-2xl animate-bounce">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#d6a147" stroke="#d6a147" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sparkle"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/></svg>
            <span class="absolute -top-1 -right-1 flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-gold-500"></span>
            </span>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22]
      });

      L.marker([destination.latitude, destination.longitude], { icon: centerIcon })
        .bindTooltip(destination.name, { permanent: true, direction: 'bottom', className: 'font-manrope font-bold text-[9px] px-2 py-0.5 rounded-full border border-gold-300 shadow' })
        .addTo(markerGroup);

      // 2. Partners
      if (selectedMapFilter === 'all' || selectedMapFilter === 'partner') {
        destination.partners.forEach(partner => {
          if (!partner.coordinates?.lat || !partner.coordinates?.lng) return;

          const isSelected = selectedMapPartner?.id === partner.id;
          const partnerIcon = L.divIcon({
            className: 'custom-detail-partner-marker',
            html: `
              <div class="flex h-8 w-8 items-center justify-center rounded-full border shadow-md transition-all ${
                isSelected 
                  ? 'bg-gold-500 text-white border-white scale-110 z-20 font-bold' 
                  : 'bg-white text-royal-950 border-gold-200 hover:scale-105 z-10'
              }">
                ${partner.category === 'hotel' ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-hotel"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/><path d="M12 5v2"/><path d="M10 7h4"/><path d="M12 2v1"/></svg>' :
                  partner.category === 'restaurant' || partner.category === 'cafe' ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-utensils"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>' :
                  partner.category === 'guide' ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' : 
                  '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-bag"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0Z"/></svg>'
                }
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 16]
          });

          const marker = L.marker([partner.coordinates.lat, partner.coordinates.lng], { icon: partnerIcon });
          marker.on('click', () => {
            setSelectedMapPartner(partner);
          });
          marker.addTo(markerGroup);
        });
      }

      // 3. Render Parking Lot
      if (selectedMapFilter === 'all' || selectedMapFilter === 'parking') {
        const pkIcon = L.divIcon({
          className: 'custom-detail-pk-marker',
          html: `
            <div class="p-1 bg-gray-600 text-white rounded-md text-[8px] font-bold border border-white flex items-center space-x-0.5 shadow-md">
              <span>🅿 SECURE PARKING</span>
            </div>
          `,
          iconSize: [90, 20],
          iconAnchor: [45, 10]
        });
        L.marker([destination.latitude + 0.003, destination.longitude + 0.005], { icon: pkIcon }).addTo(markerGroup);
      }

      // 4. Render Toilet
      if (selectedMapFilter === 'all' || selectedMapFilter === 'toilet') {
        const toiletIcon = L.divIcon({
          className: 'custom-detail-toilet-marker',
          html: `
            <div class="p-1 bg-teal-600 text-white rounded-md text-[8px] font-bold border border-white flex items-center space-x-0.5 shadow-md">
              <span>🚽 ECO TOILETS</span>
            </div>
          `,
          iconSize: [80, 20],
          iconAnchor: [40, 10]
        });
        L.marker([destination.latitude - 0.004, destination.longitude - 0.003], { icon: toiletIcon }).addTo(markerGroup);
      }

      // 5. Render Emergency
      if (selectedMapFilter === 'all' || selectedMapFilter === 'hospital') {
        const emergencyIcon = L.divIcon({
          className: 'custom-detail-emergency-marker',
          html: `
            <div class="p-1 bg-red-600 text-white rounded-md text-[8px] font-bold border border-white flex items-center space-x-0.5 shadow-md">
              <span>🏥 EMERGENCY CARE</span>
            </div>
          `,
          iconSize: [100, 20],
          iconAnchor: [50, 10]
        });
        L.marker([destination.latitude + 0.002, destination.longitude - 0.003], { icon: emergencyIcon }).addTo(markerGroup);
      }
    });

    return () => {
      if (detailMapInstanceRef.current) {
        detailMapInstanceRef.current.remove();
        detailMapInstanceRef.current = null;
      }
    };
  }, [destination, selectedMapFilter, selectedMapPartner]);


  // Auto-rotate ecosystem tabs like a slideshow
  useEffect(() => {
    const timer = setInterval(() => {
      if (Date.now() < ecosystemPausedUntilRef.current) return;
      setActiveEcosystemTab(prev => {
        const idx = ecosystemTabs.indexOf(prev as any);
        return ecosystemTabs[(idx + 1) % ecosystemTabs.length] as any;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  const [copied, setCopied] = useState(false);
  
  // Reviews state
  const [communityReviews, setCommunityReviews] = useState<Review[]>(destination.reviews);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'Solo' | 'Couple' | 'Family' | 'Friends'>('all');
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [newReviewTravelerType, setNewReviewTravelerType] = useState<'Solo' | 'Couple' | 'Family' | 'Friends'>('Solo');
  const [visibleReviews, setVisibleReviews] = useState(6);
  const [reviewHelpfulCounts, setReviewHelpfulCounts] = useState<Record<string, number>>({});



  // Traveler intent inference from saved destinations
  const [travelerIntent, setTravelerIntent] = useState<IntentProfile | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('explore_jogja_saved_v1');
      if (raw) {
        const saved: Destination[] = JSON.parse(raw);
        const intent = inferTravelerIntent(saved);
        setTravelerIntent(intent);
      }
    } catch {}
  }, []);

  // Ticket booking modal state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [ticketCategory, setTicketCategory] = useState<'domestic' | 'foreign'>('domestic');
  const [ticketBooked, setTicketBooked] = useState(false);
  const [slideshowPaused, setSlideshowPaused] = useState(false);

  // Offer success states
  const [claimedOffers, setClaimedOffers] = useState<Set<string>>(new Set());

  // Similar destinations from pre-fetched list
  const [similarDestinations, setSimilarDestinations] = useState<Destination[]>([]);
  useEffect(() => {
    if (allDestinations.length === 0) return;
    const filtered = allDestinations.filter(d => d.id !== destination.id);
    const sameCategory = filtered.filter(d => d.category === destination.category);
    const finalSimilar = sameCategory.length >= 3 ? sameCategory : filtered;
    setSimilarDestinations(finalSimilar.slice(0, 3));
  }, [destination, allDestinations]);

  // Nearby events state & fetch
  const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);
  useEffect(() => {
    eventsApi.getAll().then(res => {
      if (res.status === 'success' && Array.isArray(res.data)) {
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371;
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
          return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };
        const withDist = res.data
          .filter((e: any) => e.latitude && e.longitude)
          .map((e: any) => ({ ...e, _dist: haversine(destination.latitude, destination.longitude, e.latitude, e.longitude) }))
          .filter((e: any) => e._dist <= 30)
          .sort((a: any, b: any) => a._dist - b._dist);
        setNearbyEvents(withDist.slice(0, 4));
      }
    }).catch(() => {});
  }, [destination.latitude, destination.longitude]);

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

  // Auto-advance image slideshow
  useEffect(() => {
    if (destination.images.length <= 1 || slideshowPaused) return;
    const interval = setInterval(() => {
      setActiveImageIdx(prev => (prev + 1) % destination.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [destination.images.length, slideshowPaused]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleLikeReview = (id: string) => {
    const newLiked = new Set(likedReviewIds);
    let diff = 0;
    if (newLiked.has(id)) {
      newLiked.delete(id);
      diff = -1;
    } else {
      newLiked.add(id);
      diff = 1;
    }
    setLikedReviewIds(newLiked);

    setReviewHelpfulCounts(prev => {
      const review = communityReviews.find(r => r.id === id);
      const baseLikeHash = review 
        ? ((Number(id.replace(/[^0-9]/g, '')) || 0) || (review.userName.charCodeAt(0) + (review.userName.charCodeAt(review.userName.length - 1) || 0)))
        : 0;
      const base = prev[id] ?? (10 + (baseLikeHash % 15));
      return {
        ...prev,
        [id]: base + diff
      };
    });
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

  const handleSubmitReview = async () => {
    if (!newReviewText.trim() || submittingReview) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      let userName = 'Anonymous';
      if (user) {
        userName = user.name || user.email || 'Anonymous';
      }

      const res = await reviewsApi.create(
        destination.id,
        newReviewRating,
        newReviewText.trim(),
        userName,
        newReviewTravelerType,
      );
      if (res.status === 'success') {
        // Optimistically add the new review to the top
        const newReview = {
          id: `local-${Date.now()}`,
          userName,
          userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userName)}`,
          rating: newReviewRating,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          comment: newReviewText.trim(),
          travelerType: newReviewTravelerType,
        };
        setCommunityReviews(prev => [newReview as any, ...prev]);
        setNewReviewText('');
        setNewReviewRating(5);
        setNewReviewTravelerType('Solo');
        setReviewSubmitted(true);
        setTimeout(() => setReviewSubmitted(false), 3000);
      } else {
        setReviewError(res.message || 'Failed to submit review');
      }
    } catch {
      setReviewError('Network error. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
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

  const getTravelerStories = () => {
    return destination.reviews.slice(0, 3).map((rev, i) => ({
      id: rev.id,
      user: rev.userName,
      location: 'Yogyakarta',
      avatar: rev.userAvatar,
      tag: `${rev.rating.toFixed(1)}★ Review`,
      text: rev.comment,
      img: destination.images[i % destination.images.length]?.url || destination.images[0]?.url || ''
    }));
  };

  // Filter reviews by traveler type
  const filteredReviews = reviewFilter === 'all'
    ? communityReviews
    : communityReviews.filter(r => (r as any).travelerType === reviewFilter || (r as any).traveler_type === reviewFilter);

  const activeEcosystemPartners = destination.partners.filter(p => {
    if (activeEcosystemTab === 'stay') return p.category === 'hotel';
    if (activeEcosystemTab === 'eat') return p.category === 'restaurant' || p.category === 'cafe';
    if (activeEcosystemTab === 'experience') return p.category === 'rental' || p.category === 'agent';
    if (activeEcosystemTab === 'shop') return p.category === 'souvenir';
    if (activeEcosystemTab === 'move') return p.category === 'rental' || p.category === 'transport';
    if (activeEcosystemTab === 'guide') return p.category === 'guide';
    return true;
  });

  // Dynamic curator quote based on destination data
  const getCuratorQuote = () => {
    const name = destination.name;
    const tagline = destination.tagline || '';
    const category = destination.category || '';
    const desc = destination.description || '';
    const allText = `${tagline} ${desc}`.toLowerCase();

    const keywords: string[] = [];
    if (allText.includes('temple') || allText.includes('candi') || allText.includes('heritage')) keywords.push('Heritage Explorers');
    if (allText.includes('sunrise') || allText.includes('dawn')) keywords.push('Sunrise Chasers');
    if (allText.includes('culture') || allText.includes('tradition') || allText.includes('history')) keywords.push('Culture Seekers');
    if (allText.includes('photo') || allText.includes('view') || allText.includes('panoram')) keywords.push('Panoramic Photographers');
    if (allText.includes('family') || allText.includes('children')) keywords.push('Family Travelers');
    if (allText.includes('cave') || allText.includes('adventure') || allText.includes('hike')) keywords.push('Adventure Enthusiasts');
    if (allText.includes('nature') || allText.includes('forest') || allText.includes('mountain')) keywords.push('Nature Lovers');
    if (allText.includes('art') || allText.includes('craft') || allText.includes('batik')) keywords.push('Art & Craft Enthusiasts');

    if (keywords.length === 0) keywords.push('Curious Travelers', 'Culture Seekers', 'Photography Enthusiasts');

    const audience = keywords.length <= 2 ? keywords.join(' and ') : `${keywords.slice(0, -1).join(', ')} and ${keywords[keywords.length - 1]}`;
    return `A perfect pick for ${audience} — ${name} is a destination worth planning your Yogyakarta journey around.`;
  };

  // Dynamic visiting season based on category
  const getVisitingSeason = () => {
    const cat = (destination.category || '').toLowerCase();
    if (cat.includes('temple') || cat.includes('candi') || cat.includes('heritage')) return 'Year-round (Peak: May–Sep)';
    if (cat.includes('beach') || cat.includes('coast')) return 'Dry Season (Apr–Oct)';
    if (cat.includes('mountain') || cat.includes('adventure')) return 'Dry Months (May–Oct)';
    return 'Year-round (Best: May–Oct)';
  };

  const getSeasonDetail = () => {
    const cat = (destination.category || '').toLowerCase();
    if (cat.includes('temple') || cat.includes('candi') || cat.includes('heritage')) return 'Open-air & sheltered sites';
    if (cat.includes('beach') || cat.includes('coast')) return 'Calm seas, clear skies';
    if (cat.includes('mountain') || cat.includes('adventure')) return 'Clear views, safe trails';
    return 'Balanced weather';
  };

  // Calculate ticket pricing from destination data
  const parseTicketPrice = () => {
    const raw = destination.ticketPrice || '';

    // Pattern: "IDR 375,000 (Foreigners) / IDR 50,000 (Domestic)" — number before keyword
    const foreignMatch = raw.match(/(\d[\d,.]*)\s*\(?\s*(?:Foreign|foreign|WNA|Asing|Tourist)/i);
    const domesticMatch = raw.match(/(\d[\d,.]*)\s*\(?\s*(?:Domestic|domestic|WNI|Lokal|Local)/i);

    // Pattern: "IDR 40,000 (Adult) / IDR 20,000 (Child)"
    const adultMatch = raw.match(/(\d[\d,.]*)\s*\(?\s*(?:Adult|Dewasa)/i);
    const childMatch = raw.match(/(\d[\d,.]*)\s*\(?\s*(?:Child|Anak)/i);

    let domestic = 0;
    let foreign = 0;

    if (domesticMatch && foreignMatch) {
      domestic = parseInt(domesticMatch[1].replace(/[^0-9]/g, ''), 10);
      foreign = parseInt(foreignMatch[1].replace(/[^0-9]/g, ''), 10);
    } else if (foreignMatch && !domesticMatch) {
      foreign = parseInt(foreignMatch[1].replace(/[^0-9]/g, ''), 10);
      domestic = foreign;
    } else if (adultMatch) {
      domestic = parseInt(adultMatch[1].replace(/[^0-9]/g, ''), 10);
      foreign = childMatch
        ? parseInt(childMatch[1].replace(/[^0-9]/g, ''), 10)
        : Math.round(domestic * 7.5);
    } else {
      // No labels — first number is the price
      const firstNumber = raw.match(/(\d[\d,.]*)/);
      if (firstNumber) {
        domestic = parseInt(firstNumber[1].replace(/[^0-9]/g, ''), 10);
        foreign = Math.round(domestic * 7.5);
      } else {
        domestic = 50000;
        foreign = 375000;
      }
    }

    return { domestic: domestic || 50000, foreign: foreign || 375000 };
  };

  const calculatePrice = () => {
    const { domestic, foreign } = parseTicketPrice();
    const rate = ticketCategory === 'domestic' ? domestic : foreign;
    return (rate * ticketQuantity).toLocaleString('id-ID');
  };

  const domesticTicketPrice = parseTicketPrice().domestic.toLocaleString('id-ID');
  const foreignTicketPrice = parseTicketPrice().foreign.toLocaleString('id-ID');

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

            <div className="h-8 w-8 rounded-full border border-gold-400/30 bg-royal-950 text-gold-300 flex items-center justify-center text-[10px] font-mono font-bold">
              {userInitials}
            </div>
          </div>

        </div>
      </nav>

      {/* 2. HERO GALLERY (80vh) */}
      <section className="relative h-[72vh] md:h-[80vh] w-full bg-[#0f100c] overflow-hidden">
        
        {/* Parallax Main Image Slider */}
        <div className="absolute inset-0">
          <img 
            src={destination.images[activeImageIdx]?.url || ''} 
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
                    setSlideshowPaused(true);
                    setTimeout(() => setSlideshowPaused(false), 8000);
                  }}
                  className={`relative h-11 w-16 overflow-hidden rounded-lg border transition-all ${
                    idx === activeImageIdx && activeMediaTab === 'photos'
                      ? 'border-gold-400 scale-105 shadow-md shadow-gold-500/20'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img?.url || ''} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Photo Credit */}
            <div className="absolute bottom-3 right-4 z-10">
              <span className="bg-black/50 backdrop-blur-sm text-white/70 text-[10px] font-mono px-2 py-0.5 rounded">
                Photo: {destination.images[activeImageIdx]?.credit || 'Unsplash'} / Unsplash
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
            
            {/* 3. CURATOR SUMMARY BLOCK */}
            <div className="bg-[#f5edd6]/50 border border-gold-200/55 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-gold-600 animate-pulse" />
                <h3 className="font-manrope text-xs uppercase tracking-[0.15em] text-gold-700 font-extrabold">
                  Curator's Pick
                </h3>
              </div>
              
              <p className="font-display text-xl sm:text-2xl text-royal-950 font-medium leading-normal italic">
                "{getCuratorQuote()}"
              </p>

              <div className="border-t border-gold-200/40 pt-6 grid grid-cols-2 sm:grid-cols-3 gap-5">
                {[
                  { label: "Optimal Visit Hour", value: destination.bestTime || "09:00 AM - 11:30 AM", detail: "Golden hour light", icon: Clock },
                  { label: "Opening Hours", value: destination.openingHours || "08:00 - 17:00", detail: "Daily access", icon: Ticket },
                  { label: "Visiting Season", value: getVisitingSeason(), detail: getSeasonDetail(), icon: CloudSun },
                  { label: "Terrain & Access", value: destination.facilities?.[0] || "Flat Pathway", detail: destination.facilities?.[1] || "Easy walking", icon: Landmark },
                  { label: "Ticket Price", value: `IDR ${domesticTicketPrice}`, detail: `Foreign: IDR ${foreignTicketPrice}`, icon: Ticket },
                  { label: "Climate", value: `Live ${destination.weather.temp || '27°C'} • ${destination.weather.condition || 'Sunny'}`, detail: destination.weather.status || "Mild climate", icon: Thermometer }
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
                    {destination.tagline || 'Discover the heritage and beauty of this destination.'}
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
                    {destination.travelTips && destination.travelTips.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <span className="text-[9px] font-mono font-bold text-gold-700 uppercase tracking-widest">TRAVELER PRO TIPS</span>
                        {destination.travelTips.map((tip, i) => (
                          <div key={i} className="flex items-start space-x-2 text-xs text-stone-700">
                            <CheckCircle className="h-3.5 w-3.5 text-gold-500 shrink-0 mt-0.5" />
                            <span className="font-light leading-relaxed">{tip}</span>
                          </div>
                        ))}
                      </div>
                    )}
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
                      src={destination.images[1]?.url || destination.images[0]?.url || ''} 
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
                {travelerIntent && travelerIntent.intent !== 'general' ? (
                  <span className="text-xs text-stone-500">
                    Tailored for a <span className="font-semibold text-gold-700">{travelerIntent.label}</span> like you
                  </span>
                ) : (
                  <span className="text-xs text-stone-500">Based on your traveler profile</span>
                )}
              </div>

              {/* Bento Grid layout with gorgeous styled cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(travelerIntent && travelerIntent.intent !== 'general'
                  ? orderCardsByIntent([
                      { title: "Stay Nearby", icon: Hotel, desc: "Boutique heritage suites", color: "text-[#2e4d3c] bg-emerald-50 border-emerald-100", label: "🏨 STAY" },
                      { title: "Eat Traditional", icon: Utensils, desc: "Ancient recipes & cafes", color: "text-[#7c4d12] bg-amber-50 border-amber-100", label: "🍜 CULINARY" },
                      { title: "Experiences", icon: Sparkles, desc: "Volcano offroads & art", color: "text-[#6c2e7c] bg-purple-50 border-purple-100", label: "🎭 DISCOVER" },
                      { title: "Local Shopping", icon: ShoppingBag, desc: "Pure silver & batik guilds", color: "text-[#7c1212] bg-red-50 border-red-100", label: "🛍 CRAFT" },
                      { title: "Private Guide", icon: Users, desc: "Licensed expert historians", color: "text-[#125c7c] bg-blue-50 border-blue-100", label: "👨 SERVICE" },
                      { title: "Transportation", icon: MapPinned, desc: "Royal chariots & rental", color: "text-[#4d4d4d] bg-stone-50 border-stone-100", label: "🚗 RIDE" }
                    ], travelerIntent)
                  : [
                      { title: "Stay Nearby", icon: Hotel, desc: "Boutique heritage suites", color: "text-[#2e4d3c] bg-emerald-50 border-emerald-100", label: "🏨 STAY" },
                      { title: "Eat Traditional", icon: Utensils, desc: "Ancient recipes & cafes", color: "text-[#7c4d12] bg-amber-50 border-amber-100", label: "🍜 CULINARY" },
                      { title: "Experiences", icon: Sparkles, desc: "Volcano offroads & art", color: "text-[#6c2e7c] bg-purple-50 border-purple-100", label: "🎭 DISCOVER" },
                      { title: "Local Shopping", icon: ShoppingBag, desc: "Pure silver & batik guilds", color: "text-[#7c1212] bg-red-50 border-red-100", label: "🛍 CRAFT" },
                      { title: "Private Guide", icon: Users, desc: "Licensed expert historians", color: "text-[#125c7c] bg-blue-50 border-blue-100", label: "👨 SERVICE" },
                      { title: "Transportation", icon: MapPinned, desc: "Royal chariots & rental", color: "text-[#4d4d4d] bg-stone-50 border-stone-100", label: "🚗 RIDE" }
                    ]
                ).map((item, idx) => {
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

              {/* Leaflet Map Grid Container */}
              <div className="relative rounded-3xl overflow-hidden border border-gold-200/50 shadow-lg aspect-16/10">
                {/* Leaflet DOM container */}
                <div ref={detailMapContainerRef} className="w-full h-full z-0 bg-stone-100" />

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
                    <div
                      onClick={() => setSelectedPartner(selectedMapPartner)}
                      className="flex items-center space-x-3 text-left w-full sm:w-auto cursor-pointer hover:opacity-90 transition-opacity"
                      title="View Partner Details"
                    >
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
                <span className="text-xs text-stone-500">{nearbyEvents.length > 0 ? `${nearbyEvents.length} event${nearbyEvents.length > 1 ? 's' : ''} nearby` : 'No nearby events'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {nearbyEvents.map(event => {
                  const start = new Date(event.start_date);
                  const now = new Date();
                  const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const countdown = diffDays <= 0 ? 'Happening Now' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays} Days`;
                  const badge = event.category?.charAt(0).toUpperCase() + event.category?.slice(1) || 'Event';
                  return (
                    <div key={event.id} className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-stone-200/10 shadow-md bg-royal-950">
                      <img src={event.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90" referrerPolicy="no-referrer" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />
                      
                      <div className="absolute top-3 left-3 bg-red-600 text-white text-[9px] font-mono uppercase tracking-widest font-bold px-2 py-0.5 rounded-full">
                        {countdown}
                      </div>

                      <div className="absolute bottom-0 inset-x-0 p-4 text-left">
                        <span className="text-[8px] font-mono text-gold-300 tracking-widest uppercase font-bold">{badge}</span>
                        <h4 className="font-manrope text-sm font-bold text-white leading-tight mt-0.5 group-hover:text-gold-200 transition-colors">{event.title}</h4>
                        <p className="text-[10px] text-white/70 font-light mt-1">{event.start_date} • {event.location} • {event.ticket_price}</p>
                        
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
                  );
                })}
                {nearbyEvents.length === 0 && (
                  <div className="col-span-2 text-center py-8 text-stone-400 text-xs">
                    No upcoming events near this destination yet.
                  </div>
                )}
              </div>
            </div>

            {/* 9. REVIEWS & COMMUNITY EXPERIENCE FEED */}
            <div id="community-stories" className="space-y-6 scroll-mt-20">

              {/* ── Top: Rating Summary + AI Panel ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">

                {/* Left: numeric rating + star bars */}
                <div className="bg-white border border-stone-100 rounded-2xl p-5 flex gap-5 items-center shadow-sm">
                  <div className="text-center shrink-0">
                    <p className="text-5xl font-manrope font-extrabold text-[#1c1a17]">{destination.rating.toFixed(1)}</p>
                    <div className="flex items-center gap-0.5 justify-center mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(destination.rating) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                      ))}
                    </div>
                    <p className="text-[10px] text-stone-400 mt-1 font-mono">{communityReviews.length.toLocaleString()} reviews</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(star => {
                      const count = communityReviews.filter(r => Math.round(r.rating) === star).length;
                      const pct = communityReviews.length > 0 ? (count / communityReviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-stone-500 w-2 shrink-0">{star}</span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-stone-400 font-mono w-7 text-right shrink-0">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right: AI review summary */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-amber-400 rounded-lg flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-white" />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest">AI Review Summary</span>
                  </div>
                  <p className="text-[12px] font-semibold text-amber-900 mb-3">
                    {communityReviews.length > 0
                      ? `${Math.round((communityReviews.filter(r => r.rating >= 4).length / communityReviews.length) * 100)}% of travelers recommend this experience`
                      : 'Be the first to review this destination'}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-widest mb-1.5">Most loved</p>
                      <ul className="space-y-1">
                        {(destination as any).aiPros?.slice(0,3).map((pro: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-700">
                            <span className="text-emerald-500 mt-0.5 shrink-0">●</span>{pro}
                          </li>
                        )) || [
                          'Stunning scenery',
                          'Friendly guides',
                          'Unique experience',
                        ].map((pro, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-700">
                            <span className="text-emerald-500 mt-0.5 shrink-0">●</span>{pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest mb-1.5">Could be better</p>
                      <ul className="space-y-1">
                        {(destination as any).aiCons?.slice(0,2).map((con: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-500">
                            <span className="text-stone-400 mt-0.5 shrink-0">●</span>{con}
                          </li>
                        )) || [
                          'Can get crowded',
                          'Limited parking',
                        ].map((con, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-500">
                            <span className="text-stone-400 mt-0.5 shrink-0">●</span>{con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Filter chips with counts ── */}
              <div className="flex overflow-x-auto scrollbar-none gap-2 pb-1">
                {[
                  { key: 'all', label: `All (${communityReviews.length})` },
                  { key: 'Solo', label: `Solo (${communityReviews.filter(r => (r as any).travelerType === 'Solo' || (r as any).traveler_type === 'Solo').length})` },
                  { key: 'Couple', label: `Couple (${communityReviews.filter(r => (r as any).travelerType === 'Couple' || (r as any).traveler_type === 'Couple').length})` },
                  { key: 'Family', label: `Family (${communityReviews.filter(r => (r as any).travelerType === 'Family' || (r as any).traveler_type === 'Family').length})` },
                  { key: 'Friends', label: `Friends (${communityReviews.filter(r => (r as any).travelerType === 'Friends' || (r as any).traveler_type === 'Friends').length})` },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { setReviewFilter(key as any); setVisibleReviews(6); }}
                    className={`whitespace-nowrap text-[11px] font-semibold px-4 py-1.5 rounded-full border transition-all ${
                      reviewFilter === key
                        ? 'bg-[#1c1a17] text-white border-[#1c1a17]'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* ── Write a Review form ── */}
              <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-br from-[#FAF8F5] to-white shadow-sm">
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-400 via-amber-300 to-gold-500" />
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 bg-gradient-to-br from-gold-400 to-amber-500 rounded-lg flex items-center justify-center shadow-sm">
                      <Pencil className="h-3.5 w-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[13px] font-manrope font-bold text-[#1c1a17]">Write a Review</p>
                      <p className="text-[10px] text-stone-400">Share your honest experience</p>
                    </div>
                  </div>

                  {!isAuthenticated ? (
                    <div className="flex items-center gap-4 bg-stone-50 border border-stone-100 rounded-xl p-4">
                      <span className="text-3xl">✍️</span>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[#1c1a17]">Sign in to leave a review</p>
                        <p className="text-[11px] text-stone-400">Help other travelers discover this place</p>
                      </div>
                      <a href="/login" className="shrink-0 px-4 py-1.5 bg-[#1c1a17] text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-full hover:bg-gold-600 transition-colors">
                        Login
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Stars + traveler type row */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(star => (
                            <button key={star} onClick={() => setNewReviewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                              <Star className={`h-6 w-6 transition-colors ${star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-200 hover:text-amber-200'}`} />
                            </button>
                          ))}
                          <span className="text-[12px] font-semibold text-stone-500 ml-1">{newReviewRating}/5</span>
                        </div>
                        <div className="flex gap-1.5">
                          {(['Solo','Couple','Family','Friends'] as const).map(t => (
                            <button
                              key={t}
                              onClick={() => setNewReviewTravelerType(t)}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border-2 transition-all ${
                                newReviewTravelerType === t ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-white border-stone-200 text-stone-500'
                              }`}
                            >{t}</button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <textarea
                          placeholder="Describe what made this place special — crowds, best time to visit, hidden tips..."
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          rows={3}
                          maxLength={500}
                          className="w-full bg-stone-50 border border-stone-200 text-[12px] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none text-stone-700 placeholder:text-stone-300 leading-relaxed"
                        />
                        <span className="absolute bottom-3 right-4 text-[9px] text-stone-300 font-mono">{newReviewText.length}/500</span>
                      </div>
                      {reviewError && (<div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2"><span className="text-red-500 text-sm">⚠️</span><p className="text-[11px] text-red-600">{reviewError}</p></div>)}
                      {reviewSubmitted && (<div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2"><span className="text-green-500 text-sm">✅</span><p className="text-[11px] text-green-700">Review published! Thank you.</p></div>)}
                      <button
                        onClick={handleSubmitReview}
                        disabled={!newReviewText.trim() || submittingReview}
                        className="w-full py-2.5 bg-[#1c1a17] text-white text-[11px] font-mono font-bold uppercase tracking-widest rounded-xl hover:bg-gold-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {submittingReview ? '✦ Publishing...' : '✦ Publish Review'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Review Cards grid ── */}
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm font-medium">No {reviewFilter !== 'all' ? reviewFilter : ''} reviews yet</p>
                  <p className="text-[11px] mt-1">Be the first to share your experience!</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredReviews.slice(0, visibleReviews).map((review, idx) => {
                      const isLiked = likedReviewIds.has(review.id);
                      const tType = (review as any).travelerType || (review as any).traveler_type || null;
                      const baseLikeHash = (Number(review.id.replace(/[^0-9]/g, '')) || 0) || (review.userName.charCodeAt(0) + (review.userName.charCodeAt(review.userName.length - 1) || 0));
                      const likeCount = reviewHelpfulCounts[review.id] ?? (10 + (baseLikeHash % 15));
                      return (
                        <div
                          key={review.id}
                          className="bg-white border border-stone-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col text-left"
                        >
                          {/* User row */}
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={review.userAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(review.userName)}`}
                              className="h-10 w-10 rounded-full object-cover bg-stone-100 border-2 border-white shadow-sm shrink-0"
                              onError={(e) => { (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${review.userName}`; }}
                            />
                            <div className="min-w-0">
                              <p className="text-[13px] font-bold text-[#1c1a17] truncate">{review.userName}</p>
                              <div className="flex items-center gap-1.5">
                                <div className="flex items-center gap-0.5">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`h-3 w-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                                  ))}
                                </div>
                                {tType && (
                                  <span className="text-[9px] bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full font-mono">{tType}</span>
                                )}
                              </div>
                              <p className="text-[10px] text-stone-400 font-mono">{review.date}</p>
                            </div>
                          </div>

                          {/* Comment */}
                          <p className="text-[12px] text-stone-600 leading-relaxed flex-1 line-clamp-4">
                            {review.comment}
                          </p>

                          {/* Footer */}
                          <div className="mt-3 pt-3 border-t border-stone-50 flex items-center">
                            <button
                              onClick={() => toggleLikeReview(review.id)}
                              className={`flex items-center gap-1.5 text-[11px] font-medium transition-all rounded-full px-2.5 py-1 ${
                                isLiked ? 'text-red-500 bg-red-50' : 'text-stone-400 hover:text-red-400 hover:bg-red-50'
                              }`}
                            >
                              <Heart className={`h-3.5 w-3.5 ${isLiked ? 'fill-red-500' : ''}`} />
                              <span>Helpful ({likeCount})</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Load More */}
                  {visibleReviews < filteredReviews.length && (
                    <div className="flex justify-center pt-2">
                      <button
                        onClick={() => setVisibleReviews(v => v + 6)}
                        className="px-8 py-2.5 border border-stone-300 text-[12px] font-semibold text-stone-600 rounded-full hover:bg-stone-50 hover:border-stone-400 transition-all"
                      >
                        Load More Reviews ({filteredReviews.length - visibleReviews} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
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
                    onClick={() => {
                      setActiveEcosystemTab(item.id as any);
                      ecosystemPausedUntilRef.current = Date.now() + 8000;
                    }}
                    className={`relative text-[10px] font-mono tracking-widest uppercase px-3 py-1.5 rounded-full shrink-0 transition-all overflow-hidden ${
                      activeEcosystemTab === item.id 
                        ? 'bg-royal-950 text-white font-bold' 
                        : 'bg-stone-50 text-stone-500 hover:bg-stone-100 border border-stone-200/10'
                    }`}
                  >
                    {activeEcosystemTab === item.id && (
                      <span
                        key={item.id + '-bar'}
                        className="absolute inset-x-0 bottom-0 h-[2px] bg-gold-400 origin-left"
                        style={{ animation: 'ecosystem-progress 3s linear forwards' }}
                      />
                    )}
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Slideshow progress dots */}
              <div className="flex justify-center gap-1.5 pt-2 pb-1">
                {(['stay','eat','experience','shop','guide'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveEcosystemTab(tab);
                      ecosystemPausedUntilRef.current = Date.now() + 8000;
                    }}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      activeEcosystemTab === tab ? 'w-4 bg-royal-950' : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                    }`}
                  />
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
                      onClick={() => setSelectedPartner(partner)}
                      className="group border border-stone-100 p-2.5 rounded-xl flex space-x-3 hover:border-gold-300 hover:bg-stone-50/50 transition-all duration-300 text-left cursor-pointer"
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
                          <div className="flex items-center gap-2">
                            <span>{partner.distance}</span>
                            <MapPin className="h-2.5 w-2.5 text-stone-400 group-hover:text-gold-500 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 12. EXCLUSIVE OFFERS / PROMOTIONS */}
            <div id="exclusive-vouchers" className="bg-[#FAF7F2] border border-gold-200/50 rounded-3xl p-5 shadow-sm text-left scroll-mt-20">
              <div className="flex items-center justify-between border-b border-gold-100 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4.5 w-4.5 text-gold-600 animate-pulse" />
                  <h3 className="font-manrope text-xs uppercase tracking-[0.15em] text-gold-800 font-extrabold">
                    Exclusive Offers Around Here
                  </h3>
                </div>
                <span className="text-[8.5px] font-mono text-gold-700 bg-gold-50/80 border border-gold-200/60 px-2.5 py-1 rounded-full font-bold uppercase whitespace-nowrap shrink-0">
                  {destination.partners.filter(p => p.promotion).length} Offers
                </span>
              </div>

              <div className="space-y-3.5">
                {destination.partners.filter(p => p.promotion).length === 0 ? (
                  <p className="text-xs text-stone-500 italic py-4 text-center">No active promotions at the moment.</p>
                ) : (
                  destination.partners
                    .filter(p => p.promotion)
                    .map(partner => {
                      const offerId = `offer-${partner.id}`;
                      const isClaimed = claimedOffers.has(offerId);
                      // Auto-generate a promo code from partner name
                      const promoCode = partner.name
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 12);
                      return (
                        <div key={offerId} className="border border-gold-200 bg-white p-3.5 rounded-2xl relative overflow-hidden flex flex-col justify-between">
                          {/* Decorative punch holes */}
                          <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FAF7F2] border-r border-gold-200" />
                          <span className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#FAF7F2] border-l border-gold-200" />

                          <div 
                            onClick={() => setSelectedPartner(partner)}
                            className="flex items-start gap-2.5 px-1.5 cursor-pointer hover:opacity-85 transition-opacity"
                            title="View Partner Details"
                          >
                            {partner.image && (
                              <img
                                src={partner.image}
                                alt={partner.name}
                                className="h-10 w-10 rounded-lg object-cover shrink-0 border border-gold-100"
                              />
                            )}
                            <div className="flex-1 min-w-0">
                              <span className="text-[8px] font-mono text-stone-500 block uppercase leading-none">{partner.name}</span>
                              <h4 className="font-manrope text-xs font-extrabold text-stone-900 mt-1 leading-tight">{partner.promotion}</h4>
                              <p className="text-[9.5px] text-stone-500 font-light leading-snug mt-0.5">{partner.price}</p>
                            </div>
                          </div>

                          <div className="mt-3.5 pt-2.5 border-t border-dashed border-stone-200 flex items-center justify-between px-1.5">
                            <span className="text-[9px] font-mono text-gold-700 bg-gold-50 border border-gold-100 px-2 py-0.5 rounded uppercase font-bold tracking-wide">
                              {promoCode}
                            </span>
                            <button 
                              onClick={() => handleClaimOffer(offerId)}
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
                    })
                )}
              </div>
            </div>

            {/* 13. SIMILAR DESTINATIONS */}
            <div className="bg-white border border-stone-200/50 rounded-3xl p-5 shadow-sm text-left space-y-4">
              <span className="text-[9px] font-mono font-bold tracking-widest text-gold-700 uppercase block leading-none">PEOPLE ALSO EXPLORED</span>
              
              <div className="space-y-3.5">
                {similarDestinations.map(similar => (
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
                    <img src={similar.images[0]?.url || ''} className="h-12 w-16 rounded-xl object-cover shrink-0 bg-stone-100" />
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
                      <span className="mt-2 text-stone-900 font-bold">IDR {domesticTicketPrice}</span>
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
                      <span className="mt-2 text-stone-900 font-bold">IDR {foreignTicketPrice}</span>
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
      {/* ── PARTNER DETAIL POPUP MODAL ── */}
      {selectedPartner && (
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedPartner(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal card */}
          <div
            className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* Hero image */}
            <div className="relative h-44 w-full bg-stone-100 overflow-hidden">
              {selectedPartner.image ? (
                <img
                  src={selectedPartner.image}
                  alt={selectedPartner.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold-50 to-amber-100">
                  <MapPin className="h-10 w-10 text-gold-400" />
                </div>
              )}
              {/* Close button */}
              <button
                onClick={() => setSelectedPartner(null)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              {/* Category badge */}
              <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-royal-950 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                {selectedPartner.category}
              </span>
              {/* Promotion ribbon */}
              {selectedPartner.promotion && (
                <span className="absolute bottom-3 left-3 bg-gold-500 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow">
                  🎁 {selectedPartner.promotion}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
              {/* Name + rating row */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-manrope text-base font-extrabold text-royal-950 leading-tight">{selectedPartner.name}</h3>
                  <p className="text-[10px] font-mono text-stone-500 mt-0.5">{selectedPartner.address}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                  <span className="text-[11px] font-bold text-amber-700">{selectedPartner.rating}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-stone-600 leading-relaxed">{selectedPartner.description}</p>

              {/* Price + distance chips */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-stone-800 bg-stone-100 px-2.5 py-1 rounded-full">
                  <Ticket className="h-3 w-3 text-stone-500" />
                  {selectedPartner.price}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-mono text-stone-600 bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-full">
                  <MapPin className="h-3 w-3 text-gold-500" />
                  {selectedPartner.distance}
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                {selectedPartner.phone && (
                  <a
                    href={`tel:${selectedPartner.phone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors text-xs font-semibold"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Call
                  </a>
                )}
                <a
                  href={
                    selectedPartner.coordinates?.lat && selectedPartner.coordinates?.lng
                      ? `https://www.google.com/maps/search/?api=1&query=${selectedPartner.coordinates.lat},${selectedPartner.coordinates.lng}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedPartner.name + ' ' + (selectedPartner.address || ''))}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-royal-950 text-white hover:bg-royal-900 transition-colors text-xs font-semibold"
                >
                  <Map className="h-3.5 w-3.5" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
