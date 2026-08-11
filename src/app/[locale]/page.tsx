import { Suspense } from 'react';
import ClientShell from '@/components/ClientShell';
import { OrganizationJsonLd, ItemListJsonLd, FAQJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd';
import { toSlug } from '@/lib/slug';
import { fetchTrendingHitsDestinations } from '@/lib/server-destinations';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

const FALLBACK_DESTINATIONS = [
  { id: 'candi-prambanan', name: 'Candi Prambanan', slug: 'candi-prambanan', tagline: 'Candi Hindu Terbesar & Termegah di Indonesia', category: 'heritage', imageUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=800&q=80' },
  { id: 'jalan-malioboro', name: 'Jalan Malioboro', slug: 'jalan-malioboro', tagline: 'Jantung Wisata, Kuliner & Belanja Jogja', category: 'heritage', imageUrl: 'https://images.unsplash.com/photo-1586319826484-b7f386bf3e72?auto=format&fit=crop&w=800&q=80' },
  { id: 'pantai-parangtritis', name: 'Pantai Parangtritis', slug: 'pantai-parangtritis', tagline: 'Ikon Wisata Pantai Karst & Sunset Jogja', category: 'beach', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80' },
  { id: 'taman-sari', name: 'Taman Sari Water Castle', slug: 'taman-sari', tagline: 'Istana Air Bersejarah Keraton Yogyakarta', category: 'heritage', imageUrl: 'https://images.unsplash.com/photo-1602137704924-9a038cfb5253?auto=format&fit=crop&w=800&q=80' },
  { id: 'lava-tour-merapi', name: 'Lava Tour Gunung Merapi', slug: 'lava-tour-gunung-merapi', tagline: 'Petualangan Jeep Offroad Lereng Merapi', category: 'adventure', imageUrl: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=800&q=80' },
  { id: 'tugu-yogyakarta', name: 'Tugu Yogyakarta', slug: 'tugu-yogyakarta', tagline: 'Simbol Sumbu Filosofis Bersejarah Jogja', category: 'heritage', imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=800&q=80' },
];

async function getTopDestinations(locale: string = 'id') {
  try {
    const list = await fetchTrendingHitsDestinations(locale, 10);
    if (Array.isArray(list) && list.length > 0) {
      return list.map((d) => {
        const firstImage = d.images?.[0];
        const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url || '';
        return {
          id: d.id,
          name: d.name,
          slug: toSlug(d.name) || d.id,
          imageUrl,
          tagline: d.tagline || d.description?.slice(0, 100) || '',
          category: d.category || '',
        };
      });
    }
  } catch (err) {
    console.error('[SEO Shell] Failed to fetch top destinations:', err);
  }
  return FALLBACK_DESTINATIONS;
}

function SeoShell({ destinations }: { destinations: Array<{ id: string; name: string; slug: string; imageUrl: string; tagline: string; category: string }> }) {
  return (
    <div className="sr-only">
      <h1>Jogjagem — Panduan & Rekomendasi Wisata Yogyakarta</h1>
      <p>Temukan destinasi wisata terbaik di Yogyakarta. Panduan lengkap Candi Prambanan, Malioboro, Pantai Parangtritis, Gunung Merapi, dan 100+ destinasi pilihan.</p>
      <nav aria-label="Popular destinations">
        <ul>
          {destinations.map((dest) => (
            <li key={dest.id}>
              <a href={`${SITE_URL}/destinations/${dest.slug}`}>
                <span>{dest.name}</span>
                <span>{dest.tagline}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label="Categories">
        <ul>
          <li><a href={`${SITE_URL}/destinations?category=heritage`}>Heritage</a></li>
          <li><a href={`${SITE_URL}/destinations?category=adventure`}>Adventure</a></li>
          <li><a href={`${SITE_URL}/destinations?category=nature`}>Nature</a></li>
          <li><a href={`${SITE_URL}/destinations?category=beach`}>Beach</a></li>
          <li><a href={`${SITE_URL}/hidden-gem-jogja`}>Hidden Gem</a></li>
          <li><a href={`${SITE_URL}/kuliner-jogja`}>Kuliner</a></li>
        </ul>
      </nav>
      <nav aria-label="Footer">
        <ul>
          <li><a href={`${SITE_URL}/destinations`}>Destinasi</a></li>
          <li><a href={`${SITE_URL}/events`}>Events</a></li>
          <li><a href={`${SITE_URL}/map`}>Map</a></li>
          <li><a href={`${SITE_URL}/planner`}>Planner</a></li>
          <li><a href={`${SITE_URL}/ai`}>AI Assistant</a></li>
        </ul>
      </nav>
    </div>
  );
}

type PageProps = { params: Promise<{ locale: string }> };

export default async function Page({ params }: PageProps) {
  const { locale } = await params;
  const isEn = locale === 'en';
  const destinations = await getTopDestinations(locale);
  const pageUrl = isEn ? `${SITE_URL}/en` : SITE_URL;

  const faqs = isEn
    ? [
        {
          question: 'What are the top tourist destinations in Yogyakarta?',
          answer: 'Prambanan Temple, Malioboro Street, Taman Sari Water Castle, Parangtritis Beach, and Mount Merapi Lava Tour are among the top attractions in Yogyakarta.',
        },
        {
          question: 'How many days are recommended to visit Yogyakarta?',
          answer: 'A 2 to 3 day itinerary is ideal for exploring Yogyakarta city heritage, culinary spots, and surrounding natural attractions.',
        },
        {
          question: 'When is the best time to visit Yogyakarta?',
          answer: 'The dry season from May to October is the best time to visit Yogyakarta for outdoor activities, beaches, and temple tours.',
        },
      ]
    : [
        {
          question: 'Apa saja tempat wisata paling populer di Jogja?',
          answer: 'Candi Prambanan, Jalan Malioboro, Taman Sari, Pantai Parangtritis, dan Lava Tour Gunung Merapi merupakan destinasi favorit di Yogyakarta.',
        },
        {
          question: 'Berapa hari waktu ideal untuk liburan di Jogja?',
          answer: 'Waktu ideal liburan di Jogja adalah 2–3 hari untuk menjelajahi pusat kota, candi bersejarah, dan wisata alam di sekitarnya.',
        },
        {
          question: 'Kapan waktu terbaik berkunjung ke Yogyakarta?',
          answer: 'Musim kemarau antara Mei hingga Oktober adalah waktu terbaik untuk menikmati wisata alam dan pantai di Jogja.',
        },
      ];

  return (
    <>
      <OrganizationJsonLd />
      <BreadcrumbJsonLd
        items={[
          { name: isEn ? 'Home' : 'Beranda', url: pageUrl },
        ]}
      />
      <ItemListJsonLd
        pageName={isEn ? 'Top Destinations in Yogyakarta' : 'Destinasi Wisata Paling Dicari di Jogja'}
        pageUrl={pageUrl}
        description={
          isEn
            ? 'Discover top-rated tourist destinations, heritage sites, and hidden gems in Yogyakarta.'
            : 'Temukan destinasi wisata populer, cagar budaya, dan hidden gem di Yogyakarta.'
        }
        items={destinations.map((d, i) => ({
          position: i + 1,
          name: d.name,
          url: `${SITE_URL}${isEn ? '/en' : ''}/destinations/${d.slug}`,
        }))}
      />
      <FAQJsonLd items={faqs} />
      <SeoShell destinations={destinations} />
      <Suspense>
        <ClientShell />
      </Suspense>
    </>
  );
}
