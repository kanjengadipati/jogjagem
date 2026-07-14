import { Destination, Festival, EcosystemPartner } from './types';

export const PHOTO_CREDITS: Record<string, string> = {
  '1578469550956-0e16b69c6a3d': 'Eugenia Clara',
  '1621869606578-1561708a7e09': 'Wendy Winarno',
  '1566559631133-969041fc5583': 'Unsplash',
  '1543874768-af0b9c4090d5': 'Agto Nugroho',
  '1617591387509-2fcba0c80c42': 'Unsplash',
  '1602137704924-9a038cfb5253': 'Unsplash',
  '1586319826484-b7f386bf3e72': 'Camille Bismonte',
  '1646806512881-1c169782a970': 'Unsplash',
  '1625506276715-76ad63823181': 'Gading Ihsan',
  '1628047563315-d1e8b8d222b9': 'Unsplash',
  '1571607023618-c93917452ed3': 'Unsplash',
  '1596402184320-417e7178b2cd': 'Unsplash',
  '1782392487647-7fee9715d1f5': 'Unsplash',
  '1595323264810-3dd19b1be56f': 'RINZI WE',
  '1524445361389-3d2c21109015': 'Unsplash',
  '1550075099-dcd6d1513b87': 'Aaron Roth',
  '1654739595101-594699f889d4': 'Unsplash',
  '1507525428034-b723cf961d3e': 'Sean Oulashin',
  '1519046904884-53103b34b206': 'Elizeu Dias',
  '1511497584788-876760111969': 'Sergei A',
  '1581456495146-65a71b2c8e52': 'Colton Sturgeon',
  '1584810359583-96fc3448beaa': 'Unsplash',
  '1441974231531-c6227db76b6e': 'Lukasz Szmigiel',
  '1470071459604-3b5ec3a7fe05': 'v2osk',
  '1506905925346-21bda4d32df4': 'Sam Ferrara',
  '1501785888041-af3ef285b470': 'Unsplash',
  '1467489904517-075c242c2b4f': 'Unsplash',
  '1566073771259-6a8506099945': 'Bilderboken',
  '1517248135467-4c7edcad34c4': 'Jason Leung',
  '1551882547-ff40c63fe5fa': 'Valeriia Bugaiova',
  '1504674900247-0877df9cc836': 'Unsplash',
  '1571896349842-33c89424de2d': 'Unsplash',
  '1501339847302-ac426a4a7cbb': 'Unsplash',
  '1544717297-fa95b6ee9643': 'Icons8 Team',
  '1504280390367-361c6d9f38f4': 'Scott Goodwill',
  '1516450360452-9312f5e86fc7': 'Unsplash',
  '1520038410233-7141be7e6f97': 'Unsplash',
};

export function getPhotoCredit(imageUrl: string): string {
  const match = imageUrl.match(/photo-([a-f0-9-]+)/);
  if (!match) return 'Unsplash';
  const id = match[1];
  return PHOTO_CREDITS[id] || 'Unsplash';
}

export const CATEGORIES = [
  { id: 'hidden-gem', name: 'Hidden Gems', icon: 'Sparkles', description: 'Unexplored, pristine secret wonders' },
  { id: 'nature', name: 'Nature Escapes', icon: 'Leaf', description: 'Verdant forests, mountains, and parks' },
  { id: 'culinary', name: 'Culinary Legends', icon: 'Utensils', description: 'Rich sweet-savory traditional tastes' },
  { id: 'heritage', name: 'Heritage & Culture', icon: 'Castle', description: 'Ancient empires and royal palaces' },
  { id: 'adventure', name: 'Adventure', icon: 'Compass', description: 'Thrilling volcanic offroads and caves' },
  { id: 'beach', name: 'Beaches & Sunsets', icon: 'Sun', description: 'Vast golden sand cliffside coastlines' },
  { id: 'family', name: 'Family Friendly', icon: 'Users', description: 'Amusements and cultural experiences' },
  { id: 'weekend', name: 'Weekend Ideas', icon: 'CalendarDays', description: 'Short-trip custom curated escapes' }
];

export const SUB_REGIONS = [
  { id: 'yogyakarta', name: 'Yogyakarta City', description: 'The cultural heart of the Sultanate' },
  { id: 'sleman', name: 'Sleman', description: 'The majestic highlands of Mount Merapi' },
  { id: 'bantul', name: 'Bantul', description: 'Dramatic southern beaches and pine forests' },
  { id: 'kulonprogo', name: 'Kulon Progo', description: 'Breathtaking hills, waterfalls, and tea plantations' },
  { id: 'gunungkidul', name: 'Gunungkidul', description: 'Rugged limestone cliffs, caves, and pristine white-sand beaches' }
];

// Reusable mock reviews
const MOCK_REVIEWS = [
  {
    id: 'r1',
    userName: 'Sophia Laurent',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150',
    rating: 5,
    date: '2026-06-15',
    comment: 'An absolutely magical experience. The atmosphere felt like stepping back in time. The Javanese hospitality was unparalleled.'
  },
  {
    id: 'r2',
    userName: 'Yuki Tanaka',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150',
    rating: 4.8,
    date: '2026-07-02',
    comment: 'Watching the sunset over these structures is a lifetime memory. Highly recommend hiring a local certified guide!'
  },
  {
    id: 'r3',
    userName: 'Budi Santoso',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150',
    rating: 5,
    date: '2026-07-10',
    comment: 'The architectural precision is stunning. Must visit the nearby local cafes afterwards for traditional kopi klotok!'
  }
];

export const DESTINATIONS: Destination[] = [
  {
    id: 'prambanan',
    name: 'Prambanan Temple',
    tagline: 'The Pinnacle of Royal Hindu Architecture',
    category: 'heritage',
    location: 'Sleman, Yogyakarta',
    subRegion: 'Sleman',
    images: [
      'https://images.unsplash.com/photo-1578469550956-0e16b69c6a3d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1621869606578-1561708a7e09?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566559631133-969041fc5583?auto=format&fit=crop&w=1200&q=80'
    ],
    rating: 4.8,
    reviewCount: 3840,
    description: 'Built in the 9th century, Prambanan is the largest Hindu temple compound in Indonesia, dedicated to the Trimurti: the Creator (Brahma), the Preserver (Vishnu), and the Destroyer (Shiva). The towering spires reach 47 meters high, dominating the surrounding plains.',
    story: 'Legend tells of Roro Jonggrang, a beautiful princess who demanded Prince Bandung Bondowoso build 1,000 temples in a single night to win her hand. With the help of spirits, Bandung nearly succeeded, but Roro Jonggrang tricked the roosters into crowing early. Realizing the deception, Bandung cursed her to become the final, 1,000th stone statue—which sits in the Shiva chamber to this day.',
    ticketPrice: 'IDR 375,000 (Foreigners) / IDR 50,000 (Domestic)',
    openingHours: '06:30 AM - 05:00 PM Daily',
    facilities: ['Visitor Information Center', 'Audio Guides', 'Wheelchair Access', 'Spacious Parking', 'Art Souvenir Arcades', 'Traditional Restaurants', 'Clean Restrooms'],
    travelTips: [
      'Visit in the late afternoon (around 03:30 PM) to capture the beautiful golden hour light shining through the spires.',
      'Wear modest clothing out of respect for the sacred site. Sarongs are provided at the entrance.',
      'Check out the Ramayana Ballet performance scheduled on open-air stages during dry season nights.'
    ],
    bestTime: 'May to October (Dry Season, ideal for clear sunset backdrops)',
    weather: {
      temp: '28°C',
      condition: 'Sunny',
      status: 'Perfect weather for exploring Prambanan today.'
    },
    latitude: -7.7520,
    longitude: 110.4914,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'p-p1',
        name: 'The Phoenix Hotel Yogyakarta',
        category: 'hotel',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
        rating: 4.9,
        price: 'IDR 1,500,000 / night',
        distance: '14 km from Prambanan',
        description: 'A luxurious landmark colonial boutique heritage hotel with genuine royal Javanese spa therapies and a grand central courtyard pool.',
        address: 'Jl. Jend. Sudirman No.9, Yogyakarta',
        promotion: '15% Off with Royal Pass',
        phone: '+62 274 566617',
        coordinates: { lat: -7.7828, lng: 110.3671 }
      },
      {
        id: 'p-p2',
        name: 'Abhayagiri Restaurant',
        category: 'restaurant',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600',
        rating: 4.8,
        price: 'IDR 150,000 - 300,000 / person',
        distance: '3.2 km from Prambanan',
        description: 'Perched high on the hills, this fine-dining restaurant offers breathtaking panoramic sunset views of Prambanan and Mount Merapi.',
        address: 'Samberwatu, Sambirejo, Prambanan',
        promotion: 'Complimentary traditional wedang drink',
        phone: '+62 274 4469277',
        coordinates: { lat: -7.7654, lng: 110.4995 }
      },
      {
        id: 'p-p3',
        name: 'Suwatu by Mil&Bay',
        category: 'cafe',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600',
        rating: 4.7,
        price: 'IDR 80,000 - 150,000 / person',
        distance: '4.0 km from Prambanan',
        description: 'A bohemian-inspired cliffside sanctuary decorated in premium white Javanese stone, serving artisanal single-origin coffees and local organic delicacies.',
        address: 'Sumberwatu, Sambirejo, Prambanan',
        promotion: 'Free traditional snack package',
        phone: '+62 812-2531-1881',
        coordinates: { lat: -7.7670, lng: 110.5011 }
      },
      {
        id: 'p-p4',
        name: 'Pak Joko Heritage Guides',
        category: 'guide',
        image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=600',
        rating: 4.9,
        price: 'IDR 250,000 / session',
        distance: 'On-Site',
        description: 'Deep historical insights. Pak Joko is a licensed Prambanan expert who translates hidden ancient relief stories from Javanese folklore.',
        address: 'Prambanan Guide Guild, Sleman',
        promotion: 'Free custom souvenir postcard',
        phone: '+62 813-9221-0022',
        coordinates: { lat: -7.7525, lng: 110.4910 }
      },
      {
        id: 'p-p5',
        name: 'Silver Heritage Craft Center',
        category: 'souvenir',
        image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600',
        rating: 4.6,
        price: 'Varies',
        distance: '1.2 km from Prambanan',
        description: 'Watch local masters handcraft miniature silver Prambanan replicas, Javanese kris daggers, and elegant jewelry.',
        address: 'Jl. Raya Jogja-Solo Km 16, Prambanan',
        promotion: '10% discount on master-carved silver',
        coordinates: { lat: -7.7540, lng: 110.4820 }
      }
    ],
    faqs: [
      { q: 'Is there a dress code?', a: 'Yes. Modest wear covering knees and shoulders is recommended. A complimentary traditional sarong sash is available at the entrance gate.' },
      { q: 'When does the Ramayana Ballet perform?', a: 'It performs on Tuesday, Thursday, and Saturday nights in the open-air theater during dry season, and in the indoor theater during rainy months.' }
    ]
  },
  {
    id: 'malioboro',
    name: 'Malioboro Street',
    tagline: 'The Soul and Lifeline of Yogyakarta',
    category: 'culinary',
    location: 'Yogyakarta City',
    subRegion: 'Yogyakarta',
    images: [
      'https://images.unsplash.com/photo-1543874768-af0b9c4090d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1617591387509-2fcba0c80c42?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581456495146-65a71b2c8e52?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.6,
    reviewCount: 9280,
    description: 'The primary shopping street of Yogyakarta, pulsing with energy day and night. Framed by colonial-era storefronts, traditional horse carriages (Andong), motorized three-wheelers (Becak), and street musicians, Malioboro is an unforgettable sensory gateway to local Javanese life.',
    story: 'Malioboro represents the imaginary axis linking Mount Merapi in the north, the Sultan\'s Palace (Kraton) in the center, and the mystical South Sea (Parangtritis) in the south. The name itself is derived from the Sanskrit word "malyabhara," which translates to "crowned with flower garlands," referencing the historical royal procession path.',
    ticketPrice: 'Free Entry',
    openingHours: '24 Hours Daily (Best at evening 06:00 PM - 11:00 PM)',
    facilities: ['Pedestrian Benches', 'Batik Stores', 'Food Courtyards (Teras Malioboro)', 'Street Musicians', 'Trishaw Stands', 'Historic Buildings', 'Tourist Police Centers'],
    travelTips: [
      'Take a slow evening walk starting from Tugu Station down to the central post office.',
      'Practice friendly, smiling negotiation when purchasing handmade batik or royal Javanese leather slippers.',
      'Try dining at an authentic open-floor bamboo mat stall (Lesehan) serving traditional Gudeg.'
    ],
    bestTime: 'Every evening after 06:00 PM, when traditional musical groups play gamelans and acoustic sets along the walkways.',
    weather: {
      temp: '27°C',
      condition: 'Clear Evening',
      status: 'Perfect cool breeze for an evening walk in Malioboro.'
    },
    latitude: -7.7928,
    longitude: 110.3658,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'm-p1',
        name: 'Grand Inna Malioboro Heritage',
        category: 'hotel',
        image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=600',
        rating: 4.7,
        price: 'IDR 1,100,000 / night',
        distance: '0 km (Directly on Malioboro)',
        description: 'An iconic historic heritage hotel established in 1908. Elegant colonial luxury blended with prestigious royal hospitality.',
        address: 'Jl. Malioboro No.60, Yogyakarta',
        promotion: 'Free royal high tea for two',
        phone: '+62 274 566353',
        coordinates: { lat: -7.7920, lng: 110.3660 }
      },
      {
        id: 'm-p2',
        name: 'Gudeg Yu Djum Wijilan 167',
        category: 'restaurant',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600',
        rating: 4.8,
        price: 'IDR 30,000 - 60,000 / person',
        distance: '1.2 km from Malioboro',
        description: 'The supreme culinary legend of Yogyakarta. Sweet-savory young jackfruit, slow-stewed on traditional clay stoves with teak leaves for 24 hours.',
        address: 'Jl. Wijilan No.167, Kraton, Yogyakarta',
        promotion: 'Get 10% off packaging for travel gifts',
        phone: '+62 811-2511-167',
        coordinates: { lat: -7.8045, lng: 110.3645 }
      },
      {
        id: 'm-p3',
        name: 'Loko Cafe Malioboro',
        category: 'cafe',
        image: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?q=80&w=600',
        rating: 4.5,
        price: 'IDR 35,000 - 70,000 / person',
        distance: '0.1 km from Malioboro',
        description: 'A vibrant open-air cafe directly adjacent to Tugu Railway Station, featuring live acoustic music and exceptional single-origin Javanese espresso.',
        address: 'Jl. Pasar Kembang No.3, Yogyakarta',
        promotion: '15% Off with train tickets',
        phone: '+62 274 540801',
        coordinates: { lat: -7.7895, lng: 110.3640 }
      },
      {
        id: 'm-p4',
        name: 'Pasar Beringharjo Batik Market',
        category: 'souvenir',
        image: 'https://images.unsplash.com/photo-1520038410233-7141be7e6f97?q=80&w=600',
        rating: 4.7,
        price: 'Budget Friendly',
        distance: '0.5 km from Malioboro',
        description: 'The legendary central market established in 1758. Thousands of local stalls selling pure handmade batik fabrics, Javanese sandals, and organic herbal teas.',
        address: 'Jl. Pabringan No.1, Yogyakarta',
        promotion: 'Wholesale prices for handcrafted items',
        coordinates: { lat: -7.7985, lng: 110.3662 }
      }
    ],
    faqs: [
      { q: 'Is Malioboro wheelchair accessible?', a: 'Yes. The sidewalks are exceptionally wide, paved with flat stone slabs and fitted with tactile guides and modern ramps.' },
      { q: 'What is the best way to get there?', a: 'Arriving by train at Tugu Station places you directly at the northern tip of Malioboro. Local TransJogja buses also stop frequently.' }
    ]
  },
  {
    id: 'parangtritis',
    name: 'Parangtritis Beach',
    tagline: 'Mystical Golden Sands of the Southern Realm',
    category: 'beach',
    location: 'Bantul, Yogyakarta',
    subRegion: 'Bantul',
    images: [
      'https://images.unsplash.com/photo-1602137704924-9a038cfb5253?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7,
    reviewCount: 4230,
    description: 'Framed by dramatic black volcanic sands, towering karst cliffs, and roaring waves from the Indian Ocean, Parangtritis is Yogyakarta\'s most legendary beach. At sunset, the wet, reflective shoreline morphs into a giant natural mirror.',
    story: 'Parangtritis is deeply woven with Javanese cosmology. It is believed to be the sacred gateway to the undersea palace of Kanjeng Ratu Kidul, the mystical Queen of the Southern Seas. Out of respect for the Queen, local visitors are strongly advised to avoid wearing bright green clothing.',
    ticketPrice: 'IDR 15,000 / person',
    openingHours: '24 Hours Daily (Sunsets are spectacular from 05:00 PM - 06:15 PM)',
    facilities: ['Traditional Chariot Rides', 'ATV Rentals', 'Fresh Coconut Stalls', 'Cliffside Gazebos', 'Volcanic Sand Dunes (Gumuk Pasir)', 'Lifeguard Posts', 'Local Seafood Dining'],
    travelTips: [
      'Rent a horse-drawn carriage (Andong) to gallop along the endless tideline during sunset.',
      'Head to the nearby Gumuk Pasir (sand dunes) for sandboarding, one of the only active sand deserts in Southeast Asia.',
      'Do not swim in the ocean. The undercurrents and rip tides are extremely powerful and hazardous.'
    ],
    bestTime: 'June to August, when sunsets are exceptionally crisp and clear with purple-orange sky bands.',
    weather: {
      temp: '29°C',
      condition: 'Ocean Breeze',
      status: 'Beautiful clear skies over the South Sea today.'
    },
    latitude: -8.0253,
    longitude: 110.3298,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'pt-p1',
        name: 'Queen of the South Resort',
        category: 'hotel',
        image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600',
        rating: 4.8,
        price: 'IDR 1,400,000 / night',
        distance: '1.5 km from beach',
        description: 'Perched high on the cliffs, offering an spectacular infinity pool that merges seamlessly with the roaring Indian Ocean. Elegant wooden Javanese villa bungalows.',
        address: 'Parangrejo, Purwosari, Bantul',
        promotion: 'Includes free cliffside sunset mocktail',
        phone: '+62 274 367136',
        coordinates: { lat: -8.0260, lng: 110.3340 }
      },
      {
        id: 'pt-p2',
        name: 'Warung Seafood Depok Grill',
        category: 'restaurant',
        image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?q=80&w=600',
        rating: 4.6,
        price: 'IDR 80,000 - 150,000 / person',
        distance: '2.0 km from beach',
        description: 'Select your live fish, prawns, and crabs fresh from the local fish auction (TPI) and have them charcoal-grilled with spicy sweet soy sauce (Kecap Manis).',
        address: 'Jl. Depok Beach, Bantul',
        promotion: 'Complimentary local organic sambal tray',
        phone: '+62 821-3344-5566',
        coordinates: { lat: -8.0190, lng: 110.3210 }
      },
      {
        id: 'pt-p3',
        name: 'Parangtritis ATV & Adventure Rentals',
        category: 'rental',
        image: 'https://images.unsplash.com/photo-1531565637446-32307b194362?q=80&w=600',
        rating: 4.7,
        price: 'IDR 100,000 / 30 mins',
        distance: 'On-Site',
        description: 'Roam the unique coastal black-sand dunes of Parangtritis. Premium and well-maintained quad bikes with expert guides.',
        address: 'Main Beachfront Coast, Bantul',
        promotion: 'Get 20% off when renting 3 or more ATVs',
        phone: '+62 811-9988-7766',
        coordinates: { lat: -8.0250, lng: 110.3290 }
      }
    ],
    faqs: [
      { q: 'Can I swim in the sea?', a: 'Strictly prohibited. The southern sea of Java has steep drop-offs and intense rip currents that can pull swimmers out instantly.' },
      { q: 'Is there sandboarding?', a: 'Yes! At the nearby Gumuk Pasir Parangkusumo, you can rent customized boards for IDR 50,000 and slide down the dramatic wind-swept sand dunes.' }
    ]
  },
  {
    id: 'merapi',
    name: 'Mount Merapi Lava Tour',
    tagline: 'An Unforgettable Offroad Journey on an Active Volcano',
    category: 'adventure',
    location: 'Sleman, Yogyakarta',
    subRegion: 'Sleman',
    images: [
      'https://images.unsplash.com/photo-1550075099-dcd6d1513b87?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8,
    reviewCount: 5120,
    description: 'Ride inside open-cabin vintage 4x4 Willys Jeeps along the trails left by Mount Merapi\'s historical eruptions. Feel the dramatic chill mountain air as you explore underground bunkers, volcanic relic museums, and giant rock boulders shaped like alien faces.',
    story: 'Mount Merapi (literally translating to "Mountain of Fire") is one of the world\'s most active volcanoes. The local Javanese hold deep reverence for the mountain spirits. Every year, the royal palace of Yogyakarta conducts "Labuhan," a sacred offering ritual on the high slopes to ensure harmony with the earth.',
    ticketPrice: 'IDR 350,000 - IDR 650,000 per Jeep (fits 4 passengers)',
    openingHours: '04:30 AM - 06:00 PM Daily (Sunrise tours leave at 04:30 AM)',
    facilities: ['Willys Jeep Guild', 'Licensed Offroad Drivers', 'Protective Helmets & Masks', 'Merapi Relic Museum (Sisa Hartaku)', 'Underground Kaliadem Bunker', 'Scenic Mountain View Cafes'],
    travelTips: [
      'The absolute best experience is the Sunrise Jeep Tour. Leaving at 4:30 AM allows you to witness the giant sun rising over Merapi\'s glowing crown.',
      'Bring a light windbreaker jacket as the high mountain air can be chilly in the morning.',
      'Wear the provided face mask as volcano dirt tracks can get highly dusty during offroad trails.'
    ],
    bestTime: 'Dry months from May to September. Early mornings have the highest probability of cloud-free views of the summit.',
    weather: {
      temp: '22°C',
      condition: 'Mist & Sunrise',
      status: 'Stunning cloudless view of the volcano summit this morning.'
    },
    latitude: -7.5960,
    longitude: 110.4463,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'me-p1',
        name: 'Kopi Klotok Pakem',
        category: 'restaurant',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600',
        rating: 4.9,
        price: 'IDR 20,000 - 45,000 / person',
        distance: '6.5 km from Tour Base',
        description: 'A national sensation. Rustic traditional Javanese village wooden home serving hot charcoal-stewed black coffee, crunchy fresh-fried bananas (Pisang Goreng), and warm lodeh vegetables.',
        address: 'Jl. Kaliurang Km 16, Pakem, Sleman',
        promotion: 'Extra freshly fried banana with every pot coffee',
        phone: '+62 811-2334-455',
        coordinates: { lat: -7.6620, lng: 110.4210 }
      },
      {
        id: 'me-p2',
        name: 'Kopi Merapi Volcanic Cafe',
        category: 'cafe',
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600',
        rating: 4.6,
        price: 'IDR 15,000 - 35,000 / person',
        distance: '2.1 km from Tour Base',
        description: 'Built entirely from volcanic stone ruins. Enjoy robust mountain robusta and arabica coffees roasted on black sand, while sitting directly facing Merapi\'s active cone.',
        address: 'Petung, Kepuharjo, Cangkringan, Sleman',
        promotion: 'Free crispy cassava platter',
        phone: '+62 823-1122-3344',
        coordinates: { lat: -7.6050, lng: 110.4490 }
      },
      {
        id: 'me-p3',
        name: 'Merapi Jeep Adventure Group 88',
        category: 'rental',
        image: 'https://images.unsplash.com/photo-1467489904517-075c242c2b4f?auto=format&fit=crop&w=600&q=80',
        rating: 4.9,
        price: 'IDR 400,000 / Jeep Package',
        distance: 'On-Site',
        description: 'Professional certified local offroaders driving vintage Willys Jeeps. Includes full safety accessories, insurance, and highly skilled photographer drivers.',
        address: 'Kaliurang Barat, Sleman',
        promotion: 'Free GoPro video recording of your tour',
        phone: '+62 812-3456-7890',
        coordinates: { lat: -7.5970, lng: 110.4450 }
      }
    ],
    faqs: [
      { q: 'Is it safe for kids?', a: 'Yes. Families can choose the Short Route which is smoother. Jeeps are fitted with sturdy roll-cages and child helmets are available.' },
      { q: 'What is inside the Bunker?', a: 'The underground Kaliadem bunker is a steel-reinforced shelter built to withstand volcanic heat. It houses historic artifacts and displays of volcanic defense.' }
    ]
  },
  {
    id: 'tamansari',
    name: 'Taman Sari Water Castle',
    tagline: 'The Secret Royal Bathing Pools of the Sultanate',
    category: 'heritage',
    location: 'Yogyakarta City',
    subRegion: 'Yogyakarta',
    images: [
      'https://images.unsplash.com/photo-1625506276715-76ad63823181?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.6,
    reviewCount: 3120,
    description: 'Built in the mid-18th century as a private pleasure park for the first Sultan, Taman Sari is a stunning architectural mixture of Javanese and Portuguese styles. It features quiet, turquoise royal bathing pools, underground secret tunnels, and Sumur Gumuling, an elegant subterranean mosque with five intersecting staircases.',
    story: 'Sultan Hamengkubuwono I built Taman Sari as a resting palace, defense castle, and mystical meditation sanctuary. Secret chambers and underwater passageways allowed the royal family to travel undetected in times of siege. The central bathing pool was where the Sultan watched his princesses swim, selecting one by throwing a Javanese flower from his private tower.',
    ticketPrice: 'IDR 15,000 / person',
    openingHours: '09:00 AM - 03:30 PM Daily',
    facilities: ['English Speaking Royal Guides', 'Turquoise Bathing Pools', 'Underground Mosque (Sumur Gumuling)', 'Passage Tunnels', 'Heritage Batik Villages (Cyber Village)', 'Craft Souvenir Galleries'],
    travelTips: [
      'The castle is deeply integrated within a lively residential neighborhood called Kampung Taman. Hire a local guide to navigate the labyrinth of pastel narrow streets and find the underground entrances.',
      'Excellent photo opportunities exist at the central five-staircase subterranean mosque. Arrive early at 9 AM to avoid long photo queues.',
      'Visit the nearby Kampung Cyber, a local tech-forward neighborhood where residents specialize in traditional painting and digital art.'
    ],
    bestTime: 'Morning between 09:30 AM - 11:30 AM when the sun streams perfectly into the underground tunnels, creating mystical light shafts.',
    weather: {
      temp: '28°C',
      condition: 'Partly Cloudy',
      status: 'Warm sunshine, perfect for the beautiful outdoor pools today.'
    },
    latitude: -7.8101,
    longitude: 110.3592,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'ts-p1',
        name: 'The Phoenix Hotel Yogyakarta',
        category: 'hotel',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
        rating: 4.9,
        price: 'IDR 1,500,000 / night',
        distance: '4.2 km from Taman Sari',
        description: ' Colonial elegance blended with royal Javanese architecture. Exquisite heritage experience.',
        address: 'Jl. Jend. Sudirman No.9, Yogyakarta',
        promotion: 'Get 10% off Javanese massage at Royal Spa',
        phone: '+62 274 566617',
        coordinates: { lat: -7.7828, lng: 110.3671 }
      },
      {
        id: 'ts-p2',
        name: 'Sultan Agung Royal Dining',
        category: 'restaurant',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600',
        rating: 4.8,
        price: 'IDR 120,000 - 250,000 / person',
        distance: '1.1 km from Taman Sari',
        description: 'Authentic royal recipes passed down through generations. Taste Gudeg Manggar and dynamic Javanese duck with aromatic spices.',
        address: 'Jl. Wijilan No.44, Yogyakarta',
        promotion: 'Complimentary Wedang Rondhe dessert',
        phone: '+62 811-4433-2211',
        coordinates: { lat: -7.8080, lng: 110.3630 }
      },
      {
        id: 'ts-p3',
        name: 'Water Castle Cafe',
        category: 'cafe',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=600',
        rating: 4.6,
        price: 'IDR 30,000 - 60,000 / person',
        distance: '0.2 km from Taman Sari',
        description: 'A botanical cozy garden cafe hidden inside the royal village corridors. Known for cold-brewed coconut coffee and local banana pastries.',
        address: 'Kampung Taman No.45, Kraton, Yogyakarta',
        promotion: '10% discount on coffee with digital Royal Ticket',
        phone: '+62 856-1122-3344',
        coordinates: { lat: -7.8095, lng: 110.3585 }
      }
    ],
    faqs: [
      { q: 'Is Sumur Gumuling open?', a: 'Yes. The underground circular mosque is open to visitors, though numbers inside are monitored to preserve the structural integrity of the ancient stone stairs.' },
      { q: 'Can we photograph the pools?', a: 'Yes! Personal photography is permitted and free. Professional commercial equipment or pre-wedding shoots require a special permit fee.' }
    ]
  },
  {
    id: 'goajomblang',
    name: 'Goa Jomblang Cave',
    tagline: 'The Celestial Beam of Heavenly Light',
    category: 'hidden-gem',
    location: 'Gunungkidul, Yogyakarta',
    subRegion: 'Gunungkidul',
    images: [
      'https://images.unsplash.com/photo-1628047563315-d1e8b8d222b9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1571607023618-c93917452ed3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.9,
    reviewCount: 1840,
    description: 'Goa Jomblang is a vertical collapse-sinkhole cave. You will be rappelled down 60 meters in harnesses into a mystical underground ancient forest, then walk through a dark, muddy tunnel to reach Goa Grubug, where a blinding ray of celestial light pierces the ceiling into the deep rushing underground river.',
    story: 'Formed hundreds of thousands of years ago when the ground collapsed into a vertical limestone sinkhole, Jomblang isolated a pristine prehistoric jungle. Because it was untouched, unique vegetation and mosses thrive inside. Modern locals call the blinding 12:00 PM midday sunbeam "Cahaya Surga" (The Light of Heaven).',
    ticketPrice: 'IDR 500,000 / person (Includes professional caving gears, safety guides, and traditional lunch box)',
    openingHours: '07:30 AM - 12:30 PM (Caving starts strictly at 09:30 AM to capture midday light)',
    facilities: ['Certified Single-Rope Technique (SRT) Guides', 'Rappelling Harnesses & Safety Helmets', 'Rubber Boots (all sizes)', 'Outdoor Shower Rooms', 'Traditional Javanese Lunch Box', 'Resting Gazebos'],
    travelTips: [
      'Advance bookings are mandatory as entry is limited to only 80 people per day to preserve the delicate underground ecosystem.',
      'Bring a complete set of dry spare clothes, a towel, and plastic bags. You will get completely covered in wet volcanic mud during the cave walk.',
      'Pack a bright headlamp or flashlight and secure your camera strap thoroughly.'
    ],
    bestTime: 'Sunny days between 11:15 AM and 12:30 PM, when the sun is positioned directly overhead to shoot the direct column of light.',
    weather: {
      temp: '27°C',
      condition: 'Sunny Outside',
      status: 'Perfect clear skies today, promising an intense beam of light!'
    },
    latitude: -8.0287,
    longitude: 110.6384,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'gj-p1',
        name: 'Gunungkidul Cave Guides Guild',
        category: 'guide',
        image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=600',
        rating: 4.9,
        price: 'Included in entry ticket',
        distance: 'On-Site',
        description: 'Highly trained single-rope safety experts. Licensed caving instructors dedicated to eco-tourism preservation and safe descents.',
        address: 'Pacarejo, Semanu, Gunungkidul',
        promotion: 'Free GoPro assistance for photos',
        phone: '+62 878-1122-3344',
        coordinates: { lat: -8.0280, lng: 110.6380 }
      },
      {
        id: 'gj-p2',
        name: 'Jomblang Traditional Kitchen',
        category: 'restaurant',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600',
        rating: 4.7,
        price: 'Included in ticket (Traditional lunch)',
        distance: '0.1 km from cave',
        description: 'Authentic local farming lunch served in woven bamboo baskets. Features volcanic-soil red rice, fried marinated tofu, free-range chicken, and fresh sambal.',
        address: 'Goa Jomblang Entrance Area, Gunungkidul',
        promotion: 'Complimentary organic ginger tea',
        coordinates: { lat: -8.0290, lng: 110.6390 }
      }
    ],
    faqs: [
      { q: 'Do I need caving experience?', a: 'No. The cave guides perform the entire rappelling and pulling mechanically. You just sit comfortably in the harness and enjoy the descent.' },
      { q: 'Are there age restrictions?', a: 'Yes. It is recommended for ages between 10 and 60 years old in healthy physical condition.' }
    ]
  },
  {
    id: 'kalibiru',
    name: 'Kalibiru National Park',
    tagline: 'Highland Serenity and Panoramic Reservoir Views',
    category: 'nature',
    location: 'Kulon Progo, Yogyakarta',
    subRegion: 'Kulon Progo',
    images: [
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1200'
    ],
    rating: 4.7,
    reviewCount: 2180,
    description: 'Kalibiru National Park is located in the Menoreh Hills, offering a breathtaking panoramic view of the Sermo Reservoir and lush green pine forests from sturdy tree-top wooden platforms.',
    story: 'Kalibiru was originally a dry and degraded forest area. Through the visionary collaborative reforestation efforts of local community groups starting in the early 2000s, it blossomed into a pioneering national model of community-based sustainable eco-tourism.',
    ticketPrice: 'IDR 20,000 / person',
    openingHours: '08:00 AM - 05:00 PM Daily',
    facilities: ['Treetop Viewing Decks', 'Flying Fox Ziplines', 'Trekking Trails', 'Local Viewpoint Cafes', 'Spacious Parking', 'Clean Restrooms'],
    travelTips: [
      'Arrive early in the morning or during the late afternoon to experience the coolest mountain air and capture perfect lighting over the reservoir.',
      'Wear comfortable hiking shoes as there is a short, scenic uphill walk from the parking area to the viewing platforms.',
      'Hire a local photographer at the platforms for a small fee to take spectacular, high-quality photos of you over the cliff.'
    ],
    bestTime: 'Dry season months of June to September for the clearest panoramic views and colorful sunset reflections on the reservoir.',
    weather: {
      temp: '24°C',
      condition: 'Clear & Cool',
      status: 'Beautiful clear skies with a cool, refreshing breeze over Kalibiru today.'
    },
    latitude: -7.8052,
    longitude: 110.1293,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'kb-p1',
        name: 'Sermo Lakeside Camping',
        category: 'rental',
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600',
        rating: 4.7,
        price: 'IDR 150,000 / night',
        distance: '4.5 km from Kalibiru',
        description: 'Camp under the stars on the edge of the scenic Sermo Reservoir. Equipment rental and bonfire setup included.',
        address: 'Sermo Reservoir Area, Kulon Progo',
        promotion: 'Free firewood bundle with lakeside booking',
        coordinates: { lat: -7.8280, lng: 110.1340 }
      }
    ],
    faqs: [
      { q: 'Is it safe to climb the platforms?', a: 'Yes. Every platform is equipped with professional safety harnesses.' }
    ]
  },
  {
    id: 'keraton',
    name: 'Keraton Yogyakarta',
    tagline: 'The Living Heart of the Sultanate',
    category: 'heritage',
    location: 'Yogyakarta City',
    subRegion: 'Yogyakarta',
    images: [
      'https://images.unsplash.com/photo-1571607023618-c93917452ed3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7,
    reviewCount: 4500,
    description: 'Keraton Ngayogyakarta Hadiningrat is the official palace of the Sultan of Yogyakarta and a living museum of Javanese royal culture. Built in 1755 by Sultan Hamengkubuwono I, the palace complex features stunning Javanese architecture, sacred gamelan instruments, royal artifacts, and the Sultan\'s personal guard (Abdi Dalem).',
    story: 'The Kraton was built on the Philosophical Axis of Yogyakarta — the spiritual line connecting Mount Merapi, the Kraton, and the South Sea. According to Javanese cosmology, this axis represents the connection between the divine realm, the human world, and the spirit sea. The palace is still actively used by the Sultan and his court.',
    ticketPrice: 'IDR 15,000 / person (additional IDR 5,000 for camera)',
    openingHours: '08:30 AM - 02:00 PM Tuesday-Sunday',
    facilities: ['Royal Museum', 'Gamelan Performance Hall', 'Sultan\'s Personal Guard', 'Traditional Javanese Architecture', 'Royal Gardens', 'Gift Shop', 'Clean Restrooms'],
    travelTips: [
      'Visit during the gamelan performance (usually 10:00 AM and 12:00 PM).',
      'Wear modest clothing — this is still an active royal palace.',
      'Hire a guide to understand the deep symbolism of each room.',
      'Don\'t miss the Bangsal Kencana (Golden Pavilion).'
    ],
    bestTime: 'Tuesday to Sunday mornings for gamelan performances',
    weather: {
      temp: '28°C',
      condition: 'Partly Cloudy',
      status: 'Perfect weather for exploring the royal palace.'
    },
    latitude: -7.8054,
    longitude: 110.3642,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'k-p1',
        name: 'Royal Ambarrukmo Hotel',
        category: 'hotel',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600',
        rating: 4.8,
        price: 'IDR 1,200,000 / night',
        distance: '3.5 km from Kraton',
        description: 'Heritage luxury hotel once used by visiting royalty.',
        address: 'Jl. Babarsari No.53, Yogyakarta',
        coordinates: { lat: -7.7828, lng: 110.3671 }
      }
    ],
    faqs: [
      { q: 'Is the palace still inhabited?', a: 'Yes. The Sultan\'s family still uses part of the complex.' },
      { q: 'What days is it open?', a: 'Tuesday through Sunday, 08:30 AM - 02:00 PM. Closed on Monday.' }
    ]
  },
  {
    id: 'ratuboko',
    name: 'Ratu Boko Palace',
    tagline: 'The Lost Kingdom on the Hilltop',
    category: 'heritage',
    location: 'Sleman, Yogyakarta',
    subRegion: 'Sleman',
    images: [
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1581456495146-65a71b2c8e52?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7,
    reviewCount: 3200,
    description: 'Ratu Boko is an archaeological palace complex perched on a plateau 3 km south of Prambanan. Unlike other Javanese sites which are temples, Ratu Boko displays attributes of a fortified royal settlement — complete with defensive walls, dry moats, bathing pools, and meditation chambers. It is most famous for its breathtaking sunset views.',
    story: 'The original name remains unclear, but local inhabitants named the site after King Boko, the legendary king from the Roro Jonggrang folklore. Archaeologists believe it was a palace complex of the Sailendra or Mataram Kingdom. The site covers 16 hectares across two hamlets and offers one of the most dramatic sunset viewpoints in all of Java.',
    ticketPrice: 'IDR 40,000 (Adult) / IDR 20,000 (Child) / IDR 10,000 (Parking)',
    openingHours: '06:00 AM - 05:00 PM Daily (Sunset package available)',
    facilities: ['Shuttle Bus from Prambanan', 'Sunset Viewpoint Platform', 'Ancient Stone Gate (Gapura)', 'Bathing Pools Ruins', 'Meditation Caves', 'Restaurant & Cafe', 'Parking Area', 'Gift Shop'],
    travelTips: [
      'Arrive 2 hours before sunset to explore and secure the best spot.',
      'Buy the Prambanan + Ratu Boko combo ticket with included shuttle.',
      'Bring a picnic mat to relax on the grass while waiting for sunset.',
      'Comfortable walking shoes are essential — the complex is large.'
    ],
    bestTime: 'Late afternoon for sunset; dry season (May-September) for clearest skies',
    weather: {
      temp: '27°C',
      condition: 'Clear',
      status: 'Perfect conditions for a spectacular sunset at Ratu Boko.'
    },
    latitude: -7.7700,
    longitude: 110.4830,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'rb-p1',
        name: 'Boko Sunset Resto',
        category: 'restaurant',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600',
        rating: 4.4,
        price: 'IDR 80,000 - 200,000 / person',
        distance: 'On-Site',
        description: 'Dine with panoramic views of the sunset over the Prambanan plain.',
        address: 'Jl. Ratu Boko, Bokoharjo, Prambanan',
        coordinates: { lat: -7.7700, lng: 110.4830 }
      }
    ],
    faqs: [
      { q: 'Is it a temple?', a: 'No. Ratu Boko is an ancient palace complex, not a temple.' },
      { q: 'Can I visit for sunset?', a: 'Yes! Sunset packages are available. Arrive 2 hours before sunset.' }
    ]
  },
  {
    id: 'timang',
    name: 'Timang Beach',
    tagline: 'The Thrilling Rope Bridge Over Wild Waves',
    category: 'adventure',
    location: 'Gunungkidul, Yogyakarta',
    subRegion: 'Gunungkidul',
    images: [
      'https://images.unsplash.com/photo-1595323264810-3dd19b1be56f?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.8,
    reviewCount: 2800,
    description: 'Timang Beach is a dramatic limestone cliff beach famous for its traditional wooden rope bridge (Jembatan Timang) that spans across crashing Indian Ocean waves. Originally built by lobster fishermen, the bridge has become one of Yogyakarta\'s most thrilling adventure attractions.',
    story: 'For generations, local fishermen built and rebuilt this precarious rope bridge to reach the lobster-rich rocks on the other side of the cove. The bridge is made entirely from wooden planks and nylon ropes, hand-pulled by local volunteers. The tradition of lobster fishing here dates back centuries, and the bridge has been featured on the Japanese TV show "Legends of the Hidden Temple."',
    ticketPrice: 'IDR 100,000 - 200,000 / person (rope bridge crossing)',
    openingHours: '07:00 AM - 05:00 PM Daily',
    facilities: ['Rope Bridge Crossing', 'Traditional Lobster Dining', 'Cliffside Viewpoints', 'Local Guide Services', 'Parking Area', 'Warung (Food Stalls)', 'ATV Rental (nearby)'],
    travelTips: [
      'The rope bridge crossing is not for the faint of heart — hold on tight!',
      'Wear closed-toe shoes with good grip.',
      'Try the fresh grilled lobster — it\'s the specialty here.',
      'Visit on a weekday to avoid long queues for the bridge.'
    ],
    bestTime: 'May to September for calmer seas; morning for best light',
    weather: {
      temp: '28°C',
      condition: 'Sunny',
      status: 'Clear skies — perfect for the rope bridge adventure!'
    },
    latitude: -8.1350,
    longitude: 110.6580,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 't-p1',
        name: 'Timang Lobster Warung',
        category: 'restaurant',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600',
        rating: 4.7,
        price: 'IDR 100,000 - 250,000 / person',
        distance: 'On-Site',
        description: 'Fresh grilled lobster caught daily by local fishermen.',
        address: 'Timang Beach, Tepus, Gunungkidul',
        coordinates: { lat: -8.1350, lng: 110.6580 }
      }
    ],
    faqs: [
      { q: 'Is the rope bridge safe?', a: 'Yes. It is inspected and maintained daily by local fishermen.' },
      { q: 'Can children cross the bridge?', a: 'Children under 12 are not recommended to cross.' }
    ]
  },
  {
    id: 'tebingbreksi',
    name: 'Tebing Breksi',
    tagline: 'The Dramatic Limestone Cliff of Yogyakarta',
    category: 'nature',
    location: 'Sleman, Yogyakarta',
    subRegion: 'Sleman',
    images: [
      'https://images.unsplash.com/photo-1524445361389-3d2c21109015?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.6,
    reviewCount: 1900,
    description: 'Tebing Breksi is a former limestone quarry transformed into one of Yogyakarta\'s most spectacular viewpoints. The dramatic carved cliffs feature layered geological formations dating back millions of years. At the summit, you can see panoramic views stretching from Prambanan to the ocean.',
    story: 'Originally an active limestone quarry, Tebing Breksi was closed by the government in 2014 to preserve the geological heritage. Local communities then developed it into a tourist attraction with carved pathways, amphitheater, and viewing platforms. The cliff face reveals geological layers formed over millions of years, making it both a scenic and scientific site.',
    ticketPrice: 'IDR 10,000 / person',
    openingHours: '06:00 AM - 06:00 PM Daily',
    facilities: ['Carved Stone Pathways', 'Summit Viewing Platform', 'Open-Air Amphitheater', 'Sunrise & Sunset Spots', 'Food Stalls', 'Parking Area', 'Restrooms'],
    travelTips: [
      'Visit at sunrise (05:30 AM) for golden light over Prambanan.',
      'The amphitheater sometimes hosts evening cultural performances.',
      'Combine with a visit to nearby Candi Ijo for a full day trip.',
      'Wear sturdy shoes — the stone paths can be slippery.'
    ],
    bestTime: 'Sunrise (05:30 AM) or sunset (05:00 PM) for dramatic lighting',
    weather: {
      temp: '26°C',
      condition: 'Clear',
      status: 'Perfect visibility for panoramic views from the cliff summit.'
    },
    latitude: -7.7710,
    longitude: 110.4750,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'tb-p1',
        name: 'Candi Ijo Restaurant',
        category: 'restaurant',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=600',
        rating: 4.5,
        price: 'IDR 30,000 - 80,000 / person',
        distance: '2 km',
        description: 'Traditional Javanese restaurant near Candi Ijo with hilltop views.',
        address: 'Sambirejo, Prambanan, Sleman',
        coordinates: { lat: -7.7710, lng: 110.4750 }
      }
    ],
    faqs: [
      { q: 'Is it safe to climb?', a: 'Yes. Carved pathways and safety railings are installed.' },
      { q: 'Is there an entrance fee?', a: 'Yes, IDR 10,000 per person. Parking IDR 5,000.' }
    ]
  },
  {
    id: 'pindul',
    name: 'Pindul Cave Tubing',
    tagline: 'Glide Through Underground Rivers in Ancient Caves',
    category: 'adventure',
    location: 'Gunungkidul, Yogyakarta',
    subRegion: 'Gunungkidul',
    images: [
      'https://images.unsplash.com/photo-1586319826484-b7f386bf3e72?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1646806512881-1c169782a970?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.7,
    reviewCount: 2400,
    description: 'Pindul Cave tubing is an underground river tubing adventure through a 350-meter limestone cave. You float on inner tubes through crystal-clear underground water, passing by stunning stalactites and stalagmites illuminated by guide-held lights. The experience takes about 45 minutes.',
    story: 'Pindul Cave was discovered by local explorers in 2008. The underground river was found to be deep enough (5-12 meters) and calm enough for safe tubing. The cave ceiling is adorned with ancient stalactites formed over millions of years, some reaching down to nearly touch the water surface.',
    ticketPrice: 'IDR 100,000 / person (includes tube, guide, and life jacket)',
    openingHours: '08:00 AM - 04:00 PM Daily',
    facilities: ['Full Tubing Equipment', 'Certified Cave Guides', 'Life Jackets', 'Underwater Flashlights', 'Changing Rooms', 'Freshwater Showers', 'Parking Area', 'Warung (Food Stalls)'],
    travelTips: [
      'Wear swimwear under your clothes — you will get wet!',
      'Waterproof cameras or phone cases are essential.',
      'Combine with a visit to nearby Bejiharjo Village.',
      'Book in advance during school holidays.'
    ],
    bestTime: 'Year-round (cave temperature is constant at 25°C)',
    weather: {
      temp: '25°C',
      condition: 'Cave Interior',
      status: 'Constant comfortable temperature inside the cave.'
    },
    latitude: -8.0120,
    longitude: 110.6100,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'pindul-p1',
        name: 'Pindul Adventure Tours',
        category: 'guide',
        image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=600',
        rating: 4.8,
        price: 'IDR 100,000 / person',
        distance: 'On-Site',
        description: 'Professional cave tubing operators with 15+ years of experience.',
        address: 'Bejiharjo, Karangmojo, Gunungkidul',
        coordinates: { lat: -8.0120, lng: 110.6100 }
      }
    ],
    faqs: [
      { q: 'Do I need to know how to swim?', a: 'No. Life jackets are provided and the water is calm.' },
      { q: 'Is it safe?', a: 'Yes. Guides accompany every group and equipment is inspected daily.' }
    ]
  },
  {
    id: 'pinusmangunan',
    name: 'Hutan Pinus Mangunan',
    tagline: 'The Enchanted Pine Forest Above the Clouds',
    category: 'nature',
    location: 'Bantul, Yogyakarta',
    subRegion: 'Bantul',
    images: [
      'https://images.unsplash.com/photo-1654739595101-594699f889d4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
    ],
    rating: 4.6,
    reviewCount: 3100,
    description: 'Hutan Pinus Mangunan is a vast pine forest perched on the hills of Mangunan, Bantul. Famous for its Instagram-worthy wooden platforms, swing seats, and the magical atmosphere created by tall pine trees stretching endlessly into the mist. On clear mornings, you can see the Indian Ocean from the viewpoints.',
    story: 'The pine forest was originally a government reforestation project in the 1980s. Local residents later transformed it into an eco-tourism destination, building creative photo spots among the trees. It became a viral sensation on social media, attracting hundreds of thousands of visitors annually and boosting the local economy significantly.',
    ticketPrice: 'IDR 10,000 / person',
    openingHours: '06:00 AM - 05:00 PM Daily',
    facilities: ['Pine Forest Walking Trails', 'Instagram Photo Platforms', 'Swing Seats', 'Hilltop Viewpoint', 'Cafes & Food Stalls', 'Parking Area', 'Restrooms', 'Camping Area'],
    travelTips: [
      'Arrive before 07:00 AM for misty, ethereal photos.',
      'The hilltop viewpoint offers stunning sunrise views over the southern coast.',
      'Wear comfortable walking shoes for the forest trails.',
      'Combine with a visit to Becici Peak nearby.'
    ],
    bestTime: 'Early morning (06:00-08:00 AM) for misty forest atmosphere',
    weather: {
      temp: '25°C',
      condition: 'Misty Morning',
      status: 'Perfect conditions for atmospheric pine forest photos.'
    },
    latitude: -7.9520,
    longitude: 110.3890,
    reviews: MOCK_REVIEWS,
    partners: [
      {
        id: 'pm-p1',
        name: 'Mangunan Pine Forest Cafe',
        category: 'cafe',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600',
        rating: 4.5,
        price: 'IDR 15,000 - 35,000 / person',
        distance: 'On-Site',
        description: 'Rustic forest cafe serving traditional drinks and snacks.',
        address: 'Mangunan, Dlingo, Bantul',
        coordinates: { lat: -7.9520, lng: 110.3890 }
      }
    ],
    faqs: [
      { q: 'Is there an entrance fee?', a: 'Yes, IDR 10,000 per person. Parking IDR 5,000.' },
      { q: 'Can I camp overnight?', a: 'Yes. Designated camping areas are available.' }
    ]
  }
];

export const FESTIVALS: Festival[] = [
  {
    id: 'f-sekaten',
    name: 'Sekaten Festival',
    date: '7 - 15 May 2025',
    location: 'Yogyakarta',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200',
    description: 'A week-long royal and spiritual festival celebrating the birth of Prophet Muhammad. The sacred royal gamelans are carried from the palace to the Grand Mosque.',
    highlights: ['Royal Gamelan Processions', 'Traditional Javanese Night Market'],
    category: 'culture'
  },
  {
    id: 'f-fky',
    name: 'Jogja Art Festival',
    date: '23 - 30 June 2025',
    location: 'Yogyakarta',
    image: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200',
    description: 'The ultimate showcase of contemporary and traditional art, bringing Yogyakarta\'s streets to life with street carnivals and puppet plays.',
    highlights: ['Street Art Carnivals', 'Wayang Kulit Puppetry Night'],
    category: 'art'
  },
  {
    id: 'f-grebeg',
    name: 'Grebeg Maulud',
    date: '5 October 2025',
    location: 'Yogyakarta',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200',
    description: 'The spectacular peak of royal gratitude. The Sultan of Yogyakarta paraded colossal mountain-shaped offerings made of harvest crops.',
    highlights: ['Majestic Gunungan Mountains', 'Ten Royal Regiments'],
    category: 'culture'
  },
  {
    id: 'f-wonosari',
    name: 'Wonosari Night Carnival',
    date: '12 July 2025',
    location: 'Gunungkidul',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200',
    description: 'A vibrant and glowing street parade in Gunungkidul featuring traditional dances, music, and colorful illuminated cultural floats.',
    highlights: ['Glowing Parades', 'Night Carnival'],
    category: 'carnival'
  }
];

export const JOGJA_QUOTES = [
  { text: "Jogja is made of comfortable homes, warm street food, and unforgettable memories.", author: "Anies Baswedan" },
  { text: "Every corner of Yogyakarta has its own story, whispering legends of empires past.", author: "Javanese Proverb" },
  { text: "You can leave Yogyakarta, but its soul will remain a part of you forever.", author: "Traditional Song" }
];
