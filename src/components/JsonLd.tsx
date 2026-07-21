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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://jogjagem.com';
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

interface EventJsonLdProps {
  name: string;
  description: string;
  image?: string;
  url: string;
  startDate: string;
  endDate?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  offers?: {
    price?: string;
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
  offers,
}: EventJsonLdProps) {
  const data: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    description,
    url,
    startDate,
  };

  if (endDate) {
    data.endDate = endDate;
  }

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
    data.offers = {
      '@type': 'Offer',
      url,
      ...offers,
    };
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
