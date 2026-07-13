import React, { useState } from 'react';
import { 
  ArrowLeft, Heart, Share2, Star, Clock, Ticket, Sparkles, 
  MapPin, ShieldAlert, CheckCircle, HelpCircle, Thermometer,
  CloudSun, Phone, Tag, Hotel, Coffee, Utensils, Compass, Footprints, MessageSquare, Map
} from 'lucide-react';
import { Destination, EcosystemPartner } from '../types';

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
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'info' | 'ecosystem' | 'reviews' | 'faqs'>('info');
  const [partnerFilter, setPartnerFilter] = useState<'all' | 'hotel' | 'restaurant' | 'cafe' | 'guide' | 'souvenir'>('all');
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPartners = destination.partners.filter(p => {
    if (partnerFilter === 'all') return true;
    if (partnerFilter === 'restaurant' && p.category === 'restaurant') return true;
    if (partnerFilter === 'cafe' && p.category === 'cafe') return true;
    return p.category === partnerFilter;
  });

  return (
    <div id={`destination-detail-page-${destination.id}`} className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      {/* Top action bar */}
      <div className="flex items-center justify-between border-b border-gold-100 pb-5">
        <button
          id="detail-back-btn"
          onClick={onBack}
          className="group flex items-center space-x-2 text-sm font-semibold text-royal-950 hover:text-gold-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Yogyakarta Discovery</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            id="detail-save-btn"
            onClick={() => onToggleSave(destination)}
            className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
              isSaved
                ? 'bg-gold-500/20 border-gold-400 text-gold-600'
                : 'border-gold-100 bg-white text-royal-950/70 hover:bg-gold-50 hover:text-royal-950'
            }`}
          >
            <Heart className={`h-5 w-5 ${isSaved ? 'fill-gold-600 text-gold-600' : ''}`} />
          </button>
          
          <button
            id="detail-share-btn"
            onClick={handleShare}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold-100 bg-white text-royal-950/70 hover:bg-gold-50 hover:text-royal-950 transition-colors"
          >
            <Share2 className="h-5 w-5" />
          </button>
          {copied && (
            <span className="text-xs font-mono text-gold-700 animate-fade-in bg-gold-50 px-2 py-1 rounded-md border border-gold-200">
              Copied Link!
            </span>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left column: Visuals & Core Story */}
        <div className="lg:col-span-7 space-y-8">
          {/* Main Hero Photo Gallery */}
          <div className="relative overflow-hidden rounded-3xl border border-gold-100 shadow-lg bg-royal-950 aspect-16/10">
            <img
              src={destination.images[activeImageIdx]}
              alt={destination.name}
              className="h-full w-full object-cover object-center transition-all duration-500"
              referrerPolicy="no-referrer"
            />
            
            {/* Gallery Thumbnail Strips */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-center space-x-2.5">
              {destination.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative h-14 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                    idx === activeImageIdx ? 'border-gold-400 scale-105 shadow-md' : 'border-white/40 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="thumbnail" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-gold-100 px-3 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.08em] text-gold-700">
                {destination.category}
              </span>
              <span className="flex items-center space-x-1 font-mono text-xs text-royal-700/80">
                <MapPin className="h-3.5 w-3.5 text-gold-600" />
                <span>{destination.location}</span>
              </span>
            </div>
            
            <h1 className="font-manrope text-3xl font-bold tracking-tight text-royal-950 sm:text-4xl leading-tight">
              {destination.name}
            </h1>
            <p className="font-display italic text-lg text-gold-700/90 font-medium">
              "{destination.tagline}"
            </p>
          </div>

          {/* Authentic Mythology & Story Section */}
          <div className="rounded-3xl bg-gold-50/40 border border-gold-100/50 p-6 sm:p-8 space-y-4">
            <div className="flex items-center space-x-2.5">
              <Sparkles className="h-5 w-5 text-gold-600" />
              <h3 className="font-manrope text-lg font-bold text-royal-950">
                The Heritage & Mythology
              </h3>
            </div>
            <p className="font-display italic text-royal-950/90 leading-relaxed text-sm bg-white/40 border-l-4 border-gold-400 pl-4 py-1">
              "{destination.story}"
            </p>
          </div>

          {/* Overview Narrative */}
          <div className="space-y-3">
            <h3 className="font-manrope text-xl font-bold text-royal-950">
              Overview
            </h3>
            <p className="text-royal-700 leading-relaxed text-sm font-light">
              {destination.description}
            </p>
          </div>

          {/* Travel Tips with custom bullet points */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Footprints className="h-5 w-5 text-gold-600" />
              <h3 className="font-manrope text-lg font-bold text-royal-950">
                Practical Travel Tips
              </h3>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-1">
              {destination.travelTips.map((tip, idx) => (
                <li key={idx} className="flex items-start space-x-3 text-xs text-royal-700">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-100/70 text-gold-700 font-mono text-[10px] font-bold">
                    {idx + 1}
                  </div>
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right column: Logistics, AI Advisor & Ecosystem Partners */}
        <div className="lg:col-span-5 space-y-6">
          {/* Dynamic Weather & AI Advisor Insight */}
          <div className="rounded-3xl bg-royal-950 text-white p-6 border border-royal-900 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CloudSun className="h-5 w-5 text-gold-400" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-gold-300">Live Weather Advice</span>
              </div>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-white">Yogyakarta</span>
            </div>

            <div className="flex items-baseline space-x-2">
              <span className="font-mono text-3xl font-bold text-gold-300">{destination.weather.temp}</span>
              <span className="text-sm text-gold-100/80">{destination.weather.condition}</span>
            </div>

            {/* Smart local advice quote */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center space-x-2 text-gold-400 text-xs mb-1">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="font-semibold uppercase tracking-wider text-[9px] font-mono">Knowledgeable Local Friend</span>
              </div>
              <p className="text-xs italic text-gold-50/90 leading-relaxed font-light">
                "{destination.weather.status} The morning air brings fresh volcanic breeze. Try arriving early for stunning mountain vistas!"
              </p>
            </div>
          </div>

          {/* Quick info widgets */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gold-100 bg-white p-4 flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-gold-600 mb-2">
                <Ticket className="h-4 w-4" />
                <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Admission Pass</span>
              </div>
              <p className="text-xs font-bold text-royal-950 line-clamp-2">
                {destination.ticketPrice}
              </p>
            </div>
            
            <div className="rounded-2xl border border-gold-100 bg-white p-4 flex flex-col justify-between">
              <div className="flex items-center space-x-2 text-gold-600 mb-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">Opening Hours</span>
              </div>
              <p className="text-xs font-bold text-royal-950">
                {destination.openingHours}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gold-100 flex space-x-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === 'info' ? 'border-gold-600 text-gold-800' : 'border-transparent text-royal-700/60 hover:text-royal-950'
              }`}
            >
              Logistics
            </button>
            <button
              id="detail-partners-tab-trigger"
              onClick={() => setActiveTab('ecosystem')}
              className={`pb-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === 'ecosystem' ? 'border-gold-600 text-gold-800' : 'border-transparent text-royal-700/60 hover:text-royal-950'
              }`}
            >
              Nearby Partners ({destination.partners.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-xs font-semibold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === 'reviews' ? 'border-gold-600 text-gold-800' : 'border-transparent text-royal-700/60 hover:text-royal-950'
              }`}
            >
              Stories ({destination.reviews.length})
            </button>
          </div>

          {/* Tab Content 1: Logistics & Map */}
          {activeTab === 'info' && (
            <div className="space-y-4 animate-fade-in">
              <div className="rounded-2xl border border-gold-100 bg-white p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-royal-950">Best Time to Visit</span>
                  <span className="text-xs text-gold-700 font-mono font-medium">{destination.bestTime}</span>
                </div>
                
                <div className="border-t border-gold-50 pt-3">
                  <span className="text-xs font-bold text-royal-950 block mb-2">Available Facilities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {destination.facilities.map((fac, idx) => (
                      <span key={idx} className="rounded-full bg-gold-50 border border-gold-100/40 px-2.5 py-1 text-[10px] text-royal-950 font-light">
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contextual Interactive Map Mini-Box */}
              <div className="rounded-2xl border border-gold-100 overflow-hidden bg-gold-50/20 shadow-inner p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Map className="h-4 w-4 text-gold-600" />
                    <span className="text-xs font-bold text-royal-950">Contextual Tourism Route Map</span>
                  </div>
                  <span className="text-[10px] font-mono text-royal-700/60">GPS Ready</span>
                </div>
                {/* Visual Map Representation */}
                <div className="relative h-44 rounded-xl bg-gold-100 border border-gold-200 flex flex-col items-center justify-center text-center p-4 shadow-sm overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(#d6a147_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-20" />
                  
                  {/* Destination pin */}
                  <div className="relative z-10 flex flex-col items-center space-y-1">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-royal-950 text-gold-300 border-2 border-gold-400 shadow-lg animate-bounce">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="font-manrope font-bold text-xs text-royal-950">{destination.name}</span>
                    <span className="text-[9px] text-royal-700 bg-white/90 border border-gold-200 px-2 py-0.5 rounded-full font-mono">
                      LAT: {destination.latitude.toFixed(3)} • LNG: {destination.longitude.toFixed(3)}
                    </span>
                  </div>

                  {/* Context lines */}
                  <div className="absolute bottom-4 left-6 flex items-center space-x-1.5 bg-white/95 px-2 py-1 rounded-lg shadow-sm border border-gold-100">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-mono font-bold text-royal-950">Sultanate Core Zone</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content 2: Ecosystem Partners */}
          {activeTab === 'ecosystem' && (
            <div className="space-y-4 animate-fade-in">
              {/* Partner categorization filters */}
              <div className="flex flex-wrap gap-1.5 border-b border-gold-100/50 pb-3">
                {[
                  { id: 'all', label: 'All Partners' },
                  { id: 'hotel', label: 'Hotels' },
                  { id: 'restaurant', label: 'Culinary' },
                  { id: 'guide', label: 'Guides' },
                  { id: 'souvenir', label: 'Souvenirs' }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setPartnerFilter(filter.id as any)}
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold tracking-wider uppercase transition-colors border ${
                      partnerFilter === filter.id
                        ? 'bg-gold-800 text-gold-50 border-gold-800'
                        : 'bg-white text-royal-700/80 border-gold-100 hover:bg-gold-50'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Partners list */}
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {filteredPartners.length === 0 ? (
                  <div className="text-center py-8 text-xs text-royal-700/60 font-light border border-dashed border-gold-200 rounded-2xl bg-white">
                    No verified partner of this category nearby {destination.name}.
                  </div>
                ) : (
                  filteredPartners.map(partner => {
                    const isHotel = partner.category === 'hotel';
                    const isRest = partner.category === 'restaurant' || partner.category === 'cafe';
                    return (
                      <div
                        key={partner.id}
                        id={`partner-card-${partner.id}`}
                        className="group flex rounded-2xl border border-gold-100 bg-white p-3.5 hover:border-gold-300 hover:shadow-md transition-all duration-300"
                      >
                        {/* Partner thumbnail */}
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-royal-950 border border-gold-100">
                          <img src={partner.image} alt={partner.name} className="h-full w-full object-cover" />
                        </div>
                        
                        {/* Details */}
                        <div className="ml-3.5 flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="flex items-center space-x-1 text-[9px] font-sans font-semibold uppercase tracking-[0.08em] text-gold-700">
                                {isHotel ? <Hotel className="h-3 w-3" /> : isRest ? <Coffee className="h-3 w-3" /> : <Compass className="h-3 w-3" />}
                                <span>{partner.category}</span>
                              </span>
                              <div className="flex items-center space-x-1 text-[10px] font-semibold text-royal-950 font-mono">
                                <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                                <span>{partner.rating.toFixed(1)}</span>
                              </div>
                            </div>
                            
                            <h4 className="font-manrope font-bold text-sm text-royal-950 group-hover:text-gold-700 transition-colors duration-200 leading-snug">
                              {partner.name}
                            </h4>
                            
                            <p className="text-[10px] text-royal-700/70 font-light line-clamp-1 mt-0.5">
                              {partner.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gold-50">
                            <span className="text-[10px] font-mono text-royal-950 font-semibold">{partner.price}</span>
                            <span className="text-[9px] font-mono text-royal-700/60">{partner.distance}</span>
                          </div>

                          {/* Exclusive Sponsor deal if exists */}
                          {partner.promotion && (
                            <div className="mt-2 flex items-center space-x-1 bg-gold-50 border border-gold-200 rounded-lg px-2 py-1 text-[9px] font-mono text-gold-800 font-semibold">
                              <Tag className="h-3 w-3 text-gold-600 shrink-0 animate-pulse" />
                              <span className="truncate">{partner.promotion}</span>
                            </div>
                          )}

                          {/* Quick Phone Action */}
                          {partner.phone && (
                            <div className="mt-1 flex items-center space-x-1 text-[8px] font-mono text-royal-700/60">
                              <Phone className="h-2.5 w-2.5" />
                              <span>{partner.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Tab Content 3: Experiences & Review stories */}
          {activeTab === 'reviews' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-3.5">
                {destination.reviews.map(review => (
                  <div key={review.id} className="rounded-2xl border border-gold-100 bg-white p-4.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <img src={review.userAvatar} alt={review.userName} className="h-8 w-8 rounded-full object-cover border border-gold-200" />
                        <div>
                          <span className="block text-xs font-bold text-royal-950">{review.userName}</span>
                          <span className="block text-[9px] font-mono text-royal-700/50">{review.date}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-0.5 font-mono text-[10px] font-bold text-royal-950">
                        <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
                        <span>{review.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-xs text-royal-700 font-light leading-relaxed">
                      "{review.comment}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab Content 4: Frequently Asked Questions */}
          {activeTab === 'faqs' && destination.faqs.length > 0 ? (
            <div className="space-y-3 animate-fade-in">
              {destination.faqs.map((faq, idx) => (
                <div key={idx} className="rounded-2xl border border-gold-100 bg-white p-4 space-y-2">
                  <div className="flex items-start space-x-2.5">
                    <HelpCircle className="h-4.5 w-4.5 text-gold-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-bold text-royal-950 leading-relaxed">{faq.q}</span>
                  </div>
                  <p className="text-xs text-royal-700/80 font-light leading-relaxed pl-7">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
