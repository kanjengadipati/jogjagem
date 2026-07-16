'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import DestinationDetail from '@/components/DestinationDetail';
import { Destination } from '@/types';
import { destinations } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LocationProvider } from '@/contexts/LocationContext';

function mapApiToDestination(raw: any): Destination {
  return {
    id: raw.id || raw.ExternalID || '',
    name: raw.name || raw.Name || '',
    tagline: raw.tagline || raw.Tagline || '',
    category: raw.category || raw.Category || '',
    location: raw.location || raw.Location || '',
    subRegion: raw.sub_region || raw.SubRegion || raw.subRegion || '',
    images: raw.images || raw.Images || [],
    rating: raw.rating || raw.Rating || 0,
    reviewCount: raw.review_count || raw.ReviewCount || raw.reviewCount || 0,
    description: raw.description || raw.Description || '',
    story: raw.story || raw.Story || '',
    ticketPrice: raw.ticket_price || raw.TicketPrice || raw.ticketPrice || '',
    openingHours: raw.opening_hours || raw.OpeningHours || raw.openingHours || '',
    facilities: raw.facilities || raw.Facilities || [],
    travelTips: raw.travel_tips || raw.TravelTips || raw.travelTips || [],
    bestTime: raw.best_time || raw.BestTime || raw.bestTime || '',
    weather: raw.weather || raw.Weather || { temp: '', condition: '', status: '' },
    latitude: raw.latitude || raw.Latitude || raw.latitude || 0,
    longitude: raw.longitude || raw.Longitude || raw.longitude || 0,
    reviews: raw.reviews || raw.Reviews || [],
    partners: raw.partners || raw.Partners || [],
    faqs: raw.faqs || raw.Faqs || raw.FAQs || [],
    googleMapsUrl: raw.google_maps_url || raw.GoogleMapsURL || raw.googleMapsUrl || '',
    googleReviewCount: raw.google_review_count || raw.GoogleReviewCount || raw.googleReviewCount || 0,
    seoTitle: raw.seo_title || raw.SeoTitle || raw.seoTitle || '',
    seoKeywords: raw.seo_keywords || raw.SeoKeywords || raw.seoKeywords || '',
    seoDescription: raw.seo_description || raw.SeoDescription || raw.seoDescription || '',
    ogImageUrl: raw.og_image_url || raw.OgImageUrl || raw.ogImageUrl || '',
  };
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export default function DestinationDetailClient({ slug }: { slug: string[] }) {
  const router = useRouter();
  const destinationId = slug.join('/');
  const [destination, setDestination] = useState<Destination | null>(null);
  const [allDestinations, setAllDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fetchDestination = async () => {
      setLoading(true);
      const slugStr = slug.join('/');

      const allRes = await destinations.getAll();
      if (allRes.status === 'success' && Array.isArray(allRes.data)) {
        const mapped = allRes.data.map(mapApiToDestination);
        setAllDestinations(mapped);
        const found = mapped.find(d => toSlug(d.name) === slugStr || d.id === slugStr);
        if (found) {
          setDestination(found);
          setLoading(false);
          return;
        }
      }

      try {
        const res = await destinations.getById(slugStr);
        if (res.status === 'success' && res.data) {
          setDestination(mapApiToDestination(res.data));
          setLoading(false);
          return;
        }
      } catch {}

      setError('Destination not found');
      setLoading(false);
    };
    fetchDestination();
  }, [destinationId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('explore_jogja_saved_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Handle both Destination[] (full objects) and string[] (legacy IDs)
          const ids = parsed.map((item: unknown) =>
            typeof item === 'string' ? item : (item as { id: string })?.id ?? ''
          ).filter(Boolean);
          setSavedDestinationIds(ids);
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    // Don't write from detail page — App.tsx owns the full object format
    // Only update the IDs list; App.tsx will reconcile on next load
  }, [savedDestinationIds, hydrated]);

  const handleToggleSave = (dest: Destination) => {
    setSavedDestinationIds(prev => {
      const exists = prev.includes(dest.id);
      let newIds: string[];
      if (exists) {
        newIds = prev.filter(id => id !== dest.id);
      } else {
        newIds = [...prev, dest.id];
      }
      // Update localStorage — read existing full objects and patch
      try {
        const saved = localStorage.getItem('explore_jogja_saved_v1');
        const existing: Destination[] = saved ? JSON.parse(saved) : [];
        const fullObjects = Array.isArray(existing) && existing.length > 0 && typeof existing[0] === 'object'
          ? existing
          : [];
        if (exists) {
          // Remove
          localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(fullObjects.filter(d => d.id !== dest.id)));
        } else {
          // Add full object
          localStorage.setItem('explore_jogja_saved_v1', JSON.stringify([...fullObjects.filter(d => d.id !== dest.id), dest]));
        }
      } catch {}
      return newIds;
    });
  };

  const isSaved = (id: string) => savedDestinationIds.includes(id);

  if (loading) {
    return (
      <AuthProvider>
      <LocationProvider>
        <div className="min-h-screen bg-[#faf9f6] flex flex-col">
          <Header activeTab="discover" setActiveTab={() => router.push('/')} savedCount={savedDestinationIds.length} isOverHero={false} onOpenAuth={() => {}} />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
          </div>
        </div>
      </LocationProvider>
      </AuthProvider>
    );
  }

  if (error || !destination) {
    return (
      <AuthProvider>
      <LocationProvider>
        <div className="min-h-screen bg-[#faf9f6] flex flex-col">
          <Header activeTab="discover" setActiveTab={() => router.push('/')} savedCount={savedDestinationIds.length} isOverHero={false} onOpenAuth={() => {}} />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-3" />
              <p className="text-royal-950 font-medium">{error || 'Destination not found'}</p>
              <button onClick={() => router.push('/destinations')} className="mt-4 text-sm text-gold-600 hover:text-gold-700 underline">
                Browse all destinations
              </button>
            </div>
          </div>
        </div>
      </LocationProvider>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
    <LocationProvider>
      <div className="min-h-screen bg-[#faf9f6] flex flex-col">
        <Header activeTab="discover" setActiveTab={() => router.push('/')} savedCount={savedDestinationIds.length} isOverHero={false} />
        <DestinationDetail
          destination={destination}
          allDestinations={allDestinations}
          onBack={() => router.back()}
          onToggleSave={handleToggleSave}
          isSaved={isSaved(destination.id)}
        />
      </div>
    </LocationProvider>
    </AuthProvider>
  );
}
