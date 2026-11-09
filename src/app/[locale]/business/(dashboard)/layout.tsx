'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import BusinessSidebar from '@/components/business-portal/BusinessSidebar';
import { ToastProvider } from '@/components/Toast';

export default function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-xs text-stone-400">
        Memuat...
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return (
    <ToastProvider>
      <SidebarProvider>
        <div className="flex h-screen relative">
          <BusinessSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden h-full">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}