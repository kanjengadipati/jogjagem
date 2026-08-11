import { Suspense } from 'react';
import ClientShell from '@/components/ClientShell';
import { OrganizationJsonLd, ItemListJsonLd, FAQJsonLd } from '@/components/JsonLd';
import { toSlug } from '@/lib/slug';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081';

if (!process.env.NEXT_PUBLIC_API_BASE) {
  console.warn('[SEO Shell] NEXT_PUBLIC_API_BASE is not set — falling back to localhost:8081. SEO shell will be empty in production unless env var is configured.');
}

async function getTopDestinations() {
  try {
    const res = await fetch(`${API_BASE}/destinations`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const body = await res.json();
    const list = body?.data || body || [];
    if (!Array.isArray(list)) return [];
    const topIds = ['prambanan', 'parangtritis', 'malioboro', 'tamansari', 'merapi', 'kalibiru'];
    return topIds
      .map((id) => {
        const d = list.find((item: any) => (item.id || item.ExternalID) === id);
        if (!d) return null;
        const name = d.name || d.Name || '';
        const images = d.images || d.Images || [];
        const firstImage = images[0];
        const imageUrl = typeof firstImage === 'string' ? firstImage : firstImage?.url || '';
        const tagline = d.tagline || d.Tagline || '';
        const category = d.category || d.Category || '';
        return { id, name, slug: toSlug(name), imageUrl, tagline, category };
      })
      .filter((d): d is { id: string; name: string; slug: string; imageUrl: string; tagline: string; category: string } => d !== null);
  } catch (err) {
    console.error('[SEO Shell] Failed to fetch top destinations:', err);
    return [];
  }
}

function SeoShell({ destinations }: { destinations: Array<{ id: string; name: string; slug: string; imageUrl: string; tagline: string; category: string }> }) {
  return (
    <div className="sr-only">
      <h1>Jogjagem — Jelajahi Yogyakarta Lebih Dalam</h1>
      <p>Temukan destinasi wisata terbaik di Yogyakarta. Panduan lengkap Candi Prambanan, Malioboro, Pantai Parangtritis, Gunung Merapi, dan 100+ destinasi lainnya.</p>
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
          <li><a href={`${SITE_URL}/destinations/hidden-gem`}>Hidden Gem</a></li>
          <li><a href={`${SITE_URL}/destinations?category=culinary`}>Culinary</a></li>
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
  const destinations = await getTopDestinations();
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
      {destinations.length > 0 && (
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
      )}
      <FAQJsonLd items={faqs} />
      <SeoShell destinations={destinations} />
      <Suspense>
        <ClientShell />
      </Suspense>
    </>
  );
}
