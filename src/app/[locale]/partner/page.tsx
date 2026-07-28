'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { partners } from '@/lib/api';
import { useRouter } from '@/i18n/navigation';
import { ArrowLeft, Briefcase, CheckCircle2, Clock, XCircle, ExternalLink } from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import type { BePartner } from '@/lib/api';

const CATEGORIES = [
  'Hotel', 'Restaurant', 'Cafe', 'Tour Guide', 'Transport',
  'Souvenir', 'Activity', 'Spa', 'Nightlife', 'Other',
];

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
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-gold-50 border border-gold-200 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8 text-gold-600" />
          </div>
          <h1 className="font-display text-2xl font-bold text-stone-900">Jadi Mitra Bisnis</h1>
          <p className="text-sm text-stone-500">
            Daftarkan usaha Anda di Jogjagem dan jangkau ribuan wisatawan setiap hari.
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-colors"
          >
            Masuk / Daftar
          </button>
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </div>
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
        <div className="max-w-lg mx-auto px-4 py-12">
          <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </button>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center`}>
                <StatusIcon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <h1 className="font-display text-lg font-bold text-stone-900">Status Pengajuan</h1>
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
                href={`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3005'}/partner/listings`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-colors"
              >
                Dashboard Partner <ExternalLink className="w-4 h-4" />
              </a>
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
      <div className="max-w-lg mx-auto px-4 py-12">
        <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </button>

        <div className="bg-white rounded-2xl border border-stone-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-gold-600" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold text-stone-900">Jadi Mitra Bisnis</h1>
              <p className="text-xs text-stone-500">Daftarkan usaha Anda di Jogjagem</p>
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
