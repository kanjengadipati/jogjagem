'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import DestinationDetail from '@/components/DestinationDetail';
import { Destination } from '@/types';
import { destinations } from '@/lib/api';
import { Loader2, AlertCircle } from 'lucide-react';

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
  };
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function DestinationDetailPageInner({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const destinationId = slug.join('/');
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedDestinationIds, setSavedDestinationIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fetchDestination = async () => {
      setLoading(true);
      try {
        const res = await destinations.getById(destinationId);
        if (res.status === 'success' && res.data) {
          const dest = mapApiToDestination(res.data);
          const expectedSlug = toSlug(dest.name);
          const currentSlug = slug.join('/');
          if (expectedSlug && currentSlug !== expectedSlug && currentSlug !== dest.id) {
            router.replace(`/destinations/${expectedSlug}`, { scroll: false });
          }
          setDestination(dest);
        } else {
          throw new Error('not found by id');
        }
      } catch {
        // Fallback: fetch all destinations and find by slug
        try {
          const allRes = await destinations.getAll();
          if (allRes.status === 'success' && Array.isArray(allRes.data)) {
            const slugStr = slug.join('/');
            const found = allRes.data.find((d: any) => {
              const name = d.name || d.Name || '';
              return toSlug(name) === slugStr || (d.id || d.ExternalID) === slugStr;
            });
            if (found) {
              const dest = mapApiToDestination(found);
              const expectedSlug = toSlug(dest.name);
              const currentSlug = slug.join('/');
              if (expectedSlug && currentSlug !== expectedSlug && currentSlug !== dest.id) {
                router.replace(`/destinations/${expectedSlug}`, { scroll: false });
              }
              setDestination(dest);
              setLoading(false);
              return;
            }
          }
          setError('Destination not found');
        } catch {
          setError('Failed to load destination');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDestination();
  }, [destinationId, slug, router]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('explore_jogja_saved_v1');
      if (saved) {
        setSavedDestinationIds(JSON.parse(saved));
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(savedDestinationIds));
    } catch {}
  }, [savedDestinationIds, hydrated]);

  const handleToggleSave = (dest: Destination) => {
    setSavedDestinationIds(prev => {
      const exists = prev.includes(dest.id);
      if (exists) return prev.filter(id => id !== dest.id);
      return [...prev, dest.id];
    });
  };

  const isSaved = (id: string) => savedDestinationIds.includes(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col">
        <Header activeTab="discover" setActiveTab={() => router.push('/')} savedCount={savedDestinationIds.length} isOverHero={false} />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-gold-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="min-h-screen bg-[#faf9f6] flex flex-col">
        <Header activeTab="discover" setActiveTab={() => router.push('/')} savedCount={savedDestinationIds.length} isOverHero={false} />
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
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <Header activeTab="discover" setActiveTab={() => router.push('/')} savedCount={savedDestinationIds.length} isOverHero={false} />
      <DestinationDetail
        destination={destination}
        onBack={() => router.back()}
        onToggleSave={handleToggleSave}
        isSaved={isSaved(destination.id)}
      />
    </div>
  );
}

export default function DestinationDetailPage({ params }: { params: Promise<{ slug: string[] }> }) {
  return (
    <AuthProvider>
      <DestinationDetailPageInner params={params} />
    </AuthProvider>
  );
}
