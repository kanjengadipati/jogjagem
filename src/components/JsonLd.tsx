interface JsonLdProps {
  data: Record<string, any>;
}

export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.jogjagem.com';
const SITE_NAME = 'Jogjagem';

export function WebsiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: 'Jelajahi Yogyakarta dengan rekomendasi AI. Panduan wisata lengkap 100+ destinasi.',
    inLanguage: 'id',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/destinations?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
  return <JsonLd data={data} />;
}

interface TouristDestinationJsonLdProps {
  name: string;
  description: string;
  image?: string;
  url: string;
  latitude?: number;
  longitude?: number;
  rating?: number;
  reviewCount?: number;
  address?: string;
  category?: string;
  openingHours?: string;
}

export function TouristDestinationJsonLd({
  name,
  description,
  image,
  url,
  latitude,
  longitude,
  rating,
  reviewCount,
  address,
  category,
  openingHours,
}: TouristDestinationJsonLdProps) {
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name,
    description,
    url,
  };

  if (image) {
    data.image = image;
  }

  if (latitude && longitude) {
    data.geo = {
      '@type': 'GeoCoordinates',
      latitude,
      longitude,
    };
  }

  if (address) {
    data.address = {
      '@type': 'PostalAddress',
      addressLocality: 'Yogyakarta',
      addressRegion: 'DI Yogyakarta',
      addressCountry: 'ID',
      streetAddress: address,
    };
  }

  if (category) {
    data.touristType = category;
  }

  if (rating && reviewCount) {
    data.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (openingHours) {
    data.openingHours = openingHours;
  }

  return <JsonLd data={data} />;
}

interface BreadcrumbJsonLdProps {
  items: { name: string; url: string }[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return <JsonLd data={data} />;
}

interface FAQJsonLdProps {
  items: { question: string; answer: string }[];
}

/** Parse a free-form price string into a plain number for schema.org (which requires a numeric `price`). */
function normalizePrice(raw?: string | number): number | null {
  if (raw === undefined || raw === null) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;

  const s = String(raw).trim();
  if (!s) return null;

  const lower = s.toLowerCase();
  if (lower === 'gratis' || lower === 'free' || lower === '0' || lower === '0,00' || lower === '0.00') {
    return 0;
  }

  // Take the first value of a price range: "25.000 - 50.000", "25.000 s/d 50.000", "25.000–50.000"
  const firstPart = s.split(/\s*(?:[-–—]|\bs\/d\b|\bsd\b|sampai|\bto\b)\s*/i)[0] || s;
  // Strip currency symbols and thousand separators, then convert a comma decimal to a dot.
  const cleaned = firstPart.replace(/[^0-9.,]/g, '').replace(/\./g, '').replace(',', '.');
  const num = Number(cleaned);
  return Number.isFinite(num) && num >= 0 ? num : null;
}

/** Map event dates to the closest schema.org EventStatus. */
function computeEventStatus(startDate: string, endDate: string): string {
  const end = new Date(endDate).getTime();
  if (Number.isFinite(end) && end < Date.now()) {
    return 'https://schema.org/EventPast';
  }
  return 'https://schema.org/EventScheduled';
}

interface EventJsonLdProps {
  name: string;
  description?: string;
  image?: string;
  url: string;
  startDate: string;
  endDate?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  organizer?: string;
  performer?: string;
  offers?: {
    price?: string | number;
    priceCurrency?: string;
    availability?: string;
  };
}

export function EventJsonLd({
  name,
  description,
  image,
  url,
  startDate,
  endDate,
  location,
  latitude,
  longitude,
  organizer,
  performer,
  offers,
}: EventJsonLdProps) {
  const effectiveEndDate = endDate || startDate;
  const status = computeEventStatus(startDate, effectiveEndDate);
  const orgName = organizer || performer || name;

  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description: description || `${name} — Informasi lengkap event di Yogyakarta.`,
    url,
    startDate,
    endDate: effectiveEndDate,
    eventStatus: status,
    organizer: {
      '@type': 'Organization',
      name: orgName,
      url,
    },
    performer: {
      '@type': 'Organization',
      name: performer || orgName,
      url,
    },
  };

  if (image) {
    data.image = image;
  }

  if (location) {
    data.location = {
      '@type': 'Place',
      name: location,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Yogyakarta',
        addressRegion: 'DI Yogyakarta',
        addressCountry: 'ID',
      },
    };
    if (latitude && longitude) {
      data.location.geo = {
        '@type': 'GeoCoordinates',
        latitude,
        longitude,
      };
    }
  }

  if (offers) {
    const price = normalizePrice(offers.price);
    if (price !== null) {
      data.offers = {
        '@type': 'Offer',
        url,
        price,
        priceCurrency: offers.priceCurrency || 'IDR',
        availability: offers.availability || (
          status === 'https://schema.org/EventPast' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock'
        ),
        validFrom: startDate,
        validThrough: effectiveEndDate,
      };
    }
  }

  return <JsonLd data={data} />;
}

export function FAQJsonLd({ items }: FAQJsonLdProps) {
  if (!items.length) return null;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
  return <JsonLd data={data} />;
}
