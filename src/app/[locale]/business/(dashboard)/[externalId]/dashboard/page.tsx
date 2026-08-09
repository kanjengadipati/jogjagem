"use client";

import { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useToast } from "@/components/Toast";
import BusinessHeader from "@/components/business-portal/BusinessHeader";
import {
  Settings,
  ArrowUpRight,
  Loader2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

interface BusinessInfo {
  id: string;
  name: string;
  category: string;
  status: string;
  avatar_url?: string;
}

interface ListingStats {
  promotions: number;
  reviews: number;
  avgRating: number;
  listings: number;
  activeListings: number;
}

export default function BusinessDashboardPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const routeParams = useParams();
  const routeExternalId = routeParams?.externalId as string | undefined;

  const [businesses, setBusinesses] = useState<BusinessInfo[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<BusinessInfo | null>(null);
  const [stats, setStats] = useState<Record<string, ListingStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedBiz) return;
    const placement = new URLSearchParams(window.location.search).get("placement");
    if (!placement) return;
    router.replace(`/business/${selectedBiz.id}/promotions?placement=${encodeURIComponent(placement)}`);
  }, [selectedBiz, router]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/businesses/me");
        const json = await res.json();
        const rawList: any[] = json?.data ?? [];
        const list: BusinessInfo[] = rawList.map((b) => ({
          id: b.external_id || String(b.id),
          name: b.name,
          category: b.category || "Wisata",
          status: b.status || "pending",
          avatar_url: b.avatar_url || "",
        }));
        if (cancelled) return;
        setBusinesses(list);
        if (list.length > 0) {
          const matched = list.find((b) => b.id === routeExternalId) || list[0];
          setSelectedBiz(matched);
          const statsMap: Record<string, ListingStats> = {};
          await Promise.all(
            list.map(async (biz) => {
              try {
                const [promoRes, reviewRes, listingRes] = await Promise.all([
                  fetch(`/api/businesses/me/${biz.id}/promotions`),
                  fetch(`/api/businesses/me/${biz.id}/reviews`),
                  fetch(`/api/businesses/me/${biz.id}/listings`),
                ]);
                const promos = (await promoRes.json())?.data ?? [];
                const reviews = (await reviewRes.json())?.data ?? [];
                const owned = (await listingRes.json())?.data ?? [];
                const withRating = reviews.filter((r: any) => (r.rating || 0) > 0);
                statsMap[biz.id] = {
                  promotions: promos.length,
                  reviews: reviews.length,
                  avgRating: withRating.length > 0
                    ? withRating.reduce((s: number, r: any) => s + (r.rating || 0), 0) / withRating.length : 0,
                  listings: Array.isArray(owned) ? owned.length : 0,
                  activeListings: Array.isArray(owned)
                    ? owned.filter((l: any) => !l.status || l.status === "approved" || l.status === "active").length : 0,
                };
              } catch {
                statsMap[biz.id] = { promotions: 0, reviews: 0, avgRating: 0, listings: 0, activeListings: 0 };
              }
            })
          );
          if (!cancelled) setStats(statsMap);
        }
      } catch {
        showToast("Error", "Failed to load dashboard data", "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [routeExternalId]);

  const totalListings  = Object.values(stats).reduce((s, v) => s + v.listings, 0);
  const activeListings = Object.values(stats).reduce((s, v) => s + v.activeListings, 0);
  const totalPromos    = Object.values(stats).reduce((s, v) => s + v.promotions, 0);
  const avgRating      = Object.values(stats).reduce((s, v) => s + v.avgRating, 0) || 0;
  const isPending      = selectedBiz?.status === "pending" || businesses.length === 0 || selectedBiz?.status === "draft";

  if (loading) {
    return (
      <>
        <BusinessHeader />
        <main className="flex-1 flex items-center justify-center bg-gold-50 py-32 text-royal-700/50 gap-3">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-xs font-semibold">Memuat dashboard…</span>
        </main>
      </>
    );
  }

  const userName = selectedBiz?.name?.split(" ")[0] ?? "Pemilik";

  return (
    <>
      <BusinessHeader />
      <main className="flex-1 flex flex-col overflow-hidden bg-gold-50">

        {/* ── Hero masthead ─────────────────────────────────────────── */}
        <div
          className="border-b border-[#F0E2C4] px-6 md:px-10 pt-6 pb-8 relative overflow-hidden bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/bg-hero-business.png')" }}
        >
          {/* warm overlay so text stays readable over the image */}
          <div className="absolute inset-0 bg-[#FAF3E6]/80 pointer-events-none" />

          {/* Pending badge — floating top-right of hero */}
          {isPending && (
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50/90 border border-amber-200 backdrop-blur-sm shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-amber-800 leading-tight">Menunggu verifikasi admin</p>
                <p className="text-[10px] text-amber-600/80">Diproses dalam 1×24 jam</p>
              </div>
            </div>
          )}

          <p className="relative z-10 font-mono text-[10px] tracking-[0.25em] uppercase text-[#B5781E]/60 mb-3">
            Business Portal
          </p>
          <h1 className="relative z-10 font-sans text-3xl md:text-4xl font-medium text-stone-900 leading-tight mb-2">
            Selamat datang,{" "}
            <span className="italic text-[#B5781E]">{userName}!</span>
          </h1>
          <p className="relative z-10 text-sm text-stone-500 font-sans max-w-md">
            Kelola dan kembangkan bisnis Anda di Jogja dari satu tempat.
          </p>

          {/* Stat cards — inside hero */}
          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
            {[
              {
                label: "Total Listings",   value: String(totalListings),  sub: "Listing",
                icon: "/business-icons/listings.svg",  iconBg: "bg-[#FEF3E2]",
                deco: "/business-icons/tugu-jogja.svg",
              },
              {
                label: "Aktif",            value: String(activeListings), sub: "Listing aktif",
                icon: "/business-icons/active.svg",    iconBg: "bg-emerald-50",
                deco: null, chart: true,
              },
              {
                label: "Promosi",          value: isPending ? "—" : String(totalPromos), sub: "Belum ada",
                icon: "/business-icons/promotion.svg", iconBg: "bg-[#FEF3E2]",
                deco: "/business-icons/marketing.svg",
              },
              {
                label: "Rating rata-rata", value: isPending || !avgRating ? "—" : avgRating.toFixed(1), sub: "Belum ada rating",
                icon: "/business-icons/rating.svg",    iconBg: "bg-[#FEF3E2]",
                deco: null, stars: true,
              },
            ].map((s) => (
              <div key={s.label} className="relative bg-white rounded-2xl border border-stone-100 shadow-sm p-5 overflow-hidden min-h-[130px] flex items-center gap-4">
                {/* Left: icon pill */}
                <div className={`w-12 h-12 rounded-2xl ${s.iconBg} flex items-center justify-center shrink-0`}>
                  <img src={s.icon} alt="" aria-hidden className="w-6 h-6" />
                </div>

                {/* Right: label + number + sub */}
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-bold text-stone-600">{s.label}</span>
                  <div className="font-sans text-4xl font-black text-stone-900 leading-none">{s.value}</div>
                  <div className="text-xs font-semibold text-stone-400 mt-0.5">{s.sub}</div>
                </div>

                {/* Chart decoration for "Aktif" */}
                {'chart' in s && s.chart && (
                  <svg className="absolute bottom-3 right-3 w-20 h-10" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 32 L18 24 L30 28 L44 16 L56 20 L68 8 L76 4" stroke="#20B982" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="4"  cy="32" r="3" fill="#20B982"/>
                    <circle cx="18" cy="24" r="3" fill="#20B982"/>
                    <circle cx="30" cy="28" r="3" fill="#20B982"/>
                    <circle cx="44" cy="16" r="3" fill="#20B982"/>
                    <circle cx="56" cy="20" r="3" fill="#20B982"/>
                    <circle cx="68" cy="8"  r="3" fill="#20B982"/>
                    <circle cx="76" cy="4"  r="3" fill="#20B982"/>
                  </svg>
                )}

                {/* Star decoration for "Rating" */}
                {'stars' in s && s.stars && (
                  <div className="absolute bottom-3 right-3 flex gap-0.5">
                    {[1,2,3].map(i => (
                      <svg key={i} className="w-4 h-4 text-stone-200" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                )}

                {/* Decorative illustration */}
                {s.deco && (
                  <img src={s.deco} alt="" aria-hidden className="absolute bottom-0 right-1 w-16 h-16 opacity-[0.15]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 md:px-10 py-6 space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Quick actions ─────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gold-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gold-100 flex items-center gap-2">
                <span className="font-manrope text-sm font-bold text-royal-900">Aksi Cepat</span>
              </div>
              <div className="divide-y divide-gold-100/80">
                {[
                  {
                    href: selectedBiz ? `/business/${selectedBiz.id}/listings` : "/business/listings",
                    icon: "/business-icons/listings.svg", iconBg: "bg-stone-100",
                    label: "Kelola Destinasi",
                    desc: "Kelola informasi destinasi dan detail bisnis Anda.",
                    locked: isPending,
                  },
                  {
                    href: selectedBiz ? `/business/${selectedBiz.id}/promotions` : "/business/promotions",
                    icon: "/business-icons/marketing.svg", iconBg: "bg-amber-50",
                    label: "Buat Promosi",
                    desc: "Buat promosi atau penawaran spesial untuk pelanggan.",
                    locked: isPending,
                  },
                  {
                    href: selectedBiz ? `/business/${selectedBiz.id}/reviews` : "/business/reviews",
                    icon: "/business-icons/reviews.svg", iconBg: "bg-blue-50",
                    label: "Lihat Reviews",
                    desc: "Lihat dan balas ulasan dari pelanggan Anda.",
                    locked: false,
                  },
                ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.locked ? "#" : item.href}
                      onClick={(e) => { if (item.locked) e.preventDefault(); }}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors group
                        ${item.locked ? "opacity-50 cursor-not-allowed" : "hover:bg-gold-50/60"}`}
                    >
                      <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                        <img src={item.icon} alt="" aria-hidden className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-royal-900">{item.label}</p>
                        <p className="text-[11px] text-royal-600/70 mt-0.5 font-sans">{item.desc}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 transition-transform duration-150
                        ${item.locked ? "text-royal-300" : "text-gold-400 group-hover:translate-x-0.5"}`}
                      />
                    </Link>
                  ))}
              </div>
            </div>

            {/* ── Business info ─────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gold-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gold-100 flex items-center justify-between">
                <span className="font-manrope text-sm font-bold text-royal-900">Informasi Bisnis</span>
                {selectedBiz && (
                  <Link
                    href={`/business/${selectedBiz.id}/settings`}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-gold-700 hover:text-gold-900 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                )}
              </div>

              {selectedBiz ? (
                <div className="p-6 space-y-5">
                  {/* Biz identity */}
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-royal-950 border border-stone-200 overflow-hidden shrink-0 flex items-center justify-center text-gold-400 font-sans font-extrabold text-lg">
                      {selectedBiz.avatar_url ? (
                        <img src={selectedBiz.avatar_url} alt={selectedBiz.name} className="w-full h-full object-cover" />
                      ) : (
                        selectedBiz.name.charAt(0)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-manrope font-bold text-royal-900 text-sm truncate">{selectedBiz.name}</p>
                      <p className="text-xs text-royal-500 mt-0.5">{selectedBiz.category}</p>
                      <span className={`inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full text-[10px] font-bold border
                        ${selectedBiz.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : selectedBiz.status === "pending"
                          ? "bg-amber-50 text-amber-700 border-amber-200"
                          : "bg-stone-100 text-stone-600 border-stone-200"}`}
                      >
                        {selectedBiz.status === "approved"
                          ? <><CheckCircle2 className="w-3 h-3" /> Terverifikasi</>
                          : selectedBiz.status === "pending"
                          ? <><AlertTriangle className="w-3 h-3" /> Menunggu Verifikasi</>
                          : selectedBiz.status}
                      </span>
                    </div>
                  </div>

                  {/* Suggestion cards */}
                  <div className="space-y-3">
                    <Link
                      href={isPending ? "#" : `/business/${selectedBiz.id}/promotions`}
                      onClick={(e) => { if (isPending) e.preventDefault(); }}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors
                        ${isPending ? "opacity-50 cursor-not-allowed border-gold-100 bg-gold-50/30" :
                          "border-gold-200/60 bg-gold-50/40 hover:bg-gold-50 hover:border-gold-300"}`}
                    >
                      <TrendingUp className="w-4 h-4 text-gold-600 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-royal-900">Tingkatkan visibilitas bisnis Anda</p>
                        <p className="text-[11px] text-royal-600/70 mt-0.5">Promosikan bisnis agar lebih mudah ditemukan wisatawan.</p>
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-gold-700">
                          Buat Promosi <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>

                    <Link
                      href={`/business/${selectedBiz.id}/settings`}
                      className="flex items-center gap-3 p-3.5 rounded-xl border border-royal-100 bg-royal-50/40 hover:bg-royal-50 hover:border-royal-200 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-royal-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-royal-900">Lengkapi profil bisnis Anda</p>
                        <p className="text-[11px] text-royal-600/70 mt-0.5">Informasi lengkap membantu meningkatkan kepercayaan pelanggan.</p>
                        <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-bold text-royal-700">
                          Lengkapi Sekarang <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-xs text-royal-400 text-center py-12">
                  Tidak ada bisnis terdaftar
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
