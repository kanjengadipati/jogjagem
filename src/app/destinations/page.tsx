'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import DestinationCard, { isLandscape } from '@/components/DestinationCard';
import DestinationDetail from '@/components/DestinationDetail';
import CategoryLinks from '@/components/CategoryLinks';
import { DESTINATIONS } from '@/data';
import { Destination } from '@/types';
import { Search, ArrowLeft } from 'lucide-react';

function DestinationsPageInner() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('explore_jogja_saved_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedDestinations(parsed.map((item: any) => DESTINATIONS.find(d => d.id === item.id)).filter(Boolean));
      }
    } catch (e) {
      console.error("Local storage read failed:", e);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem('explore_jogja_saved_v1', JSON.stringify(savedDestinations));
    } catch (e) {
      console.error("Local storage write failed:", e);
    }
  }, [savedDestinations, hydrated]);

  const handleToggleSave = (dest: Destination) => {
    setSavedDestinations((prev) => {
      const exists = prev.some(d => d.id === dest.id);
      if (exists) return prev.filter(d => d.id !== dest.id);
      return [...prev, dest];
    });
  };

  const isSaved = (id: string) => savedDestinations.some(d => d.id === id);

  const handleExploreDestination = (dest: Destination) => {
    setSelectedDestination(dest);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredDestinations = DESTINATIONS.filter((dest) => {
    const matchesCategory = selectedCategory ? dest.category === selectedCategory : true;
    const matchesSearch = searchQuery
      ? dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  const resultCount = filteredDestinations.length;
  const totalDestinations = DESTINATIONS.length;

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col">
      <Header
        activeTab="discover"
        setActiveTab={() => router.push('/')}
        savedCount={savedDestinations.length}
        isOverHero={false}
      />

      {selectedDestination ? (
        <DestinationDetail
          destination={selectedDestination}
          onBack={() => setSelectedDestination(null)}
          isSaved={isSaved(selectedDestination.id)}
          onToggleSave={handleToggleSave}
        />
      ) : (
        <main className="flex-1">
          {/* Page Header */}
          <section className="bg-royal-950 pt-28 pb-12 sm:pt-32 sm:pb-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <button
                onClick={() => router.push('/')}
                className="flex items-center space-x-1.5 text-gold-400/80 hover:text-gold-300 transition-colors mb-6 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                <span className="text-sm font-medium">Back to Explore</span>
              </button>

              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <span className="font-sans text-[10px] uppercase tracking-[0.08em] text-gold-400 font-semibold mb-1 block">
                    ALL DESTINATIONS
                  </span>
                  <h1 className="font-manrope text-3xl sm:text-4xl font-bold tracking-tight text-white">
                    Explore Every Corner
                  </h1>
                  <p className="text-sm text-white/60 mt-2">
                    {totalDestinations} curated destinations across Yogyakarta
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search destinations..."
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold-400/50 focus:bg-white/10 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Category Filter */}
          <CategoryLinks
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          {/* Results Info */}
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-4">
            <p className="text-xs text-stone-500">
              {resultCount === totalDestinations
                ? `Showing all ${totalDestinations} destinations`
                : `${resultCount} destination${resultCount !== 1 ? 's' : ''} found`}
            </p>
          </div>

          {/* Destinations Grid */}
          <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            {filteredDestinations.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-gold-200 rounded-3xl bg-white">
                <Search className="h-10 w-10 text-gold-300 mx-auto mb-4" />
                <span className="block text-base font-semibold text-royal-950 mb-1">No destinations found</span>
                <span className="block text-sm text-stone-500">Try a different search or category</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDestinations.map((dest) => (
                  <DestinationCard
                    key={dest.id}
                    destination={dest}
                    onExplore={handleExploreDestination}
                    onToggleSave={handleToggleSave}
                    isSaved={isSaved(dest.id)}
                    className={isLandscape(dest.id) ? 'sm:col-span-2' : ''}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* Footer */}
      <footer className="bg-royal-950 border-t border-royal-800 py-8 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-white/40">
            &copy; 2026 Explore Jogja. Crafted with care for Yogyakarta.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function DestinationsPage() {
  return (
    <AuthProvider>
      <DestinationsPageInner />
    </AuthProvider>
  );
}
