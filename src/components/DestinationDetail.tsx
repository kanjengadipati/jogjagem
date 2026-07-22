'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { 
  ArrowLeft, Heart, Share2, Star, Clock, Ticket, Sparkles, 
  MapPin, ShieldAlert, CheckCircle, HelpCircle, Thermometer,
  CloudSun, Phone, Tag, Hotel, Coffee, Utensils, Compass, 
  Footprints, MessageSquare, Map, Camera, Video, Eye, Award, 
  ChevronRight, Calendar, Users, AlertTriangle, Play,
  ShoppingBag, Landmark, ArrowRight, Check, HeartHandshake,
  MapPinned, Sunrise, Sunset, Flame, ChevronDown, Sparkle, Pencil, X, Navigation
} from 'lucide-react';
import { Destination, EcosystemPartner, Review } from '@/types';
import { events as eventsApi, reviews as reviewsApi, partners as partnersApi } from '@/lib/api';
import type { BePartner } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { inferTravelerIntent, orderCardsByIntent, IntentProfile } from '@/lib/travelerIntent';
import { fetchLiveWeather, LiveWeather } from '@/lib/weather';
import { useLocation } from '@/contexts/LocationContext';
import { useLeafletMap } from '@/hooks/useLeafletMap';
import AIFloatingAssistant from '@/components/AIFloatingAssistant';
import YouTubePlayer from '@/components/YouTubePlayer';
import MobileOverlayNav from '@/components/MobileOverlayNav';
import SubNav from '@/components/SubNav';
import { useLocale } from '@/contexts/LocaleContext';

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
  const router = useRouter();
  const { t } = useLocale();
  const { user, isAuthenticated } = useAuth();
  const userInitials = user?.name ? user.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : 'YG';
  // States
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [storyExpanded, setStoryExpanded] = useState(false);
  const [selectedMapFilter, setSelectedMapFilter] = useState<'all' | 'partner' | 'parking' | 'hotel' | 'resto' | 'guide' | 'toilet' | 'hospital'>('all');
  const [selectedMapPartner, setSelectedMapPartner] = useState<EcosystemPartner | null>(destination.partners[0] || null);

  // Enrich ecosystem partners from BE when embedded list is empty
  const [enrichedPartners, setEnrichedPartners] = useState<EcosystemPartner[]>(destination.partners);
  useEffect(() => {
    if (destination.partners.length > 0) {
      setEnrichedPartners(destination.partners);
      return;
    }
    partnersApi.getAll().then(res => {
      if (res.status === 'success' && Array.isArray(res.data)) {
        const mapped: EcosystemPartner[] = (res.data as BePartner[]).map(p => ({
          id: p.id,
          name: p.name,
          category: (['hotel','restaurant','cafe','guide','souvenir','rental','agent','transport'].includes((p.category || '').toLowerCase())
            ? p.category!.toLowerCase()
            : 'hotel') as EcosystemPartner['category'],
          image: p.image || '',
          rating: p.rating || 0,
          price: p.price || '',
          distance: p.distance || '',
          description: p.description || '',
          address: p.address || p.location || '',
          phone: p.phone,
          coordinates: { lat: p.latitude || 0, lng: p.longitude || 0 },
        }));
        setEnrichedPartners(mapped);
        if (!selectedMapPartner && mapped.length > 0) setSelectedMapPartner(mapped[0]);
      }
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination.id]);
  const [likedReviewIds, setLikedReviewIds] = useState<Set<string>>(new Set());
  const [bookmarkedTipIds, setBookmarkedTipIds] = useState<Set<number>>(new Set());
  const [activeEcosystemTab, setActiveEcosystemTab] = useState<'stay' | 'eat' | 'experience' | 'shop' | 'move' | 'guide'>('stay');
  const ecosystemPausedUntilRef = React.useRef<number>(0);
  const ecosystemTabs = ['stay', 'eat', 'experience', 'shop', 'guide'] as const;
  const [selectedPartner, setSelectedPartner] = useState<EcosystemPartner | null>(null);
  const { coords } = useLocation();
  const routePolylineRef = useRef<any>(null);

  // Leaflet refs for detail map — use shared hook
  const { mapRef: detailMapContainerRef, mapInstance: detailMapInstance, leafletRef: detailLeafletRef, markerGroup: detailMarkerGroup } = useLeafletMap({
    center: [destination.latitude, destination.longitude],
    zoom: 14,
    scrollWheelZoom: false,
    zoomControl: true,
  });

  // Draw route helper
  const drawRoute = async (L: any) => {
    if (!coords || !detailMapInstance.current) return;
    
    // Clear previous
    if (routePolylineRef.current) {
      detailMapInstance.current.removeLayer(routePolylineRef.current);
    }

    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${coords.lng},${coords.lat};${destination.longitude},${destination.latitude}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const polyline = L.geoJSON(data.routes[0].geometry, {
          style: { color: '#cb8527', weight: 5, opacity: 0.85 }
        }).addTo(detailMapInstance.current);

        polyline.eachLayer((layer: any) => {
          if (layer.getElement) {
            layer.getElement()?.classList.add('route-animated');
          }
        });

        routePolylineRef.current = polyline;
      }
    } catch (e) {
      console.error("OSRM Routing failed:", e);
    }
  };

  // Route drawing effect
  useEffect(() => {
    if (detailMapInstance.current && coords) {
      drawRoute(detailLeafletRef.current);
    }
  }, [coords, destination.latitude, destination.longitude]);

  // Render markers when map is ready or dependencies change
  useEffect(() => {
    const L = detailLeafletRef.current;
    const markers = detailMarkerGroup.current;
    const map = detailMapInstance.current;
    if (!L || !markers || !map) return;

    markers.clearLayers();

    // Fit bounds if user is also in Yogyakarta
    const inYogya = (lat: number, lng: number) => lat >= -8.2 && lat <= -7.5 && lng >= 110.0 && lng <= 110.6;
    if (coords && inYogya(coords.lat, coords.lng) && inYogya(destination.latitude, destination.longitude)) {
      const bounds = L.latLngBounds([destination.latitude, destination.longitude], [coords.lat, coords.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }

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
        .addTo(markers);

      // 2. Partners
      if (selectedMapFilter === 'all' || selectedMapFilter === 'partner') {
        enrichedPartners.forEach(partner => {
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
          marker.addTo(markers);
        });
      }

      // 3. Render Parking Lot
      if (selectedMapFilter === 'all' || selectedMapFilter === 'parking') {
        const pkIcon = L.divIcon({
          className: 'custom-detail-pk-marker',
          html: `
            <div class="p-1 bg-gray-600 text-white rounded-md text-[8px] font-bold border border-white flex items-center space-x-0.5 shadow-md">
              <span>{t('destination_detail.map_secure_parking')}</span>
            </div>
          `,
          iconSize: [90, 20],
          iconAnchor: [45, 10]
        });
        L.marker([destination.latitude + 0.003, destination.longitude + 0.005], { icon: pkIcon }).addTo(markers);
      }

      // 4. Render Toilet
      if (selectedMapFilter === 'all' || selectedMapFilter === 'toilet') {
        const toiletIcon = L.divIcon({
          className: 'custom-detail-toilet-marker',
          html: `
            <div class="p-1 bg-teal-600 text-white rounded-md text-[8px] font-bold border border-white flex items-center space-x-0.5 shadow-md">
              <span>{t('destination_detail.map_eco_toilets')}</span>
            </div>
          `,
          iconSize: [80, 20],
          iconAnchor: [40, 10]
        });
        L.marker([destination.latitude - 0.004, destination.longitude - 0.003], { icon: toiletIcon }).addTo(markers);
      }

      // 5. Render Emergency
      if (selectedMapFilter === 'all' || selectedMapFilter === 'hospital') {
        const emergencyIcon = L.divIcon({
          className: 'custom-detail-emergency-marker',
          html: `
            <div class="p-1 bg-red-600 text-white rounded-md text-[8px] font-bold border border-white flex items-center space-x-0.5 shadow-md">
              <span>{t('destination_detail.map_emergency_care')}</span>
            </div>
          `,
          iconSize: [100, 20],
          iconAnchor: [50, 10]
        });
        L.marker([destination.latitude + 0.002, destination.longitude - 0.003], { icon: emergencyIcon }).addTo(markers);
      }
  }, [destination.id, destination.category, destination.latitude, destination.longitude, enrichedPartners, selectedMapFilter, selectedMapPartner, coords]);


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
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Reviews state — loaded from BE on mount
  const [communityReviews, setCommunityReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'Solo' | 'Couple' | 'Family' | 'Friends'>('all');

  // Fetch live reviews from BE
  useEffect(() => {
    if (!destination.id) return;
    setReviewsLoading(true);
    reviewsApi.getByDestination(destination.id)
      .then(res => {
        if (res.status === 'success' && Array.isArray(res.data)) {
          const mapped: Review[] = (res.data as any[]).map((r: any) => ({
            id: r.id || String(r.ID || ''),
            userName: r.user_name || r.UserName || t('destination_detail.anonymous_user'),
            userAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.user_name || 'A')}`,
            rating: r.rating || r.Rating || 0,
            date: r.CreatedAt ? new Date(r.CreatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
            comment: r.comment || r.Comment || '',
            travelerType: (r.traveler_type || r.TravelerType || undefined) as Review['travelerType'],
          }));
          setCommunityReviews(mapped);
        } else {
          // Fallback to embedded reviews from destination data
          setCommunityReviews(destination.reviews || []);
        }
      })
      .catch(() => setCommunityReviews(destination.reviews || []))
      .finally(() => setReviewsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [destination.id]);
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

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [ticketCategory, setTicketCategory] = useState<'domestic' | 'foreign'>('domestic');
  const [ticketBooked, setTicketBooked] = useState(false);
  const [slideshowPaused, setSlideshowPaused] = useState(false);

  // Similar destinations from pre-fetched list
  const [similarDestinations, setSimilarDestinations] = useState<Destination[]>([]);
  useEffect(() => {
    if (allDestinations.length === 0) return;
    const filtered = allDestinations.filter(d => d.id !== destination.id);
    const sameCategory = filtered.filter(d => d.category === destination.category);
    const finalSimilar = sameCategory.length >= 3 ? sameCategory : filtered;
    setSimilarDestinations(finalSimilar.slice(0, 3));
  }, [destination.id, destination.category, allDestinations]);

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

        const all = res.data as any[];

        // 1. Prioritas utama: relasi langsung via destination_id
        const byRelation = all.filter(e =>
          e.destination_id && e.destination_id === destination.id
        );

        // 2. Fallback: punya koordinat + dalam radius 30km (exclude yg sudah ada di relasi)
        const relatedIds = new Set(byRelation.map(e => e.id));
        const byProximity = all
          .filter(e => e.latitude && e.longitude && !relatedIds.has(e.id))
          .map(e => ({ ...e, _dist: haversine(destination.latitude, destination.longitude, e.latitude, e.longitude) }))
          .filter(e => e._dist <= 30)
          .sort((a, b) => a._dist - b._dist);

        // 3. Last resort: tidak punya koordinat dan tidak ada relasi
        const usedIds = new Set([...byRelation, ...byProximity].map(e => e.id));
        const noCoord = all.filter(e => !e.latitude && !e.longitude && !usedIds.has(e.id));

        const combined = [...byRelation, ...byProximity, ...noCoord].slice(0, 4);
        setNearbyEvents(combined);
      }
    }).catch(() => {});
  }, [destination.id, destination.latitude, destination.longitude]);

  // Interactive Live Journey simulated context
  const [currentAssistantTime, setCurrentAssistantTime] = useState('09:15 AM');
  const [liveCrowdLevel, setLiveCrowdLevel] = useState<'Low' | 'Moderate' | 'High'>('Low');
  const [selectedJourneyActionIdx, setSelectedJourneyActionIdx] = useState<number | null>(null);
  const [liveWeather, setLiveWeather] = useState<LiveWeather | null>(null);

  // Fetch live weather from Open-Meteo
  useEffect(() => {
    if (destination.latitude && destination.longitude) {
      fetchLiveWeather(destination.latitude, destination.longitude)
        .then(data => {
          if (data) setLiveWeather(data);
        })
        .catch(() => {});
    }
  }, [destination.latitude, destination.longitude]);

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
    setShowShareModal(true);
  };

  const handleCopyLink = () => {
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

  const handleSubmitReview = async () => {
    if (!newReviewText.trim() || submittingReview) return;
    setSubmittingReview(true);
    setReviewError('');
    try {
      let userName = t('destination_detail.anonymous_user');
      if (user) {
        userName = user.name || user.email || t('destination_detail.anonymous_user');
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
        setReviewError(res.message || t('destination_detail.error_submit_review'));
      }
    } catch {
      setReviewError(t('destination_detail.error_network'));
    } finally {
      setSubmittingReview(false);
    }
  };

  // Dynamic recommendations based on destination data
  const getAIRecommendations = () => {
    const name = destination.name;
    const bestTime = destination.bestTime || '09:00 AM - 11:30 AM';
    const desc = (destination.description || '').toLowerCase();
    const tips = destination.travelTips || [];
    const facilities = destination.facilities || [];
    const recs: { text: string; time: string }[] = [];

    // Best time recommendation
    recs.push({ text: t('destination_detail.rec_visit_optimal_hours', { time: bestTime.split(' - ')[0] || '09:00 AM' }), time: bestTime.split(' - ')[0] || '09:00 AM' });

    // Facility-based
    if (facilities.length > 0) {
      recs.push({ text: t('destination_detail.rec_use_facility', { facility: facilities[0] }), time: '10:00 AM' });
    }

    // Description-based contextual tips
    if (desc.includes('sunrise') || desc.includes('dawn')) {
      recs.push({ text: t('destination_detail.rec_arrive_dawn'), time: '05:30 AM' });
    } else if (desc.includes('sunset') || desc.includes('evening')) {
      recs.push({ text: t('destination_detail.rec_stay_evening'), time: '05:00 PM' });
    } else if (desc.includes('market') || desc.includes('shop') || desc.includes('batik')) {
      recs.push({ text: t('destination_detail.rec_visit_early_crowds'), time: '08:30 AM' });
    } else if (desc.includes('cave') || desc.includes('adventure') || desc.includes('raft')) {
      recs.push({ text: t('destination_detail.rec_book_slots_advance'), time: '09:00 AM' });
    } else {
      recs.push({ text: t('destination_detail.rec_peak_sunlight_photo'), time: '11:00 AM' });
    }

    // Travel tip-based
    if (tips.length > 0) {
      recs.push({ text: tips[0], time: '12:00 PM' });
    }

    // Food recommendation based on location
    if (destination.subRegion) {
      recs.push({ text: t('destination_detail.rec_culinary_spots', { region: destination.subRegion }), time: '01:00 PM' });
    }

    return recs.slice(0, 5);
  };

  // Dynamic timeline based on destination data and nearby events
  const getSuggestedTimeline = () => {
    const name = destination.name;
    const bestTime = destination.bestTime || '09:00 AM - 11:30 AM';
    const desc = (destination.description || '').toLowerCase();
    const category = (destination.category || '').toLowerCase();
    const steps: { time: string; title: string; desc: string }[] = [];

    // Morning arrival
    steps.push({ time: '08:00', title: t('destination_detail.timeline_morning_title', { name }), desc: t('destination_detail.timeline_morning_desc', { name }) });

    // Mid-morning highlight based on category
    if (category.includes('heritage') || category.includes('temple')) {
      steps.push({ time: '10:30', title: t('destination_detail.timeline_heritage_title'), desc: t('destination_detail.timeline_heritage_desc') });
    } else if (category.includes('beach') || category.includes('coast')) {
      steps.push({ time: '10:30', title: t('destination_detail.timeline_coastal_title'), desc: t('destination_detail.timeline_coastal_desc') });
    } else if (category.includes('mountain') || category.includes('adventure')) {
      steps.push({ time: '10:30', title: t('destination_detail.timeline_adventure_title'), desc: t('destination_detail.timeline_adventure_desc') });
    } else {
      steps.push({ time: '10:30', title: t('destination_detail.timeline_surroundings_title'), desc: t('destination_detail.timeline_surroundings_desc') });
    }

    // Lunch
    steps.push({ time: '12:00', title: t('destination_detail.timeline_culinary_title'), desc: destination.subRegion ? t('destination_detail.timeline_culinary_desc_named', { region: destination.subRegion }) : t('destination_detail.timeline_culinary_desc_generic') });

    // Afternoon
    if (desc.includes('museum') || desc.includes('gallery') || desc.includes('art')) {
      steps.push({ time: '14:00', title: t('destination_detail.timeline_cultural_title'), desc: t('destination_detail.timeline_cultural_desc') });
    } else {
      steps.push({ time: '14:00', title: t('destination_detail.timeline_afternoon_title'), desc: t('destination_detail.timeline_afternoon_desc') });
    }

    // Sunset/evening
    if (desc.includes('sunset') || desc.includes('beach') || desc.includes('coast')) {
      steps.push({ time: '17:00', title: t('destination_detail.timeline_sunset_title'), desc: t('destination_detail.timeline_sunset_desc') });
    } else {
      steps.push({ time: '17:30', title: t('destination_detail.timeline_golden_hour_title'), desc: t('destination_detail.timeline_golden_hour_desc') });
    }

    // Add first nearby event if exists
    if (nearbyEvents.length > 0) {
      const evt = nearbyEvents[0];
      steps.push({ time: '19:00', title: evt.title, desc: `${evt.location} — ${evt.start_date}` });
    }

    return steps;
  };

  const getTravelerStories = () => {
    return destination.reviews.slice(0, 3).map((rev, i) => ({
      id: rev.id,
      user: rev.userName,
      location: 'Yogyakarta',
      avatar: rev.userAvatar,
      tag: t('destination_detail.review_tag', { rating: rev.rating.toFixed(1) }),
      text: rev.comment,
      img: destination.images[i % destination.images.length]?.url || destination.images[0]?.url || ''
    }));
  };

  // Filter reviews by traveler type
  const filteredReviews = reviewFilter === 'all'
    ? communityReviews
    : communityReviews.filter(r => (r as any).travelerType === reviewFilter || (r as any).traveler_type === reviewFilter);

  const activeEcosystemPartners = enrichedPartners.filter(p => {
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
    if (allText.includes('temple') || allText.includes('candi') || allText.includes('heritage')) keywords.push(t('destination_detail.audience_heritage_explorers'));
    if (allText.includes('sunrise') || allText.includes('dawn')) keywords.push(t('destination_detail.audience_sunrise_chasers'));
    if (allText.includes('culture') || allText.includes('tradition') || allText.includes('history')) keywords.push(t('destination_detail.audience_culture_seekers'));
    if (allText.includes('photo') || allText.includes('view') || allText.includes('panoram')) keywords.push(t('destination_detail.audience_panoramic_photographers'));
    if (allText.includes('family') || allText.includes('children')) keywords.push(t('destination_detail.audience_family_travelers'));
    if (allText.includes('cave') || allText.includes('adventure') || allText.includes('hike')) keywords.push(t('destination_detail.audience_adventure_enthusiasts'));
    if (allText.includes('nature') || allText.includes('forest') || allText.includes('mountain')) keywords.push(t('destination_detail.audience_nature_lovers'));
    if (allText.includes('art') || allText.includes('craft') || allText.includes('batik')) keywords.push(t('destination_detail.audience_art_craft_enthusiasts'));

    if (keywords.length === 0) keywords.push(t('destination_detail.audience_curious_travelers'), t('destination_detail.audience_culture_seekers'), t('destination_detail.audience_photography_enthusiasts'));

    const audience = keywords.length <= 2 ? keywords.join(' and ') : `${keywords.slice(0, -1).join(', ')} and ${keywords[keywords.length - 1]}`;
    return t('destination_detail.curator_quote_full', { audience, name });
  };

  // Dynamic visiting season based on category
  const getVisitingSeason = () => {
    const cat = (destination.category || '').toLowerCase();
    if (cat.includes('temple') || cat.includes('candi') || cat.includes('heritage')) return t('destination_detail.season_yearround_peak');
    if (cat.includes('beach') || cat.includes('coast')) return t('destination_detail.season_dry');
    if (cat.includes('mountain') || cat.includes('adventure')) return t('destination_detail.season_dry_months');
    return t('destination_detail.season_yearround_best');
  };

  const getSeasonDetail = () => {
    const cat = (destination.category || '').toLowerCase();
    if (cat.includes('temple') || cat.includes('candi') || cat.includes('heritage')) return t('destination_detail.season_detail_open_air');
    if (cat.includes('beach') || cat.includes('coast')) return t('destination_detail.season_detail_calm_seas');
    if (cat.includes('mountain') || cat.includes('adventure')) return t('destination_detail.season_detail_clear_views');
    return t('destination_detail.season_detail_balanced');
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
      
      <AIFloatingAssistant 
        destination={destination} 
        liveWeather={liveWeather} 
        liveCrowdLevel={liveCrowdLevel} 
      />

      {/* 1. STICKY NAVIGATION BAR — desktop only */}
      <div className="hidden lg:block">
        <SubNav
          onBack={onBack}
          title={destination.name}
          centerLinks={[
            { label: t('destination_detail.nav_explore'), onClick: onBack },
            { label: t('destination_detail.nav_journey'), href: '#suggested-journey-section' },
            { label: t('destination_detail.nav_ecosystem'), href: '#ecosystem-section' },
            { label: t('destination_detail.nav_route_map'), href: '#interactive-map-section' },
            { label: t('destination_detail.nav_stories'), href: '#community-stories' },
          ]}
          isSaved={isSaved}
          onToggleSave={() => onToggleSave(destination)}
          onShare={handleShare}
          copiedToast={copied}
          userInitials={userInitials}
        />
      </div>

      {/* 2. HERO — full-width dark, teks kiri, media grid kanan */}
      <section className="relative bg-[#0f100c] text-white overflow-hidden">
        {/* Mobile overlay nav */}
        <MobileOverlayNav
          onBack={onBack}
          title={destination.name}
          isSaved={isSaved}
          onToggleSave={() => onToggleSave(destination)}
          onShare={handleShare}
          copiedToast={copied}
        />

        {/* Background image — visible, slight blur, gradient hanya di kiri untuk teks */}
        <div className="absolute inset-0">
          {destination.images[0]?.url && (
            <Image
              src={destination.images[0].url}
              alt=""
              fill
              priority
              className="object-cover opacity-90 scale-105"
            />
          )}
          {/* Gradient kuat di kiri agar teks terbaca, tipis di kanan agar foto kelihatan */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f100c]/90 via-[#0f100c]/40 to-transparent" />
          {/* Gradient bawah agar konten grid kanan tidak terlalu silau */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f100c]/60 via-transparent to-[#0f100c]/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-white/50 mb-5 font-mono">
            <button onClick={onBack} className="hover:text-white/80 transition-colors">{t('destination_detail.nav_explore')}</button>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/50">Hidden Gems</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">{destination.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* ── LEFT: badges, rating, title, desc, stats, CTAs ── */}
            <div className="lg:col-span-6 space-y-5">

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {(destination.badges?.length ? destination.badges : [destination.badge || 'Hidden Gem']).map((b, i) => (
                  <span key={i} className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${i === 0 ? 'bg-gold-500 text-white' : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'}`}>
                    {i === 0 && <Award className="h-3 w-3" />}
                    {b}
                  </span>
                ))}
              </div>

              {/* Rating + Location */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{destination.rating.toFixed(1)}</span>
                  <span className="text-white/60">({destination.reviewCount.toLocaleString()} {t('destination_detail.reviews_label')})</span>
                </div>
                <span className="text-white/30">•</span>
                <div className="flex items-center gap-1 text-white/70">
                  <MapPin className="h-3.5 w-3.5 text-gold-400" />
                  <span>{destination.location}</span>
                </div>
              </div>

              {/* Subtitle + Name */}
              <div>
                <p className="text-xs font-mono text-gold-400 uppercase tracking-widest mb-1.5">
                  #1 {destination.category} {t('destination_detail.division_label')} Yogyakarta
                </p>
                <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
                  {destination.name}
                </h1>
              </div>

              {/* Description */}
              <p className="text-sm text-white/75 leading-relaxed max-w-lg font-light">
                {destination.description?.slice(0, 160)}
                {(destination.description?.length || 0) > 160 && '…'}
              </p>

              {/* Stats strip */}
              <div className="flex flex-wrap gap-6 py-1">
                {[
                  { icon: Users,  value: '90%',                                        label: t('destination_detail.traveler_recommend') },
                  { icon: Camera, value: `${destination.reviewCount.toLocaleString()}+`, label: t('destination_detail.sudah_berkunjung')      },
                  { icon: Clock,  value: destination.bestTime || '09.00 – 11.00',        label: t('destination_detail.best_time_label')        },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center">
                        <Icon className="h-4 w-4 text-gold-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold leading-none">{stat.value}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CTA buttons */}
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={`/planner?destination=${encodeURIComponent(destination.id)}&name=${encodeURIComponent(destination.name)}`}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-600 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg"
                >
                  <Sparkles className="h-4 w-4" />
                  {t('destination_detail.plan_trip')}
                </a>
                <button
                  onClick={() => onToggleSave(destination)}
                  className={`flex items-center gap-2 px-5 py-2.5 border rounded-xl font-semibold text-sm transition-colors ${
                    isSaved
                      ? 'bg-gold-400/25 border-gold-400 text-gold-300'
                      : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? t('destination_detail.bookmarked') : t('destination_detail.save')}
                </button>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 text-white hover:bg-white/20 font-semibold text-sm rounded-xl transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  {t('destination_detail.share')}
                </button>
                {/* Google Maps directions button */}
                <a
                  href={
                    destination.googleMapsUrl ||
                    (destination.latitude && destination.longitude
                      ? `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination.name + ', Yogyakarta')}`)
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/20 text-white hover:bg-white/20 font-semibold text-sm rounded-xl transition-colors"
                >
                  <Navigation className="h-4 w-4 text-gold-400" />
                  {t('destination_detail.get_directions') || 'Petunjuk Arah'}
                </a>
              </div>
            </div>

            {/* ── RIGHT: video large + 2 small photos + "+N foto" row ── */}
            {(() => {
              // Resolve fallback URLs — never allow empty string
              const imgs = destination.images;
              const firstUrl = imgs.find(i => i?.url)?.url ?? null;
              const getUrl = (idx: number): string | null => imgs[idx]?.url || firstUrl;
              const activeUrl = getUrl(activeImageIdx);

              return (
                <div className="lg:col-span-6 grid grid-cols-2 grid-rows-3 gap-3 h-[420px]">

                  {/* Video — tall, spans 2 rows left side */}
                  <div className="col-span-1 row-span-2 relative rounded-2xl overflow-hidden bg-black/40">
                    {destination.videoUrl ? (
                      <YouTubePlayer
                        videoUrl={destination.videoUrl}
                        thumbnailUrl={getUrl(1) || undefined}
                        title={destination.name}
                        label={t('destination_detail.media_tab_cinematic')}
                        className="rounded-2xl"
                      />
                    ) : getUrl(1) ? (
                      <button
                        onClick={() => { setActiveImageIdx(1); setSlideshowPaused(true); setTimeout(() => setSlideshowPaused(false), 8000); }}
                        className="relative w-full h-full group"
                      >
                        <Image
                          src={getUrl(1)!}
                          alt="foto 2"
                          fill
                          className="object-cover opacity-80 group-hover:scale-105 transition-transform duration-300"
                        />
                      </button>
                    ) : (
                      <div className="w-full h-full bg-royal-900" />
                    )}
                  </div>

                  {/* Photo top-right */}
                  <button
                    className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group bg-white/5"
                    onClick={() => { setActiveImageIdx(2); setSlideshowPaused(true); setTimeout(() => setSlideshowPaused(false), 8000); }}
                  >
                    {getUrl(2) && (
                      <Image
                        src={getUrl(2)!}
                        alt={`${destination.name} foto 3`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </button>

                  {/* Photo middle-right */}
                  <button
                    className="col-span-1 row-span-1 relative rounded-2xl overflow-hidden group bg-white/5"
                    onClick={() => { setActiveImageIdx(3); setSlideshowPaused(true); setTimeout(() => setSlideshowPaused(false), 8000); }}
                  >
                    {getUrl(3) && (
                      <Image
                        src={getUrl(3)!}
                        alt={`${destination.name} foto 4`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                  </button>

                  {/* Bottom full-width: active image + "+N Foto Lainnya" */}
                  <button
                    className="col-span-2 row-span-1 relative rounded-2xl overflow-hidden group bg-white/5"
                    onClick={() => { setActiveImageIdx(0); setSlideshowPaused(true); setTimeout(() => setSlideshowPaused(false), 8000); }}
                  >
                    {activeUrl && (
                      <Image
                        src={activeUrl}
                        alt={destination.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    )}
                    {imgs.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 group-hover:bg-black/40 transition-colors">
                        <Camera className="h-5 w-5 text-white" />
                        <span className="text-white font-bold text-sm">+{imgs.length - 4} {t('destination_detail.more_photos')}</span>
                      </div>
                    )}
                  </button>

                </div>
              );
            })()}
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
                <Award className="h-5 w-5 text-gold-600" />
                <h3 className="font-manrope text-xs uppercase tracking-[0.15em] text-gold-700 font-extrabold">
                  {t('destination_detail.curator_pick')}
                </h3>
              </div>
              
              <p className="font-display text-xl sm:text-2xl text-royal-950 font-medium leading-normal italic">
                "{getCuratorQuote()}"
              </p>

              <div className="border-t border-gold-200/40 pt-6 grid grid-cols-2 sm:grid-cols-3 gap-5">
                {[
                  { label: t('destination_detail.optimal_visit'), value: destination.bestTime || t('destination_detail.fallback_best_time'), detail: t('destination_detail.golden_hour'), icon: Clock },
                  { label: t('destination_detail.opening_hours'), value: destination.openingHours || t('destination_detail.fallback_opening_hours'), detail: t('destination_detail.daily_access'), icon: Ticket },
                  { label: t('destination_detail.visiting_season'), value: getVisitingSeason(), detail: getSeasonDetail(), icon: CloudSun },
                  { label: t('destination_detail.terrain_access'), value: destination.facilities?.[0] || t('destination_detail.fallback_flat_pathway'), detail: destination.facilities?.[1] || t('destination_detail.easy_walking'), icon: Landmark },
                  { label: t('destination_detail.ticket_price'), value: `IDR ${domesticTicketPrice}`, detail: `${t('destination_detail.foreign_price_label')}: IDR ${foreignTicketPrice}`, icon: Ticket },
                  { label: t('destination_detail.climate'), value: `Live ${destination.weather.temp || t('destination_detail.fallback_temp')} • ${destination.weather.condition || t('destination_detail.fallback_sunny')}`, detail: destination.weather.status || t('destination_detail.mild_climate'), icon: Thermometer }
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
                  {t('destination_detail.editorial_story')}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                
                {/* Story description text with expandable transition */}
                <div className="md:col-span-7 space-y-4">
                  <h3 className="font-display text-2.5xl text-royal-950 leading-snug">
                    {destination.tagline || t('destination_detail.fallback_tagline')}
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
                        <span className="text-[9px] font-mono font-bold text-gold-700 uppercase tracking-widest">{t('destination_detail.traveler_tips')}</span>
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
                    <span>{storyExpanded ? t('destination_detail.collapse_text') : t('destination_detail.read_legend')}</span>
                    <ChevronDown className={`h-3 w-3 transform transition-transform ${storyExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Decorative Side Photo Frame */}
                <div className="md:col-span-5">
                  <div className="relative rounded-2xl overflow-hidden border border-gold-200/30 shadow-md group aspect-[4/3] bg-royal-950">
                    <Image 
                      src={destination.images[1]?.url || destination.images[0]?.url || ''} 
                      alt={`${destination.name} detail foto`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-95"
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end text-left">
                      <span className="text-[9px] font-mono text-gold-300 tracking-widest uppercase">{t('destination_detail.detail_relief')}</span>
                      <span className="text-xs font-semibold text-white">{t('destination_detail.detail_relief_desc')}</span>
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
                    {t('destination_detail.continue_experience')}
                  </h2>
                </div>
                {travelerIntent && travelerIntent.intent !== 'general' ? (
                  <span className="text-xs text-stone-500">
                    {t('destination_detail.tailored_for')} <span className="font-semibold text-gold-700">{travelerIntent.label}</span> {t('destination_detail.like_you')}
                  </span>
                ) : (
                  <span className="text-xs text-stone-500">{t('destination_detail.based_on_profile')}</span>
                )}
              </div>

              {/* Bento Grid layout with gorgeous styled cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(travelerIntent && travelerIntent.intent !== 'general'
                  ? orderCardsByIntent([
                      { title: t('destination_detail.card_stay'), icon: Hotel, desc: t('destination_detail.card_stay_desc'), color: "text-[#2e4d3c] bg-emerald-50 border-emerald-100", label: t('destination_detail.card_label_stay') },
                      { title: t('destination_detail.card_eat'), icon: Utensils, desc: t('destination_detail.card_eat_desc'), color: "text-[#7c4d12] bg-amber-50 border-amber-100", label: t('destination_detail.card_label_culinary') },
                      { title: t('destination_detail.card_experiences'), icon: Sparkles, desc: t('destination_detail.card_experiences_desc'), color: "text-[#6c2e7c] bg-purple-50 border-purple-100", label: t('destination_detail.card_label_discover') },
                      { title: t('destination_detail.card_shopping'), icon: ShoppingBag, desc: t('destination_detail.card_shopping_desc'), color: "text-[#7c1212] bg-red-50 border-red-100", label: t('destination_detail.card_label_craft') },
                      { title: t('destination_detail.card_guide'), icon: Users, desc: t('destination_detail.card_guide_desc'), color: "text-[#125c7c] bg-blue-50 border-blue-100", label: t('destination_detail.card_label_service') },
                      { title: t('destination_detail.card_transport'), icon: MapPinned, desc: t('destination_detail.card_transport_desc'), color: "text-[#4d4d4d] bg-stone-50 border-stone-100", label: t('destination_detail.card_label_ride') }
                    ], travelerIntent)
                  : [
                      { title: t('destination_detail.card_stay'), icon: Hotel, desc: t('destination_detail.card_stay_desc'), color: "text-[#2e4d3c] bg-emerald-50 border-emerald-100", label: t('destination_detail.card_label_stay') },
                      { title: t('destination_detail.card_eat'), icon: Utensils, desc: t('destination_detail.card_eat_desc'), color: "text-[#7c4d12] bg-amber-50 border-amber-100", label: t('destination_detail.card_label_culinary') },
                      { title: t('destination_detail.card_experiences'), icon: Sparkles, desc: t('destination_detail.card_experiences_desc'), color: "text-[#6c2e7c] bg-purple-50 border-purple-100", label: t('destination_detail.card_label_discover') },
                      { title: t('destination_detail.card_shopping'), icon: ShoppingBag, desc: t('destination_detail.card_shopping_desc'), color: "text-[#7c1212] bg-red-50 border-red-100", label: t('destination_detail.card_label_craft') },
                      { title: t('destination_detail.card_guide'), icon: Users, desc: t('destination_detail.card_guide_desc'), color: "text-[#125c7c] bg-blue-50 border-blue-100", label: t('destination_detail.card_label_service') },
                      { title: t('destination_detail.card_transport'), icon: MapPinned, desc: t('destination_detail.card_transport_desc'), color: "text-[#4d4d4d] bg-stone-50 border-stone-100", label: t('destination_detail.card_label_ride') }
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
                        <span className="text-[9px] font-mono font-bold text-gold-600 bg-gold-50 px-1.5 py-0.5 rounded">{t('destination_detail.ai_picked')}</span>
                        <span className="text-[9px] text-stone-400 font-bold group-hover:text-stone-900 transition-all flex items-center">
                          <span>{t('destination_detail.browse')}</span>
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
                    {t('destination_detail.ecosystem_map')}
                  </h2>
                </div>
                <span className="text-xs font-mono text-gold-700">LAT {destination.latitude.toFixed(4)} • LNG {destination.longitude.toFixed(4)}</span>
              </div>

              {/* Leaflet Map Grid Container */}
              <div className="relative rounded-3xl overflow-hidden border border-gold-200/50 shadow-lg aspect-square sm:aspect-16/10">
                {/* Leaflet DOM container */}
                <div ref={detailMapContainerRef} id="detail-map-section" className="w-full h-full z-0 bg-stone-100" />

                {/* Filter Overlay Buttons */}
                <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md border border-gold-200/50 p-2.5 rounded-2xl flex flex-col gap-1.5 shadow-lg w-40">
                  <span className="text-[8px] font-mono font-bold tracking-wider text-royal-700/60 uppercase border-b pb-1">{t('destination_detail.filter_map_pins')}</span>
                  {[
                    { id: 'all', label: t('destination_detail.filter_all'), icon: Map },
                    { id: 'partner', label: t('destination_detail.filter_verified'), icon: Award },
                    { id: 'parking', label: t('destination_detail.filter_parking'), icon: Compass },
                    { id: 'toilet', label: t('destination_detail.filter_toilets'), icon: Flame },
                    { id: 'hospital', label: t('destination_detail.filter_emergency'), icon: ShieldAlert }
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
                  <div className="absolute bottom-4 left-3 right-3 sm:left-[50%] sm:-translate-x-1/2 sm:w-[400px] z-20 bg-royal-950/95 backdrop-blur-md border border-white/10 text-white p-2 rounded-xl flex flex-row items-center justify-between gap-2 shadow-2xl animate-fade-in max-h-[70px] overflow-hidden">
                    <div
                      onClick={() => setSelectedPartner(selectedMapPartner)}
                      className="flex items-center space-x-2 text-left w-full cursor-pointer hover:opacity-90 transition-opacity min-w-0"
                      title={t('destination_detail.view_partner')}
                    >
                      <Image src={selectedMapPartner.image} alt={selectedMapPartner.name} className="h-10 w-10 rounded-lg object-cover border border-white/10 shrink-0" width={40} height={40} />
                      <div className="min-w-0">
                        <div className="flex items-center space-x-1">
                          <span className="text-[7px] font-mono font-bold tracking-widest text-gold-300 uppercase truncate">{selectedMapPartner.category}</span>
                          <span className="text-[7px] font-mono text-emerald-400 font-semibold truncate">• {t('destination_detail.verified_partner')}</span>
                        </div>
                        <h4 className="font-manrope font-bold text-xs text-white truncate">{selectedMapPartner.name}</h4>
                        <p className="text-[8px] text-white/70 font-light leading-none mt-0.5 truncate">{selectedMapPartner.distance} • {selectedMapPartner.price}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 shrink-0">
                      <div className="text-right">
                        <span className="block text-[9px] font-bold text-amber-400">★ {selectedMapPartner.rating.toFixed(1)}</span>
                      </div>
                      <a 
                        href={`tel:${selectedMapPartner.phone || '+62274'}`}
                        className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all text-xs shrink-0"
                        title={t('destination_detail.call_partner')}
                      >
                        <Phone className="h-3.5 w-3.5" />
                      </a>
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
                    {t('destination_detail.ai_suggested_journey')}
                  </h2>
                </div>
                <span className="text-xs text-stone-500">{t('destination_detail.personalized_timeline')}</span>
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
                              {t('destination_detail.current_station')}
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
                    {t('destination_detail.upcoming_events')}
                  </h2>
                </div>
                <span className="text-xs text-stone-500">{nearbyEvents.length > 0 ? t('destination_detail.events_nearby_count', { count: nearbyEvents.length }) : t('destination_detail.no_nearby_events')}</span>
              </div>

              <div className="flex gap-4 overflow-x-auto scrollbar-none pb-4 snap-x snap-mandatory">
                {nearbyEvents.map(event => {
                  const badge = event.category?.charAt(0).toUpperCase() + event.category?.slice(1) || t('destination_detail.event_badge_fallback');
                  return (
                    <button
                      key={event.id}
                      onClick={() => router.push(`/events/${event.id}`)}
                      className="shrink-0 snap-start w-[240px] sm:w-[280px] group relative aspect-[16/10] overflow-hidden rounded-2xl border border-stone-200/10 shadow-md bg-royal-950 text-left"
                    >
                      {event.image_url ? (
                        <Image src={event.image_url} alt={event.title} sizes="280px" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-90" referrerPolicy="no-referrer" fill />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-royal-900 to-royal-800" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      
                      <div className="absolute bottom-0 inset-x-0 p-4">
                        <span className="text-[9px] font-mono text-gold-300 tracking-widest uppercase font-bold">{badge}</span>
                        <h4 className="font-manrope text-sm font-bold text-white leading-tight mt-0.5 group-hover:text-gold-200 transition-colors line-clamp-2">{event.title}</h4>
                        <p className="text-[10px] text-white/70 font-light mt-1 line-clamp-1">{event.start_date} • {event.location}</p>
                      </div>
                    </button>
                  );
                })}
                {nearbyEvents.length === 0 && (
                  <div className="text-center py-8 text-stone-400 text-xs w-full">
                    {t('destination_detail.no_events_yet')}
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
                    <p className="text-[10px] text-stone-400 mt-1 font-mono">{communityReviews.length.toLocaleString()} {t('destination_detail.reviews')}</p>
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
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest">{t('destination_detail.ai_review_summary')}</span>
                  </div>
                  <p className="text-[12px] font-semibold text-amber-900 mb-3">
                    {communityReviews.length > 0
                        ? `${Math.round((communityReviews.filter(r => r.rating >= 4).length / communityReviews.length) * 100)}% ${t('destination_detail.travelers_recommend')}`
                        : t('destination_detail.be_first_review')}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[9px] font-mono font-bold text-emerald-700 uppercase tracking-widest mb-1.5">{t('destination_detail.most_loved')}</p>
                      <ul className="space-y-1">
                        {(destination as any).aiPros?.slice(0,3).map((pro: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-700">
                            <span className="text-emerald-500 mt-0.5 shrink-0">●</span>{pro}
                          </li>
                        )) || (destination.travelTips.length > 0
                          ? destination.travelTips.slice(0, 3)
                          : [destination.description?.slice(0, 50) || t('destination_detail.pro_unique'), t('destination_detail.pro_scenery'), t('destination_detail.pro_heritage')]
                        ).map((tip: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-700">
                            <span className="text-emerald-500 mt-0.5 shrink-0">●</span>{tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-[9px] font-mono font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('destination_detail.could_be_better')}</p>
                      <ul className="space-y-1">
                        {(destination as any).aiCons?.slice(0,2).map((con: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5 text-[11px] text-stone-500">
                            <span className="text-stone-400 mt-0.5 shrink-0">●</span>{con}
                          </li>
                        )) || (() => {
                          const reviewText = communityReviews.map(r => r.comment?.toLowerCase() || ' ').join(' ');
                          const cons: string[] = [];
                          if (reviewText.includes('crowd') || reviewText.includes('busy')) cons.push(t('destination_detail.con_crowded'));
                          if (reviewText.includes('parking') || reviewText.includes('walk')) cons.push(t('destination_detail.con_walking'));
                          if (reviewText.includes('hot') || reviewText.includes('sun')) cons.push(t('destination_detail.con_sun'));
                          if (cons.length === 0) cons.push(t('destination_detail.con_peak'));
                          if (cons.length < 2) cons.push(t('destination_detail.con_hours'));
                          return cons.slice(0, 2);
                        })().map((con: string, i: number) => (
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
                  { key: 'all', label: t('destination_detail.filter_all_reviews', { count: communityReviews.length }) },
                  { key: 'Solo', label: t('destination_detail.filter_solo_reviews', { count: communityReviews.filter(r => (r as any).travelerType === 'Solo' || (r as any).traveler_type === 'Solo').length }) },
                  { key: 'Couple', label: t('destination_detail.filter_couple_reviews', { count: communityReviews.filter(r => (r as any).travelerType === 'Couple' || (r as any).traveler_type === 'Couple').length }) },
                  { key: 'Family', label: t('destination_detail.filter_family_reviews', { count: communityReviews.filter(r => (r as any).travelerType === 'Family' || (r as any).traveler_type === 'Family').length }) },
                  { key: 'Friends', label: t('destination_detail.filter_friends_reviews', { count: communityReviews.filter(r => (r as any).travelerType === 'Friends' || (r as any).traveler_type === 'Friends').length }) },
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
                      <p className="text-[13px] font-manrope font-bold text-[#1c1a17]">{t('destination_detail.write_a_review')}</p>
                      <p className="text-[10px] text-stone-400">{t('destination_detail.share_experience')}</p>
                    </div>
                  </div>

                  {!isAuthenticated ? (
                    <div className="flex items-center gap-4 bg-stone-50 border border-stone-100 rounded-xl p-4">
                      <span className="text-3xl">✍️</span>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-[#1c1a17]">{t('destination_detail.sign_in_review')}</p>
                        <p className="text-[11px] text-stone-400">{t('destination_detail.help_travelers')}</p>
                      </div>
                      <a href="/login" className="shrink-0 px-4 py-1.5 bg-[#1c1a17] text-white text-[10px] font-mono font-bold uppercase tracking-widest rounded-full hover:bg-gold-600 transition-colors">
                        {t('destination_detail.login')}
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
                          {(['Solo','Couple','Family','Friends'] as const).map(type => (
                            <button
                              key={type}
                              onClick={() => setNewReviewTravelerType(type)}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border-2 transition-all ${
                                newReviewTravelerType === type ? 'bg-amber-50 border-amber-400 text-amber-800' : 'bg-white border-stone-200 text-stone-500'
                              }`}
                            >{t(`destination_detail.traveler_${type.toLowerCase()}`)}</button>
                          ))}
                        </div>
                      </div>
                      <div className="relative">
                        <textarea
                          placeholder={t('destination_detail.review_placeholder')}
                          value={newReviewText}
                          onChange={(e) => setNewReviewText(e.target.value)}
                          rows={3}
                          maxLength={500}
                          className="w-full bg-stone-50 border border-stone-200 text-[12px] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none text-stone-700 placeholder:text-stone-300 leading-relaxed"
                        />
                        <span className="absolute bottom-3 right-4 text-[9px] text-stone-300 font-mono">{newReviewText.length}/500</span>
                      </div>
                      {reviewError && (<div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2"><span className="text-red-500 text-sm">⚠️</span><p className="text-[11px] text-red-600">{reviewError}</p></div>)}
                      {reviewSubmitted && (<div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2"><span className="text-green-500 text-sm">✅</span><p className="text-[11px] text-green-700">{t('destination_detail.review_published')}</p></div>)}
                      <button
                        onClick={handleSubmitReview}
                        disabled={!newReviewText.trim() || submittingReview}
                        className="w-full py-2.5 bg-[#1c1a17] text-white text-[11px] font-mono font-bold uppercase tracking-widest rounded-xl hover:bg-gold-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {submittingReview ? `✦ ${t('destination_detail.publishing')}` : `✦ ${t('destination_detail.publish_review')}`}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Review Cards grid ── */}
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <p className="text-2xl mb-2">🔍</p>
                  <p className="text-sm font-medium">{t('destination_detail.no_reviews_yet')}</p>
                  <p className="text-[11px] mt-1">{t('destination_detail.be_first_experience')}</p>
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
                              <span>{t('destination_detail.helpful')} ({likeCount})</span>
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
                        {t('destination_detail.load_more_reviews_btn')} ({filteredReviews.length - visibleReviews} {t('destination_detail.remaining')})
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

          {/* RIGHT 4-COLUMN AUXILIARY STICKY PANEL */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 16. AI LIVE JOURNEY MODE (Signature travel companion) */}
            <div className="sticky top-22 z-20 bg-royal-950 text-white rounded-3xl p-5 border border-white/10 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-gold-400 animate-ping" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-gold-300 font-bold">{t('destination_detail.journey_assistant')}</span>
                </div>
                <span className="text-[9px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full text-gold-200 font-bold">{t('destination_detail.live_journey')}</span>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-[9px] text-white/50 font-mono tracking-wider">{t('destination_detail.exploring_now')}</span>
                <h4 className="font-display text-xl text-white tracking-tight">{destination.name}</h4>
              </div>

              {/* Live Context metrics strip */}
              <div className="grid grid-cols-3 gap-2 py-1">
                <div className="bg-white/5 p-2 rounded-xl text-center">
                  <span className="block text-[8px] font-mono text-white/40 uppercase">{t('destination_detail.time')}</span>
                  <span className="text-xs font-bold text-gold-300 font-mono mt-0.5 block">{currentAssistantTime}</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl text-center">
                  <span className="block text-[8px] font-mono text-white/40 uppercase">{t('destination_detail.weather')}</span>
                  <span className="text-xs font-bold text-gold-300 font-mono mt-0.5 block">{destination.weather.temp} ☀</span>
                </div>
                <div className="bg-white/5 p-2 rounded-xl text-center">
                  <span className="block text-[8px] font-mono text-white/40 uppercase">{t('destination_detail.crowd')}</span>
                  <span className={`text-xs font-bold font-mono mt-0.5 block ${liveCrowdLevel === 'High' ? 'text-red-400' : 'text-emerald-400'}`}>
                    {liveCrowdLevel === 'High' ? t('destination_detail.crowd_high') : liveCrowdLevel === 'Moderate' ? t('destination_detail.crowd_moderate') : t('destination_detail.crowd_low')}
                  </span>
                </div>
              </div>

              {/* Dynamic recommendation list */}
              <div className="space-y-2.5 text-left pt-1">
                <span className="text-[9px] font-mono text-gold-400/90 tracking-widest uppercase font-bold block">{t('destination_detail.live_recommendations')}</span>
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
                      <span className="text-[9px] font-mono text-white/40">{t('destination_detail.expected_completion')} {rec.time}</span>
                    </div>
                    <ChevronRight className={`h-4 w-4 text-gold-400 shrink-0 transform transition-transform ${selectedJourneyActionIdx === i ? 'rotate-90' : ''}`} />
                  </div>
                ))}
              </div>

              {/* <button 
                onClick={() => setShowTicketModal(true)}
                className="w-full py-2.5 bg-gold-400 hover:bg-gold-500 text-royal-950 text-xs font-mono font-bold uppercase tracking-widest rounded-xl transition-colors shadow-md hidden"
              >
                BOOK LIVE COMPANION SESSION
              </button> */}
            </div>

            {/* 11. TOURISM ECOSYSTEM INTENT RAILS */}
            <div id="ecosystem-section" className="bg-white border border-stone-200/50 rounded-3xl p-5 shadow-sm space-y-4 text-left scroll-mt-20">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center space-x-1.5">
                  <Award className="h-4 w-4 text-gold-600" />
                  <span className="text-xs font-manrope font-bold text-stone-900">{t('destination_detail.ecosystem_intent_rail')}</span>
                </div>
                <span className="text-[9px] font-mono bg-gold-50 text-gold-700 px-2 py-0.5 rounded-full font-bold">{t('destination_detail.monetized_partners')}</span>
              </div>

              {/* Horiz intent slider */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-2 border-b border-stone-100">
                {[
                  { id: 'stay', label: t('destination_detail.tab_stay') },
                  { id: 'eat', label: t('destination_detail.tab_culinary') },
                  { id: 'experience', label: t('destination_detail.tab_vibe') },
                  { id: 'shop', label: t('destination_detail.tab_shop') },
                  { id: 'guide', label: t('destination_detail.tab_guide') }
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
                  <p className="text-xs text-stone-500 italic py-4 text-center">{t('destination_detail.no_partner_found')}</p>
                ) : (
                  activeEcosystemPartners.map(partner => (
                    <div
                      key={partner.id}
                      onClick={() => setSelectedPartner(partner)}
                      className="group border border-stone-100 p-2.5 rounded-xl flex space-x-3 hover:border-gold-300 hover:bg-stone-50/50 transition-all duration-300 text-left cursor-pointer"
                    >
                      <Image src={partner.image} alt={partner.name} className="h-14 w-14 rounded-lg object-cover border shrink-0 bg-stone-100" width={56} height={56} />
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



            {/* 13. SIMILAR DESTINATIONS */}
            <div className="bg-white border border-stone-200/50 rounded-3xl p-5 shadow-sm text-left space-y-4">
              <span className="text-[9px] font-mono font-bold tracking-widest text-gold-700 uppercase block leading-none">{t('destination_detail.people_also_explored')}</span>
              
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
                    <Image src={similar.images[0]?.url || ''} alt={similar.name} className="h-12 w-16 rounded-xl object-cover shrink-0 bg-stone-100" width={64} height={48} />
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
              {t('destination_detail.traveler_stories')}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {getTravelerStories().map(story => (
              <div key={story.id} className="bg-white border border-stone-200/40 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between group cursor-pointer hover:shadow-md transition-shadow">
                {/* Visual image box */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-royal-950">
                  <Image src={story.img} alt={t('destination_detail.story_image_alt', { name: story.user })} sizes="(max-width: 640px) 100vw, 33vw" className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" fill />
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
                      <Image src={story.avatar} alt={story.user} className="h-7 w-7 rounded-full object-cover border" width={28} height={28} />
                      <div className="text-left">
                        <span className="block text-[10px] font-bold text-stone-900 leading-none">{story.user}</span>
                        <span className="block text-[8px] font-mono text-stone-500 leading-none mt-0.5">{t('destination_detail.story_traveler_label', { location: story.location })}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-gold-700 bg-gold-50 px-2 py-0.5 rounded-md font-bold">{t('destination_detail.ai_highlight')}</span>
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
                <span className="text-[8px] font-mono tracking-widest text-gold-300 font-bold uppercase leading-none">{t('destination_detail.admission_pass')}</span>
                <h3 className="font-display text-lg text-white mt-1 leading-none">{destination.name}</h3>
              </div>
              <button 
                onClick={() => {
                  setShowTicketModal(false);
                  setTicketBooked(false);
                }}
                className="text-white/60 hover:text-white font-mono text-xs cursor-pointer"
              >
                {t('destination_detail.close_btn')}
              </button>
            </div>

            {/* Modal Body */}
            {ticketBooked ? (
              <div className="p-6 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow border border-emerald-300 animate-bounce">
                  <Check className="h-6 w-6" />
                </div>
                <h4 className="font-manrope font-bold text-base text-stone-900">{t('destination_detail.pass_booked')}</h4>
                <p className="text-xs text-stone-600 font-light max-w-xs mx-auto">
                  {t('destination_detail.pass_pdf_synced')}
                </p>
                <div className="p-3 bg-stone-50 rounded-xl border border-dashed font-mono text-[10px] text-left text-stone-700 max-w-xs mx-auto space-y-1">
                  <span className="block font-bold border-b pb-1 mb-1">{t('destination_detail.pass_summary')}</span>
                  <span>{t('destination_detail.pass_destination')}: {destination.name}</span>
                  <span className="block">{t('destination_detail.pass_quantity')}: {ticketQuantity} x {ticketCategory.toUpperCase()}</span>
                  <span className="block font-bold text-gold-700">{t('destination_detail.pass_total')}: IDR {calculatePrice()}</span>
                  <span className="block text-[8px] text-stone-400">{t('destination_detail.pass_security_hash')}: {Math.random().toString(16).substr(2, 8).toUpperCase()}</span>
                </div>
                <button 
                  onClick={() => {
                    setShowTicketModal(false);
                    setTicketBooked(false);
                  }}
                  className="w-full bg-royal-950 hover:bg-gold-500 text-white hover:text-royal-950 font-mono text-xs uppercase tracking-widest py-3 rounded-full font-bold transition-colors"
                >
                  {t('destination_detail.dismiss_view')}
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-5">
                
                {/* Category selector */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">{t('destination_detail.select_category')}</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => setTicketCategory('domestic')}
                      className={`p-3 border rounded-xl text-xs text-left flex flex-col justify-between transition-all ${
                        ticketCategory === 'domestic' 
                          ? 'border-gold-500 bg-gold-50/50 text-[#1c1a17] font-bold' 
                          : 'border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-[8px] font-mono tracking-widest text-stone-500 uppercase">{t('destination_detail.domestic')}</span>
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
                      <span className="text-[8px] font-mono tracking-widest text-stone-500 uppercase">{t('destination_detail.international')}</span>
                      <span className="mt-2 text-stone-900 font-bold">IDR {foreignTicketPrice}</span>
                    </button>
                  </div>
                </div>

                {/* Quantity input */}
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-stone-500 uppercase tracking-wider block">{t('destination_detail.quantity_tickets')}</span>
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
                    <span className="text-[8px] font-mono text-stone-500 uppercase tracking-wider">{t('destination_detail.estimated_price')}</span>
                    <span className="block font-display text-lg text-gold-700 font-extrabold mt-0.5">IDR {calculatePrice()}</span>
                  </div>
                  <button 
                    onClick={() => setTicketBooked(true)}
                    className="bg-royal-950 hover:bg-gold-500 text-white hover:text-royal-950 font-mono text-xs uppercase tracking-widest py-3 px-6 rounded-full font-bold transition-all shadow-md active:scale-97"
                  >
                    {t('destination_detail.confirm_book')}
                  </button>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-left flex items-start space-x-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-700 font-light leading-relaxed">
                    {t('destination_detail.royal_pass_policy')}
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
                    {t('destination_detail.call')}
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
                  {t('destination_detail.get_directions')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SHARE MODAL ── */}
      {showShareModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowShareModal(false)}
        >
          <div className="absolute inset-0 bg-royal-950/70 backdrop-blur-sm" />
          <div
            className="relative w-full sm:max-w-sm overflow-hidden shadow-2xl animate-fade-in rounded-t-3xl sm:rounded-3xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Dark header — sesuai tema */}
            <div className="bg-royal-950 px-6 pt-6 pb-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-mono tracking-[0.18em] uppercase text-gold-400 font-bold mb-1">Bagikan Destinasi</p>
                  <h3 className="font-display text-xl text-white leading-tight">{destination.name}</h3>
                  <p className="text-xs text-white/50 mt-1">{destination.location}</p>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors mt-0.5"
                >
                  <X className="h-4 w-4 text-white/60" />
                </button>
              </div>

              {/* Share option icons row — compact */}
              <div className="flex items-center gap-3 mt-5">
                {[
                  {
                    label: 'WhatsApp',
                    bg: 'bg-[#25D366]',
                    href: `https://wa.me/?text=${encodeURIComponent(`Lihat destinasi keren ini: ${destination.name} di Yogyakarta! ${typeof window !== 'undefined' ? window.location.href : ''}`)}`,
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                    ),
                  },
                  {
                    label: 'Instagram',
                    bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
                    href: 'https://www.instagram.com/',
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                      </svg>
                    ),
                  },
                  {
                    label: 'X',
                    bg: 'bg-black',
                    href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Destinasi keren di Yogyakarta: ${destination.name} ✨`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`,
                    icon: (
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.258 5.63 5.906-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    ),
                  },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowShareModal(false)}
                    className="flex flex-col items-center gap-2 flex-1"
                  >
                    <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform`}>
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-mono text-white/60">{item.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Bottom: copy link — light panel */}
            <div className="bg-[#F7F3EE] px-6 py-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-royal-700/50 mb-3">atau salin tautan</p>
              <div className="flex items-center gap-3 bg-white border border-gold-200/60 rounded-2xl px-4 py-3 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-stone-500 truncate">
                    {typeof window !== 'undefined' ? window.location.href : ''}
                  </p>
                </div>
                <button
                  onClick={handleCopyLink}
                  className={`shrink-0 px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all ${
                    copied
                      ? 'bg-emerald-500 text-white'
                      : 'bg-royal-950 text-gold-300 hover:bg-gold-500 hover:text-royal-950'
                  }`}
                >
                  {copied ? '✓ Tersalin' : 'Salin'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
