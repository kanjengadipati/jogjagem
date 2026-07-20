export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  travelerType?: 'Solo' | 'Couple' | 'Family' | 'Friends';
}

export interface EcosystemPartner {
  id: string;
  name: string;
  category: 'hotel' | 'restaurant' | 'cafe' | 'guide' | 'souvenir' | 'rental' | 'agent' | 'transport';
  image: string;
  rating: number;
  price: string;
  distance: string;
  description: string;
  address: string;
  promotion?: string;
  phone?: string;
  coordinates: { lat: number; lng: number };
}

export interface FAQ {
  q: string;
  a: string;
}

export interface WeatherInfo {
  temp: string;
  condition: string;
  status: string;
}

export interface Destination {
  id: string;
  name: string;
  tagline: string;
  category: string; // 'nature' | 'heritage' | 'beach' | 'adventure' | 'culinary' | 'family' | 'hidden-gem'
  location: string;
  subRegion: string; // Sleman, Bantul, Yogyakarta, Kulon Progo, Gunungkidul
  images: { url: string; credit: string }[];
  rating: number;
  reviewCount: number;
  description: string;
  story: string;
  ticketPrice: string;
  openingHours: string;
  facilities: string[];
  travelTips: string[];
  bestTime: string;
  weather: WeatherInfo;
  latitude: number;
  longitude: number;
  reviews: Review[];
  partners: EcosystemPartner[];
  faqs: FAQ[];
  googleMapsUrl?: string;
  googleReviewCount?: number;
  seoTitle?: string;
  seoKeywords?: string;
  seoDescription?: string;
  ogImageUrl?: string;
  badge?: string;
  badges?: string[];
}

export interface Festival {
  id: string;
  name: string;
  date: string;
  location: string;
  image: string;
  description: string;
  highlights: string[];
  category: string;
  badge?: string;
  badges?: string[];
}

export interface TripDay {
  dayNumber: number;
  destinations: Destination[];
  notes?: string;
}

export interface TripPlan {
  id: string;
  title: string;
  startDate: string;
  durationDays: number;
  days: TripDay[];
  notes?: string;
}
