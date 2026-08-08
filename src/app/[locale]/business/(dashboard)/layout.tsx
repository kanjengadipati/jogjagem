import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { SidebarProvider } from "@/contexts/SidebarContext";
import BusinessSidebar from "@/components/business-portal/BusinessSidebar";
import { ToastProvider } from "@/components/Toast";

/**
 * Shell layout untuk semua halaman business dashboard (cloned dari
 * jogjagem-admin /business/layout.tsx). Hanya sidebar yang dirender di sini —
 * BusinessHeader dirender per panel/page, mengikuti pola admin.
 */
export default async function BusinessDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getSession();
  if (!token) redirect("/");

  return (
    <ToastProvider>
      <SidebarProvider>
        <div className="flex min-h-screen relative">
          <BusinessSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}
