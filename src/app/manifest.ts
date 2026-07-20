import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Jogjagem — Jelajahi Yogyakarta Lebih Dalam',
    short_name: 'Jogjagem',
    description: 'Panduan wisata AI untuk Yogyakarta. Temukan 100+ destinasi wisata terbaik.',
    start_url: '/',
    display: 'standalone',
    background_color: '#faf9f6',
    theme_color: '#1a1533',
    icons: [
      {
        src: '/favicon-gold.png',
        sizes: '48x48',
        type: 'image/png',
      },
      {
        src: '/logo-gold-new.png',
        sizes: '156x181',
        type: 'image/png',
      },
    ],
  };
}
