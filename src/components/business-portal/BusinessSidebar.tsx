"use client";

import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useSidebar } from "@/contexts/SidebarContext";
import Image from "next/image";
import {
  LayoutDashboard,
  MapPin,
  Megaphone,
  MessageSquare,
  CreditCard,
  Settings,
  Lock,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  ArrowRight,
  FileCheck,
  Users,
  Sparkles,
} from "lucide-react";

interface BusinessOption {
  id: string;
  name: string;
  category: string;
  status: string;
  avatar_url?: string;
}

const PLAN_BADGES: Record<string, { label: string; className: string }> = {
  pro:           { label: "PRO",        className: "bg-gold-400/20 text-gold-700" },
  business_plus: { label: "BUSINESS+",  className: "bg-violet-100 text-violet-700" },
  enterprise:    { label: "ENTERPRISE", className: "bg-royal-900 text-gold-400" },
};

export default function BusinessSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const externalId = typeof params?.externalId === "string" ? params.externalId : undefined;

  const [collapsed, setCollapsed] = useState(false);
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();
  const [businesses, setBusinesses] = useState<BusinessOption[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<BusinessOption | null>(null);
  const [plan, setPlan] = useState<string>("free");

  useEffect(() => {
    async function loadBiz() {
      try {
        const res = await fetch("/api/businesses/me");
        const json = await res.json();
        const list: any[] = json?.data ?? [];
        if (Array.isArray(list) && list.length > 0) {
          const mapped = list.map((b) => ({
            id: b.external_id || String(b.id),
            name: b.name || "Bisnis Saya",
            category: b.category || "Wisata & Destinasi",
            status: b.status || "pending",
            avatar_url: b.avatar_url || "",
          }));
          setBusinesses(mapped);
          const chosen = externalId
            ? mapped.find((b) => b.id === externalId) ?? mapped[0]
            : mapped[0];
          setSelectedBiz(chosen);
        } else {
          const defaultBiz = { id: "default", name: "Bisnis Saya", category: "Wisata & Destinasi", status: "pending" };
          setBusinesses([defaultBiz]);
          setSelectedBiz(defaultBiz);
        }
      } catch {
        const defaultBiz = { id: "default", name: "Bisnis Saya", category: "Wisata & Destinasi", status: "pending" };
        setBusinesses([defaultBiz]);
        setSelectedBiz(defaultBiz);
      }
    }
    loadBiz();
  }, [externalId]);

  useEffect(() => {
    if (externalId && businesses.length > 0) {
      const found = businesses.find((b) => b.id === externalId);
      if (found) setSelectedBiz(found);
    }
  }, [externalId, businesses]);

  useEffect(() => {
    if (!selectedBiz || selectedBiz.id === "default") { setPlan("free"); return; }
    let cancelled = false;
    fetch(`/api/businesses/me/${selectedBiz.id}/subscription`)
      .then((r) => r.json())
      .then((json) => {
        const data = json?.data ?? json;
        if (!cancelled && data && typeof data === "object" && data.plan) setPlan(data.plan);
      })
      .catch(() => { if (!cancelled) setPlan("free"); });
    return () => { cancelled = true; };
  }, [selectedBiz]);

  const handleLinkClick = (e: React.MouseEvent, locked: boolean) => {
    if (locked) { e.preventDefault(); return; }
    if (isMobileOpen) toggleMobileSidebar();
  };

  const isPending = selectedBiz?.status === "pending" || businesses.length === 0 || selectedBiz?.status === "draft";

  const dashboardHref = selectedBiz?.id && selectedBiz.id !== "default"
    ? `/business/${selectedBiz.id}/dashboard`
    : "/business";

  const biz = (path: string) =>
    selectedBiz?.id && selectedBiz.id !== "default" ? `/business/${selectedBiz.id}/${path}` : `/business/${path}`;

  const menuItems = [
    { name: "Dashboard",        icon: LayoutDashboard, path: dashboardHref,          locked: false },
    { name: "Kelola Destinasi", icon: MapPin,           path: biz("listings"),        locked: isPending },
    { name: "Klaim Bisnis",     icon: FileCheck,        path: biz("claims"),          locked: false },
    { name: "Tim",              icon: Users,            path: biz("team"),            locked: false },
    { name: "Marketing",        icon: Megaphone,        path: biz("promotions"),      locked: isPending },
    { name: "Reviews",          icon: MessageSquare,    path: biz("reviews"),         locked: false },
    { name: "Langganan",        icon: CreditCard,       path: biz("subscriptions"),   locked: isPending },
    { name: "Pengaturan",       icon: Settings,         path: biz("settings"),        locked: false },
  ];

  return (
    <>
      {isMobileOpen && (
        <div onClick={toggleMobileSidebar} className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs z-40 md:hidden" />
      )}

      <aside className={`fixed md:sticky top-0 left-0 h-screen bg-[#FDFBF7] bg-[url('/bg-sidebar-business.png')] bg-cover bg-center bg-no-repeat border-r border-stone-200/80 z-50 flex flex-col transition-all duration-300 overflow-hidden
        ${collapsed ? "w-[72px]" : "w-64"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex absolute -right-3 top-8 w-6 h-6 bg-white border border-stone-200 rounded-full items-center justify-center text-stone-500 hover:text-stone-900 shadow-sm z-50 cursor-pointer"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Mobile close */}
        <button onClick={toggleMobileSidebar} className="md:hidden absolute right-4 top-4 text-stone-400 hover:text-stone-700">
          <X className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div className={`flex items-center gap-3 border-b border-stone-200/60 ${collapsed ? "p-4 justify-center" : "px-5 py-4"}`}>
          <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center shrink-0">
            <Image src="/logo-gold-new.png" alt="Jogjagem" width={22} height={22} className="object-contain" />
          </div>
          {!collapsed && (
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-manrope font-extrabold text-sm text-stone-900 tracking-widest">JOGJAGEM</span>
                {PLAN_BADGES[plan] && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${PLAN_BADGES[plan].className}`}>
                    {PLAN_BADGES[plan].label}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gold-600 font-semibold tracking-widest uppercase">Business Portal</p>
            </div>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4">

          {/* Business switcher */}
          {!collapsed && (
            <div className="px-3 mb-4">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2 px-1">Bisnis Aktif</p>
              <div className="flex items-center gap-2.5 p-2.5 bg-white/70 rounded-2xl border border-stone-200/60 shadow-xs">
                {/* Logo or initial */}
                <div className="w-8 h-8 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center text-stone-500 font-bold text-xs">
                  {selectedBiz?.avatar_url ? (
                    <img src={selectedBiz.avatar_url} alt={selectedBiz.name} className="w-full h-full object-cover" />
                  ) : (
                    (selectedBiz?.name || "B").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="relative flex-1 min-w-0">
                  <select
                    value={selectedBiz?.id || ""}
                    onChange={(e) => {
                      const found = businesses.find((b) => b.id === e.target.value);
                      if (found) { setSelectedBiz(found); router.push(`/business/${found.id}/dashboard`); }
                    }}
                    className="w-full appearance-none bg-transparent border-none text-xs font-bold text-stone-800 focus:outline-none cursor-pointer truncate pr-5"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {/* Nav */}
          <nav className="px-2 space-y-0.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path ||
                (item.path !== "/business" && pathname.startsWith(item.path));

              return (
                <Link
                  key={item.name}
                  href={item.locked ? "#" : item.path}
                  onClick={(e) => handleLinkClick(e, item.locked)}
                  title={collapsed ? item.name : undefined}
                  className={`flex items-center ${collapsed ? "justify-center px-0" : "justify-between px-3"} py-2.5 rounded-2xl text-xs font-bold transition-all group
                    ${item.locked
                      ? "text-stone-400 cursor-not-allowed"
                      : isActive
                      ? "bg-[#FAF3E6] text-[#B5781E] border border-[#F2E3C6] shadow-xs"
                      : "text-stone-700 hover:bg-white/60 hover:text-stone-900"}`}
                >
                  <div className={`flex items-center ${collapsed ? "" : "gap-3"}`}>
                    <Icon className={`w-4 h-4 shrink-0 transition-opacity ${item.locked ? "opacity-40" : isActive ? "text-[#B5781E]" : "text-stone-500 group-hover:text-stone-700"}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer — upgrade prompt */}
        {!collapsed && plan === "free" && (
          <div className="p-3 border-t border-stone-200/60">
            <Link
              href={selectedBiz?.id ? `/business/${selectedBiz.id}/subscriptions` : "/business/subscriptions"}
              className="p-3 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-center justify-between gap-2 hover:bg-gold-50 hover:border-gold-200 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-gold-500 shrink-0" />
                <div>
                  <p className="text-[11px] font-extrabold text-stone-900">Paket Gratis</p>
                  <p className="text-[9px] text-stone-400 font-semibold">Upgrade ke Business Pro</p>
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
