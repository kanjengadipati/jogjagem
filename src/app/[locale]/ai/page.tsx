import type { Metadata } from 'next';
import AIPageClient from './AIPageClient';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === 'en';
  const title = isEn ? 'AI Assistant — Jogjagem' : 'Asisten AI — Jogjagem';
  const description = isEn
    ? 'Ask AI for travel recommendations in Yogyakarta. Get travel advice, destination recommendations, and vacation tips.'
    : 'Tanya AI untuk rekomendasi wisata di Yogyakarta. Dapatkan saran perjalanan, rekomendasi destinasi, dan tips liburan.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default function AIPage() {
  return <AIPageClient />;
}
