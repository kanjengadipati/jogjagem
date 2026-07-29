'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { partners, partnerApplications } from '@/lib/api';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { Briefcase, CheckCircle2, Clock, XCircle, ExternalLink, Save } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import type { BePartner, BePartnerApplication } from '@/lib/api';

const CATEGORIES = [
  'Hotel', 'Restaurant', 'Cafe', 'Tour Guide', 'Transport',
  'Souvenir', 'Activity', 'Spa', 'Nightlife', 'Other',
];

function HeroBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="relative bg-[#0f100c] text-white overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1707378174003-418d6262d355?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHVndSUyMGpvZ2phfGVufDB8fDB8fHww"
          alt="Tugu Jogja"
          fill
          priority
          className="object-cover opacity-90 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f100c]/90 via-[#0f100c]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f100c]/60 via-transparent to-[#0f100c]/30" />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <p className="text-xs font-mono text-gold-400 uppercase tracking-widest mb-1.5">Jogjagem Partner</p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">{title}</h1>
        <p className="text-sm text-white/75 leading-relaxed max-w-lg font-light mt-3">{subtitle}</p>
      </div>
    </section>
  );
}

function ApplicationStatusCard({
  application, onReapply,
}: {
  application: BePartnerApplication;
  onReapply: () => void;
}) {
  const s = application.status === 'pending'
    ? { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Aplikasi Sedang Ditinjau' }
    : { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Aplikasi Ditolak' };
  const StatusIcon = s.icon;

  return (
    <div className="min-h-screen bg-stone-50">
      <HeroBanner title="Status Aplikasi Anda" subtitle="Berikut status aplikasi kemitraan bisnis Anda." />
      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-16">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
              <StatusIcon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">{application.business_name}</h2>
              <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
            </div>
          </div>
          {application.status === 'pending' && (
            <p className="text-xs text-stone-400 text-center">Tim kami sedang meninjau kelayakan bisnis Anda. Proses biasanya 1-3 hari kerja.</p>
          )}
          {application.status === 'rejected' && (
            <>
              {application.rejection_reason && (
                <p className="text-xs text-stone-600 bg-stone-50 rounded-lg p-3">{application.rejection_reason}</p>
              )}
              <button onClick={onReapply} className="w-full py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600">Ajukan Ulang</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CompleteListingForm({ listing, onSubmitted }: { listing: BePartner; onSubmitted: () => void }) {
  const [form, setForm] = useState({
    description: listing.description || '',
    address: listing.address || '',
    image: listing.image || '',
    website: listing.website || '',
    price: listing.price || '',
    latitude: listing.latitude || 0,
    longitude: listing.longitude || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleSaveDraft() {
    setSaving(true);
    await partners.update(listing.id, form);
    setSaving(false);
  }

  async function handleSubmitForReview() {
    setSaving(true);
    setError('');
    await handleSaveDraft();
    const res = await partners.submitForReview(listing.id);
    if (res.status === 'success') {
      onSubmitted();
    } else {
      setError(res.message || 'Lengkapi deskripsi dan alamat sebelum submit.');
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <HeroBanner title="Lengkapi Listing Anda" subtitle={`Aplikasi '${listing.name}' disetujui — lengkapi detail berikut agar listing Anda bisa mulai ditinjau untuk tayang.`} />
      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-16">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-lg">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Alamat Lengkap *</label>
            <input name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">URL Gambar</label>
            <input name="image" value={form.image} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Website</label>
              <input name="website" value={form.website} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Harga</label>
              <input name="price" value={form.price} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50" />
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveDraft} disabled={saving} className="flex-1 py-3 border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 disabled:opacity-50 flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Simpan Draft
            </button>
            <button onClick={handleSubmitForReview} disabled={saving} className="flex-1 py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 disabled:opacity-50">
              Submit untuk Ditinjau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PartnerPage() {
  const { isAuthenticated, isLoading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [myApplication, setMyApplication] = useState<BePartnerApplication | null>(null);
  const [myListing, setMyListing] = useState<BePartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    business_name: '',
    category: '',
    location: '',
    phone: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { setLoading(false); return; }

    Promise.all([partners.getMine(), partnerApplications.getMine()]).then(([listingRes, appRes]) => {
      if (listingRes.status === 'success' && Array.isArray(listingRes.data) && listingRes.data.length > 0) {
        setMyListing(listingRes.data[0]);
      }
      if (appRes.status === 'success' && Array.isArray(appRes.data) && appRes.data.length > 0) {
        setMyApplication(appRes.data[0]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated, authLoading, submitted]);

  const resetToForm = () => {
    setMyApplication(null);
    setMyListing(null);
    setSubmitted(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.business_name || !form.category) {
      setError('Nama usaha dan kategori wajib diisi.');
      return;
    }
    setSubmitting(true);
    setError('');
    const res = await partnerApplications.apply(form);
    if (res.status === 'success') {
      setSubmitted(true);
      await refreshProfile();
    } else {
      setError(res.message || 'Gagal mengajukan. Silakan coba lagi.');
    }
    setSubmitting(false);
  };

  const existingStatusCard = myListing && myListing.status !== 'draft';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50">
        <HeroBanner title="Jadi Mitra Bisnis" subtitle="Daftarkan usaha Anda dalam 1 menit — lengkapi detail listing setelah disetujui." />
        <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-16">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7 text-gold-600" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">Mulai Sekarang</h2>
              <p className="text-xs text-stone-500 mt-1">Masuk atau daftar untuk mengajukan bisnis Anda sebagai mitra Jogjagem.</p>
            </div>
            <button onClick={() => setShowAuthModal(true)} className="px-6 py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-colors">Masuk / Daftar</button>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  // State 4: Listing sudah disubmit (pending/approved/rejected/suspended) — existing card
  if (existingStatusCard) {
    const status = myListing!.status || 'pending';
    const statusConfig = {
      pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Sedang Direview' },
      approved: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Disetujui' },
      rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Ditolak' },
      suspended: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Ditangguhkan' },
    } as const;
    const sc = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = sc.icon;

    return (
      <div className="min-h-screen bg-stone-50">
        <HeroBanner title="Status Listing Anda" subtitle="Berikut status listing bisnis Anda di Jogjagem." />
        <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-16">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${sc.bg} border ${sc.border} flex items-center justify-center`}>
                <StatusIcon className={`w-5 h-5 ${sc.color}`} />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-stone-900">{myListing!.name}</h2>
                <p className={`text-xs font-semibold ${sc.color}`}>{sc.label}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">Kategori</span>
                <span className="font-medium text-stone-800">{myListing!.category}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-stone-100">
                <span className="text-stone-500">Lokasi</span>
                <span className="font-medium text-stone-800">{myListing!.location || '-'}</span>
              </div>
            </div>
            {status === 'approved' && (
              <a href={`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'}/partner`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-colors">
                Dashboard Partner <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {status === 'approved' && myListing!.is_sponsored && myListing!.sponsor_payment_status !== 'paid' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 leading-relaxed">
                <p className="font-semibold mb-0.5">Menunggu konfirmasi pembayaran</p>
                <p className="text-xs text-amber-700 font-normal">Listing Anda ditandai sebagai sponsor namun pembayaran belum kami terima.</p>
              </div>
            )}
            {status === 'approved' && myListing!.is_sponsored && myListing!.sponsor_payment_status === 'paid' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 leading-relaxed">
                <p className="font-semibold mb-0.5">Sponsorship aktif</p>
                {myListing!.sponsor_end_at ? (
                  <p className="text-xs text-emerald-700 font-normal">Berlaku hingga {new Date(myListing!.sponsor_end_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.</p>
                ) : (
                  <p className="text-xs text-emerald-700 font-normal">Listing Anda tampil sebagai sponsor di halaman pencarian Jogjagem.</p>
                )}
              </div>
            )}
            {status === 'pending' && <p className="text-xs text-stone-400 text-center">Listing Anda sedang ditinjau oleh tim kami. Proses biasanya memakan waktu 1-3 hari kerja.</p>}
            {status === 'rejected' && <p className="text-xs text-stone-500 text-center">Pengajuan ditolak. Silakan hubungi tim kami untuk informasi lebih lanjut.</p>}
          </div>
        </div>
      </div>
    );
  }

  // State 3: Aplikasi disetujui + listing draft — form lengkap
  if (myListing?.status === 'draft') {
    return <CompleteListingForm listing={myListing} onSubmitted={() => setSubmitted(true)} />;
  }

  // State 2: Sudah apply, aplikasi belum approved/ditolak — ApplicationStatusCard
  if (myApplication && myApplication.status !== 'approved') {
    return <ApplicationStatusCard application={myApplication} onReapply={resetToForm} />;
  }

  // State 1: Belum apply sama sekali — form ringan
  return (
    <div className="min-h-screen bg-stone-50">
      <HeroBanner title="Jadi Mitra Bisnis" subtitle="Daftarkan usaha Anda dalam 1 menit — lengkapi detail listing setelah disetujui." />
      <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-16">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">Daftarkan Usaha Anda</h2>
              <p className="text-xs text-stone-500">Isi data berikut untuk mengajukan menjadi mitra</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Usaha *</label>
              <input name="business_name" value={form.business_name} onChange={handleChange} required
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori *</label>
              <select name="category" value={form.category} onChange={handleChange} required
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50">
                <option value="">Pilih kategori</option>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi</label>
                <input name="location" value={form.location} onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">No. WhatsApp/Telepon</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50" />
              </div>
            </div>
            {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
            <button type="submit" disabled={submitting}
              className="w-full py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
