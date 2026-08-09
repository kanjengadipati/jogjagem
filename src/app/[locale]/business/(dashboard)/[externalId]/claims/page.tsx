"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BusinessHeader from "@/components/business-portal/BusinessHeader";
import { FileCheck, Loader2, CheckCircle2, XCircle, Clock, MapPin } from "lucide-react";

interface ListingClaim {
  id: string;
  listing_type: string;
  listing_external_id: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  submitted_at?: string;
}

const LISTING_LABELS: Record<string, string> = {
  destination: "Wisata & Destinasi",
  restaurant: "Kuliner",
  hotel: "Hotel & Penginapan",
  souvenir: "Oleh-oleh",
  rental: "Jasa / Rental",
  guide: "Guide Lokal",
  event: "Event",
};

function listingTypeLabel(type: string): string {
  return LISTING_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

function humanizeListingName(id: string): string {
  if (!id) return "—";
  if (/^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(id)) {
    return id.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return id;
}

function statusBadge(status: ListingClaim["status"]) {
  switch (status) {
    case "approved":
      return {
        className: "bg-emerald-100 text-emerald-800 border border-emerald-300",
        label: "Disetujui",
        Icon: CheckCircle2,
      };
    case "rejected":
      return {
        className: "bg-rose-100 text-rose-800 border border-rose-300",
        label: "Ditolak",
        Icon: XCircle,
      };
    default:
      return {
        className: "bg-amber-100 text-amber-800 border border-amber-300",
        label: "Menunggu Verifikasi",
        Icon: Clock,
      };
  }
}

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BusinessClaimsPage() {
  const params = useParams();
  const externalId = typeof params?.externalId === "string" ? params.externalId : "";
  const [claims, setClaims] = useState<ListingClaim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!externalId) return;
    fetch(`/api/businesses/me/${externalId}/claims`)
      .then((r) => r.json())
      .then((d) => setClaims(d?.data ?? (Array.isArray(d) ? d : [])))
      .catch(() => setClaims([]))
      .finally(() => setLoading(false));
  }, [externalId]);

  return (
    <>
      <BusinessHeader />
      <main className="flex-1 overflow-y-auto bg-gold-50 p-5 md:p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900 font-sans flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-600" />
            Klaim Bisnis
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Riwayat pengajuan klaim kepemilikan listing Anda
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-stone-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Memuat klaim...</span>
          </div>
        ) : claims.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-stone-200 rounded-3xl bg-white shadow-xs">
            <FileCheck className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-stone-900">Belum ada pengajuan klaim</h3>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Ajukan klaim listing dari halaman Kelola Destinasi.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {claims.map((claim) => {
              const badge = statusBadge(claim.status);
              const BadgeIcon = badge.Icon;
              return (
                <div
                  key={claim.id}
                  className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-stone-900">
                        {humanizeListingName(claim.listing_external_id)}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 shrink-0">
                        {listingTypeLabel(claim.listing_type)}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3 shrink-0" />
                      Dikirim: {fmtDate(claim.submitted_at)}
                    </p>
                    {claim.status === "rejected" && claim.rejection_reason && (
                      <p className="text-[11px] text-rose-600 font-medium bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1.5 mt-1">
                        Alasan penolakan: {claim.rejection_reason}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold shrink-0 ${badge.className}`}
                  >
                    <BadgeIcon className="w-3 h-3" />
                    {badge.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
