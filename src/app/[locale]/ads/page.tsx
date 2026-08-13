import { Metadata } from 'next';
import AdsLandingClient from './AdsLandingClient';

export const metadata: Metadata = {
  title: 'Pasang Iklan & Promosi',
  description: 'Jangkau ribuan wisatawan dan pengunjung Yogyakarta setiap hari. Promosikan destinasi, kuliner, hotel, dan usaha Anda di posisi paling depan Jogjagem.',
};

export default function AdsPage() {
  return <AdsLandingClient />;
}
