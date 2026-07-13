import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Explore Jogja — AI Tourism Discovery',
  description: 'Discover Yogyakarta with AI-powered recommendations',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
