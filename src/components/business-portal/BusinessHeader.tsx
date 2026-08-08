"use client";

import { useState, useEffect } from "react";
import { Bell, ChevronDown, LogOut, Settings, Menu, ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/navigation";
import { useSidebar } from "@/contexts/SidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "@/contexts/LocaleContext";

export default function BusinessHeader() {
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const { toggleMobileSidebar } = useSidebar();
  const router = useRouter();
  const { logout } = useAuth();
  const { locale } = useLocale();
  const params = useParams();
  const externalId = typeof params?.externalId === "string" ? params.externalId : undefined;
  const settingsHref = externalId
    ? `/business/${externalId}/settings`
    : "/business/settings";
  const [user, setUser] = useState({
    name: "Pemilik Bisnis",
    role: "Business Owner",
    avatar: "B",
  });
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    // Fetch profile info
    fetch("/api/me")
      .then((r) => r.json())
      .then((res) => {
        if (res.status === "success" && res.data) {
          setUser({
            name: res.data.name || "Pemilik Bisnis",
            role: "Business Owner",
            avatar: res.data.name ? res.data.name.charAt(0).toUpperCase() : "B",
          });
        }
      })
      .catch(() => {});

    const updateTime = () => {
      const now = new Date();
      setDateStr(
        now.toLocaleDateString("id-ID", {
          weekday: "short",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      );
      setTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    // Sinkronkan cookie locale dengan locale URL saat ini supaya middleware
    // next-intl tidak me-redirect ke /en akibat cookie NEXT_LOCALE yang basi.
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`;
    router.push("/");
  };

  return (
    <header className="h-20 bg-white border-b border-stone-200/80 px-6 md:px-8 flex items-center justify-between z-30 relative">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Top Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600">
          <span>Jogjagem</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-stone-900 font-bold">Business Portal</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* Realtime Date & Time */}
        <div className="hidden sm:flex flex-col items-end text-right">
          <span className="text-xs font-bold text-stone-800">
            {dateStr || "Hari ini"}
          </span>
          <span className="text-[11px] font-medium text-stone-400">
            {timeStr} WIB
          </span>
        </div>

        {/* Notification Bell Icon */}
        <div className="relative">
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="w-10 h-10 rounded-full border border-stone-200/80 bg-white hover:bg-stone-50 flex items-center justify-center text-stone-600 transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          </button>
        </div>

        {/* User Profile Badge */}
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-1 pr-2.5 rounded-full border border-stone-200/80 bg-white hover:bg-stone-50 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#B57A21] text-white text-xs font-bold flex items-center justify-center">
              {user.avatar}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-stone-900 leading-tight">
                {user.name}
              </span>
              <span className="text-[10px] font-medium text-stone-400">
                {user.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-lg border border-stone-200 p-2 z-50">
              <Link
                href={settingsHref}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-50"
              >
                <Settings className="w-4 h-4 text-stone-500" />
                <span>Pengaturan</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
