'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { partners } from '@/lib/api';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import { ArrowLeft, Briefcase, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import type { BePartner } from '@/lib/api';

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
        <p className="text-xs font-mono text-gold-400 uppercase tracking-widest mb-1.5">
          Jogjagem Partner
        </p>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
          {title}
        </h1>
        <p className="text-sm text-white/75 leading-relaxed max-w-lg font-light mt-3">
          {subtitle}
        </p>
      </div>
    </section>
  );
}

export default function PartnerPage() {
  const { isAuthenticated, user, isLoading: authLoading, refreshProfile } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [myListing, setMyListing] = useState<BePartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    category: '',
    description: '',
    location: '',
    address: '',
    phone: '',
    website: '',
    price: '',
  });

  // Check for existing listing
  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    partners.getMine().then((res) => {
      if (res.status === 'success' && res.data && Array.isArray(res.data) && res.data.length > 0) {
        setMyListing(res.data[0]);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated, authLoading, submitted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.category) {
      setError('Nama usaha dan kategori wajib diisi.');
      return;
    }
    setSubmitting(true);
    setError('');
    const res = await partners.apply(form);
    if (res.status === 'success') {
      setSubmitted(true);
      await refreshProfile();
      const token = (await import('@/lib/api')).auth.getAccessToken();
      if (token) {
        window.open(
          `${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'}/login?token=${token}`,
          '_blank'
        );
      }
    } else {
      setError(res.message || 'Gagal mengajukan. Silakan coba lagi.');
    }
    setSubmitting(false);
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Not authenticated — show auth modal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-50">
        <HeroBanner title="Jadi Mitra Bisnis" subtitle="Daftarkan usaha Anda di Jogjagem dan jangkau ribuan wisatawan setiap hari." />
        <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-16">
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center space-y-5 shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center mx-auto">
              <Briefcase className="w-7 h-7 text-gold-600" />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-stone-900">Mulai Sekarang</h2>
              <p className="text-xs text-stone-500 mt-1">
                Masuk atau daftar untuk mengajukan bisnis Anda sebagai mitra Jogjagem.
              </p>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-6 py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-colors"
            >
              Masuk / Daftar
            </button>
          </div>
        </div>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  // Already a partner — show status
  if (myListing || submitted) {
    const status = myListing?.status || 'pending';
    const statusConfig = {
      pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Sedang Direview' },
      approved: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Disetujui' },
      rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: 'Ditolak' },
    } as const;
    const s = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = s.icon;

    return (
      <div className="min-h-screen bg-stone-50">
        <HeroBanner title="Status Pengajuan Anda" subtitle="Berikut status pengajuan mitra bisnis Anda di Jogjagem." />
        <div className="max-w-lg mx-auto px-4 -mt-16 relative z-10 pb-16">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-lg">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                <StatusIcon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-stone-900">{myListing?.name || 'Pengajuan'}</h2>
                <p className={`text-xs font-semibold ${s.color}`}>{s.label}</p>
              </div>
            </div>

            {myListing && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Nama Usaha</span>
                  <span className="font-medium text-stone-800">{myListing.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Kategori</span>
                  <span className="font-medium text-stone-800">{myListing.category}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-stone-100">
                  <span className="text-stone-500">Lokasi</span>
                  <span className="font-medium text-stone-800">{myListing.location || '-'}</span>
                </div>
              </div>
            )}

            {status === 'approved' && (
              <a
                href={`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'}/partner`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-colors"
              >
                Dashboard Partner <ExternalLink className="w-4 h-4" />
              </a>
            )}

            {/* ── Status pembayaran sponsorship ── */}
            {status === 'approved' && myListing?.is_sponsored && myListing?.sponsor_payment_status !== 'paid' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 leading-relaxed">
                <p className="font-semibold mb-0.5">⏳ Menunggu konfirmasi pembayaran</p>
                <p className="text-xs text-amber-700 font-normal">
                  Listing Anda ditandai sebagai sponsor namun pembayaran belum kami terima.
                  Tim kami akan menghubungi Anda dengan link pembayaran secara terpisah.
                </p>
              </div>
            )}

            {status === 'approved' && myListing?.is_sponsored && myListing?.sponsor_payment_status === 'paid' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 leading-relaxed">
                <p className="font-semibold mb-0.5">✅ Sponsorship aktif</p>
                {myListing.sponsor_end_at ? (
                  <p className="text-xs text-emerald-700 font-normal">
                    Berlaku hingga{' '}
                    <span className="font-semibold">
                      {new Date(myListing.sponsor_end_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                    .
                  </p>
                ) : (
                  <p className="text-xs text-emerald-700 font-normal">
                    Listing Anda tampil sebagai sponsor di halaman pencarian Jogjagem.
                  </p>
                )}
              </div>
            )}

            {status === 'rejected' && (
              <p className="text-xs text-stone-500 text-center">
                Pengajuan ditolak. Anda dapat mengajukan ulang dengan data yang diperbarui.
              </p>
            )}

            {status === 'pending' && (
              <p className="text-xs text-stone-400 text-center">
                Pengajuan Anda sedang ditinjau oleh tim kami. Proses biasanya memakan waktu 1-3 hari kerja.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // New application form
  return (
    <div className="min-h-screen bg-stone-50">
      <HeroBanner title="Jadi Mitra Bisnis" subtitle="Daftarkan usaha Anda di Jogjagem dan jangkau ribuan wisatawan setiap hari." />
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
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50"
                placeholder="Contoh: Heha Ocean View"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori *</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50"
              >
                <option value="">Pilih kategori</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50 resize-none"
                placeholder="Ceritakan tentang usaha Anda..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Lokasi</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50"
                  placeholder="Contoh: Gunung Kidul"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Telepon</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50"
                  placeholder="08xxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Alamat Lengkap</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50"
                placeholder="Alamat lengkap usaha"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Website</label>
                <input
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Harga</label>
                <input
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400 bg-stone-50"
                  placeholder="Contoh: Rp 50.000"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
