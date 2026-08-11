"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, LogOut, Settings, Menu, ChevronRight, ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";
import Image from "next/image";

export default function BusinessHeader() {
  const [showProfile, setShowProfile] = useState(false);
  const { toggleMobileSidebar } = useSidebar();
  const router = useRouter();
  const { logout } = useAuth();
  const { locale } = useLocale();
  const params = useParams();
  const externalId = typeof params?.externalId === "string" ? params.externalId : undefined;
  const settingsHref = externalId ? `/business/${externalId}/settings` : "/business/settings";

  const [user, setUser] = useState({ name: "Pemilik Bisnis", role: "Business Owner", initial: "B" });
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          const name = res.data.name || "Pemilik Bisnis";
          setUser({ name, role: "Business Owner", initial: name.charAt(0).toUpperCase() });
        }
      })
      .catch(() => {});

    const tick = () => {
      const now = new Date();
      setDateStr(now.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "long", year: "numeric" }));
      setTimeStr(now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleLogout = async () => {
    await logout();
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    router.push("/");
  };

  return (
    <header className="h-16 bg-white border-b border-stone-200/80 px-4 md:px-6 flex items-center justify-between z-30 relative shrink-0">
      {/* Left — mobile hamburger + back to portal + breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link
          href="/"
          title="Kembali ke Portal Utama"
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Portal Utama</span>
        </Link>
        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-500">
          <span>Jogjagem</span>
          <ChevronRight className="w-3 h-3 text-stone-300" />
          <span className="text-stone-900 font-bold">Business Portal</span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {/* Date + time */}
        <div className="hidden lg:flex flex-col items-end text-right">
          <span className="text-xs font-semibold text-stone-800">{dateStr || "Hari ini"}</span>
          <span className="text-[10px] font-mono text-stone-400">{timeStr} WIB</span>
        </div>

        {/* Notification bell */}
        <button className="relative w-9 h-9 rounded-full border border-stone-200 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-500 transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-gold-500 rounded-full" />
        </button>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full border border-stone-200 bg-white hover:bg-stone-50 transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#B57A21] text-white text-xs font-bold flex items-center justify-center shrink-0">
              {user.initial}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-stone-900 leading-tight">{user.name}</span>
              <span className="text-[10px] text-stone-400">{user.role}</span>
            </div>
            <ChevronDown className={`w-3 h-3 text-stone-400 transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`} />
          </button>

          {showProfile && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProfile(false)} />
              <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-2xl shadow-lg p-2 z-50">
                <div className="px-3 py-2 border-b border-stone-100 mb-1">
                  <p className="text-xs font-bold text-stone-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-stone-400">Business Owner</p>
                </div>
                <Link
                  href={settingsHref}
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-stone-400" />
                  <span>Pengaturan</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors mt-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
