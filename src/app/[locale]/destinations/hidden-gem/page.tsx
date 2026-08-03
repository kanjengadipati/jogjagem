import type { Metadata } from 'next';
import HiddenGemLandingClient from '@/components/HiddenGemLandingClient';
import { destinations } from '@/lib/api';
import { ItemListJsonLd } from '@/components/JsonLd';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';

async function fetchHiddenGems() {
  try {
    const res = await destinations.getAll({ limit: 100 });
    if (res.status === 'success' && Array.isArray(res.data)) {
      return res.data
        .filter((raw: any) => (raw.badge || raw.Badge || '').toLowerCase() === 'hidden_gem')
        .map((raw: any) => ({
          id: raw.id || raw.ExternalID || '',
          name: raw.name || raw.Name || '',
          tagline: raw.tagline || raw.Tagline || '',
          category: raw.category || raw.Category || '',
          location: raw.location || raw.Location || '',
          subRegion: raw.sub_region || raw.SubRegion || raw.subRegion || '',
          images: (raw.images || raw.Images || []) as any[],
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
          latitude: raw.latitude || raw.Latitude || 0,
          longitude: raw.longitude || raw.Longitude || 0,
          reviews: raw.reviews || raw.Reviews || [],
          partners: raw.partners || raw.Partners || [],
          faqs: raw.faqs || raw.Faqs || raw.FAQs || [],
          googleMapsUrl: raw.google_maps_url || raw.GoogleMapsURL || raw.googleMapsUrl || '',
          googleReviewCount: raw.google_review_count || raw.GoogleReviewCount || raw.googleReviewCount || 0,
          seoTitle: raw.seo_title || raw.SeoTitle || '',
          seoTitleEn: raw.seo_title_en || raw.SeoTitleEn || '',
          seoKeywords: raw.seo_keywords || raw.SeoKeywords || '',
          seoKeywordsEn: raw.seo_keywords_en || raw.SeoKeywordsEn || '',
          seoDescription: raw.seo_description || raw.SeoDescription || '',
          seoDescriptionEn: raw.seo_description_en || raw.SeoDescriptionEn || '',
          ogImageUrl: raw.og_image_url || raw.OgImageUrl || '',
          badge: raw.badge || raw.Badge || '',
          badges: raw.badges || raw.Badges || [],
        }));
    }
    return [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';

  const title = isEn
    ? '23+ Hidden Gems Yogyakarta You Must Visit 2026 | Jogjagem'
    : '23+ Hidden Gem Jogja Wajib Dikunjungi 2026 | Jogjagem';

  const description = isEn
    ? 'Explore curated hidden gems in Yogyakarta. Secret destinations, quiet spots, and healing places not yet widely known. Updated 2026.'
    : 'Jelajahi hidden gem Jogja terkurasi. Destinasi tersembunyi, spot sepi, dan tempat healing yang belum banyak diketahui di Yogyakarta. Terbaru 2026.';

  const keywords = isEn
    ? 'hidden gems yogyakarta, hidden gem jogja, secret spots jogja, off the beaten path yogyakarta, quiet places jogja, healing spots yogyakarta'
    : 'hidden gem jogja, hidden gems yogyakarta, destinasi tersembunyi jogja, wisata sepi jogja, spot tersembunyi yogyakarta, tempat healing jogja';

  const pageUrl = isEn ? `${SITE_URL}/en/destinations/hidden-gem` : `${SITE_URL}/destinations/hidden-gem`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
      url: pageUrl,
      siteName: 'Jogjagem',
    },
    alternates: {
      canonical: pageUrl,
      languages: {
        id: `${SITE_URL}/destinations/hidden-gem`,
        en: `${SITE_URL}/en/destinations/hidden-gem`,
      },
    },
  };
}

export default async function HiddenGemPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const hiddenGems = await fetchHiddenGems();

  return (
    <>
      <ItemListJsonLd
        items={hiddenGems.map((dest, index) => ({
          position: index + 1,
          name: dest.name,
          url: `${SITE_URL}/destinations/${dest.id}`,
        }))}
        pageName={locale === 'en' ? 'Hidden Gems Yogyakarta' : 'Hidden Gem Jogja'}
        pageUrl={locale === 'en' ? `${SITE_URL}/en/destinations/hidden-gem` : `${SITE_URL}/destinations/hidden-gem`}
        description={locale === 'en' ? 'Curated hidden gems in Yogyakarta' : 'Koleksi hidden gem Jogja terkurasi'}
      />
      <HiddenGemLandingClient destinations={hiddenGems} locale={locale} />
    </>
  );
}
