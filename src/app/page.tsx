'use client';

import { AuthProvider } from '@/contexts/AuthContext';
import App from '@/App';

export default function HomePage() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}
