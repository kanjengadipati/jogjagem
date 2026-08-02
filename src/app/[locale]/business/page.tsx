'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { businesses, listingClaims, BeBusiness, BeListingClaim } from '@/lib/api';
import Image from 'next/image';
import { useRouter } from '@/i18n/navigation';
import {
  CheckCircle2,
  XCircle,
  ExternalLink,
  Shield,
  Megaphone,
  BarChart2,
  Building2,
  Plus,
  Store,
  FileCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';

const CATEGORIES = ['Kuliner', 'Hotel & Penginapan', 'Wisata & Destinasi', 'Oleh-oleh', 'Jasa', 'Lainnya'];

const PLACEMENT_NAMES: Record<string, string> = {
  homepage_hero: 'Homepage Hero Banner',
  destination_detail: 'Destination Detail Sponsorship',
  listing_top: 'Listing Top Priority',
  listing_native: 'Native In-Feed Ad',
};

function BusinessLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex items-center justify-center p-0 md:p-8 relative overflow-hidden bg-stone-950">
      {/* Full-bleed merapi bg */}
      <Image src="/merapi.png" alt="Gunung Merapi" fill priority className="object-cover object-center" />
      <div className="absolute inset-0 bg-black/45" />
      {/* Shortcut back to the main portal (home) */}
      <button
        onClick={() => router.push('/')}
        className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/55 backdrop-blur-md border border-white/25 text-white text-xs font-semibold hover:bg-black/75 hover:border-white/40 transition-all shadow-lg"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Kembali ke Beranda</span>
      </button>
      <div className="relative z-10 w-full max-w-[960px] rounded-none md:rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,.65)] flex flex-col md:flex-row">
        {children}
      </div>
    </div>
  );
}

function VisualPanel() {
  return (
    <div className="relative md:w-[48%] min-h-[340px] md:min-h-[520px] overflow-hidden text-white flex flex-col justify-between p-8">
      {/* Merapi image — darkened with overlay */}
      <Image
        src="/merapi.png"
        alt="Gunung Merapi"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/40" />

      {/* Top: logo badge */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white text-xs font-semibold">
          <Image src="/logo-gold-new.png" alt="Jogjagem" width={16} height={16} className="object-contain" />
          <span>Jogjagem Business Platform</span>
        </div>

        <h1 className="mt-5 text-3xl md:text-[2.2rem] font-extrabold tracking-tight text-white leading-[1.15]">
          Kelola & Kembangkan<br />
          Bisnis Anda di{' '}
          <span className="text-amber-400">Jogja</span>
          <span className="text-amber-400 ml-1">✦</span>
        </h1>
        <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-xs">
          Platform terpadu untuk pemilik usaha kuliner, akomodasi, destinasi, dan kerajinan lokal.
        </p>
      </div>

      {/* Bottom: feature rows */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
            <Shield className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Claim & Verifikasi</div>
            <div className="text-xs text-white/60">Pastikan bisnis Anda terverifikasi resmi</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
            <Megaphone className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Promosi Eksklusif</div>
            <div className="text-xs text-white/60">Jangkau wisatawan lebih luas</div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
            <BarChart2 className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Reputasi & Ulasan</div>
            <div className="text-xs text-white/60">Kelola ulasan dan bangun kepercayaan</div>
          </div>
        </div>

        {/* Italic tagline */}
        <p className="text-amber-400 italic font-semibold text-sm pt-2" style={{ fontFamily: 'Georgia, serif' }}>
          Bersama, majukan pariwisata Jogja.
        </p>
      </div>
    </div>
  );
}

function extractDataArray<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  return [];
}

export default function BusinessPage() {
  const { user, isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  const placement = searchParams.get('placement');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [myBusinesses, setMyBusinesses] = useState<BeBusiness[]>([]);
  const [myClaims, setMyClaims] = useState<BeListingClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(action === 'register' || Boolean(placement));

  const [formData, setFormData] = useState({
    name: '',
    category: CATEGORIES[0],
    description: '',
    phone: '',
    email: '',
    website: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (action === 'register' || placement) {
      setShowCreateForm(true);
    }
  }, [action, placement]);

  useEffect(() => {
    if (isAuthenticated) {
      loadBusinesses();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const [bizRes, claimRes] = await Promise.allSettled([
        businesses.getMine(),
        listingClaims.getMine()
      ]);

      if (bizRes.status === 'fulfilled') {
        setMyBusinesses(extractDataArray<BeBusiness>(bizRes.value));
      }
      if (claimRes.status === 'fulfilled') {
        setMyClaims(extractDataArray<BeListingClaim>(claimRes.value));
      }
    } catch {
      setMyBusinesses([]);
      setMyClaims([]);
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) return true;
    const digitsOnly = cleanPhone.replace(/\D/g, '');
    if (digitsOnly.length < 9 || digitsOnly.length > 15) return false;
    return /^(\+62|62|0)[8][1-9][0-9]{6,11}$/.test(cleanPhone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (formData.phone.trim() && !validatePhone(formData.phone)) {
      setMessage({ type: 'error', text: 'Nomor telepon / WhatsApp tidak valid (Contoh: 081234567890 atau +6281234567890).' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    try {
      await businesses.create(formData);
      setMessage({ type: 'success', text: 'Bisnis berhasil didaftarkan! Status: Menunggu Verifikasi' });
      setFormData({ name: '', category: CATEGORIES[0], description: '', phone: '', email: '', website: '' });
      setShowCreateForm(false);
      loadBusinesses();
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Gagal memproses pendaftaran bisnis.' });
    } finally {
      setSubmitting(false);
    }
  };

  const placementName = placement ? (PLACEMENT_NAMES[placement] || placement) : '';

  return (
    <BusinessLayout>
      <VisualPanel />
      
      {/* Right panel — cream bg */}
      <div className="flex-1 p-7 md:p-9 flex flex-col justify-center bg-[#FAF6EF]">
        {!isAuthenticated ? (
          <div className="text-center space-y-5 py-6">
            {/* Slot Ad Context Alert for Unauthenticated Users */}
            {placementName && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 text-xs flex items-start gap-2.5 text-left mb-2 shadow-2xs">
                <Megaphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950">Slot Iklan: {placementName}</span>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Masuk atau buat akun terlebih dahulu untuk mendaftarkan usaha Anda dan memasang iklan di slot ini.
                  </p>
                </div>
              </div>
            )}

            {/* Empty state illustration */}
            <div className="w-24 h-24 mx-auto opacity-60">
              <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="18" y="42" width="60" height="42" rx="4" fill="#D4A853" fillOpacity=".25" stroke="#D4A853" strokeWidth="2"/>
                <rect x="30" y="58" width="16" height="26" rx="2" fill="#D4A853" fillOpacity=".4"/>
                <rect x="50" y="64" width="14" height="20" rx="2" fill="#D4A853" fillOpacity=".4"/>
                <path d="M14 46 L48 24 L82 46" stroke="#D4A853" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="62" cy="28" r="10" fill="#D4A853" fillOpacity=".2" stroke="#D4A853" strokeWidth="2"/>
                <circle cx="62" cy="28" r="4" fill="#D4A853"/>
                <line x1="62" y1="18" x2="62" y2="12" stroke="#D4A853" strokeWidth="2" strokeLinecap="round"/>
                <text x="70" y="22" fontSize="7" fill="#D4A853" opacity=".5">✦</text>
                <text x="30" y="38" fontSize="5" fill="#D4A853" opacity=".4">✦</text>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              {placementName ? `Pasang Iklan "${placementName}"` : 'Masuk untuk Mengelola Bisnis'}
            </h2>
            <p className="text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
              {placementName
                ? `Login atau daftar akun Jogjagem untuk mendaftarkan usaha Anda dan memasang iklan di slot ${placementName}.`
                : 'Login atau daftar akun Jogjagem untuk mendaftarkan bisnis Anda atau melakukan klaim kepemilikan usaha.'}
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white font-semibold text-sm rounded-full transition-all"
            >
              <Store className="w-4 h-4" />
              {placementName ? 'Masuk & Pasang Iklan' : 'Masuk / Daftar Akun'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1">
              <Lock className="w-3 h-3" /> Data aman &amp; hanya dapat dikelola oleh Anda
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Slot Ad Context Alert for Authenticated Users */}
            {placementName && (
              <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-950 text-xs flex items-start gap-2.5 shadow-2xs">
                <Megaphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-950">Slot Iklan Terpilih: {placementName}</span>
                  <p className="text-[11px] text-stone-600 mt-0.5 leading-relaxed">
                    Daftarkan atau pilih usaha Anda di bawah ini untuk melanjutkan pemasangan iklan pada slot ini.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-stone-900">
                  {placementName ? 'Pendaftaran Iklan & Bisnis' : 'Daftar Bisnis Saya'}
                </h2>
                <p className="text-xs text-stone-500">
                  {placementName ? `Form registrasi usaha untuk slot ${placementName}` : 'Kelola identitas dan kepemilikan bisnis Anda'}
                </p>
              </div>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-full transition-colors shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Bisnis</span>
                </button>
              )}
            </div>

            {message && (
              <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            {showCreateForm ? (
              <form onSubmit={handleSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
                <div className="flex items-center justify-between gap-3 border-b border-stone-100 pb-3">
                  <h3 className="text-sm font-bold text-stone-800 truncate">
                    {placementName ? `Form Usaha — Slot "${placementName}"` : 'Form Pendaftaran Bisnis Baru'}
                  </h3>
                  {placementName && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200 shrink-0 whitespace-nowrap">
                      Step 1 dari 2
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Bisnis / Usaha *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Contoh: Gudeg Pawon Jogja"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">No. Telepon / WhatsApp</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        const clean = val.startsWith('+')
                          ? '+' + val.slice(1).replace(/\D/g, '')
                          : val.replace(/\D/g, '');
                        setFormData({ ...formData, phone: clean });
                      }}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                      placeholder="08123456789"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Deskripsi Singkat</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Jelaskan mengenai bisnis Anda..."
                  />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl transition-colors disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                  >
                    {submitting ? 'Menyimpan...' : (placementName ? 'Daftarkan Usaha & Lanjut Pasang Iklan →' : 'Daftarkan Bisnis')}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {loading ? (
                  <div className="text-center py-10 text-xs text-stone-400">Memuat bisnis Anda...</div>
                ) : myBusinesses.length === 0 ? (
                  <div className="text-center py-6 space-y-4">
                    {/* Store illustration — empty state */}
                    <div className="w-28 h-28 mx-auto opacity-70">
                      <svg viewBox="0 0 112 112" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Ground / shadow */}
                        <ellipse cx="56" cy="96" rx="32" ry="6" fill="#E5C98A" fillOpacity=".3"/>
                        {/* Building body */}
                        <rect x="22" y="50" width="68" height="46" rx="5" fill="#F5E6C8" stroke="#D4A853" strokeWidth="2"/>
                        {/* Roof */}
                        <path d="M16 52 L56 24 L96 52" stroke="#C8912A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="#E5C070" fillOpacity=".6"/>
                        {/* Door */}
                        <rect x="42" y="68" width="18" height="28" rx="3" fill="#C8912A" fillOpacity=".5" stroke="#C8912A" strokeWidth="1.5"/>
                        {/* Windows */}
                        <rect x="26" y="60" width="16" height="14" rx="2" fill="#fff" fillOpacity=".7" stroke="#D4A853" strokeWidth="1.5"/>
                        <rect x="70" y="60" width="16" height="14" rx="2" fill="#fff" fillOpacity=".7" stroke="#D4A853" strokeWidth="1.5"/>
                        {/* Map pin */}
                        <circle cx="80" cy="30" r="13" fill="#E5A84B" stroke="#C8912A" strokeWidth="2"/>
                        <circle cx="80" cy="28" r="5" fill="#fff"/>
                        <path d="M80 33 L80 44" stroke="#C8912A" strokeWidth="2" strokeLinecap="round"/>
                        {/* Sparkle */}
                        <text x="10" y="38" fontSize="10" fill="#D4A853" opacity=".5">✦</text>
                        <text x="88" y="58" fontSize="7" fill="#D4A853" opacity=".4">✦</text>
                      </svg>
                    </div>
                    <div>
                      <p className="text-base font-bold text-stone-800">Belum ada bisnis terdaftar</p>
                      <p className="text-xs text-stone-500 mt-1 leading-relaxed max-w-[220px] mx-auto">
                        Mulai tambahkan bisnis pertama Anda untuk ditampilkan di Jogjagem.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white font-semibold text-xs rounded-full transition-all"
                    >
                      <Building2 className="w-4 h-4" />
                      Tambah Bisnis Sekarang
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <p className="text-[11px] text-stone-400 flex items-center justify-center gap-1 mt-1">
                      <Lock className="w-3 h-3" /> Data aman &amp; hanya dapat dikelola oleh Anda
                    </p>
                  </div>
                ) : (
                  myBusinesses.map((biz) => (
                    <div key={biz.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100/80 transition-colors flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-stone-900">{biz.name}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            biz.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            biz.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-stone-200 text-stone-700'
                          }`}>
                            {biz.status === 'approved' ? 'Terverifikasi' : biz.status === 'pending' ? 'Menunggu Verifikasi' : biz.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">{biz.category} {biz.phone ? `• ${biz.phone}` : ''}</p>
                        {biz.status === 'pending' && (
                          <p className="text-[11px] text-amber-700 font-medium pt-0.5">
                            Pendaftaran/klaim sedang ditinjau tim admin Jogjagem (1x24 jam).
                          </p>
                        )}
                      </div>
                      <a
                        href={`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'}/business/${biz.external_id || (biz as any).id || ''}/dashboard${placement ? `?placement=${encodeURIComponent(placement)}` : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-xs ${
                          placement ? 'bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold' : 'bg-stone-900 hover:bg-black text-white'
                        }`}
                      >
                        <span>{placement ? 'Pasang Iklan' : 'Dashboard'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))
                )}

                {myClaims.length > 0 && (
                  <div className="pt-4 border-t border-stone-200 space-y-2">
                    <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                      <FileCheck className="w-3.5 h-3.5 text-gold-600" />
                      <span>Riwayat Pengajuan Klaim</span>
                    </h3>
                    <div className="space-y-2">
                      {myClaims.map((claim) => (
                        <div key={claim.id} className="p-3 bg-gold-50/50 border border-gold-200/60 rounded-xl flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-stone-900 capitalize">{claim.listing_type}</span>
                            <span className="text-stone-500 font-mono ml-1 text-[11px]">({claim.listing_external_id})</span>
                            <p className="text-[10px] text-stone-400 mt-0.5">
                              Dikirim: {claim.submitted_at ? new Date(claim.submitted_at).toLocaleDateString('id-ID') : 'Baru Saja'}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            claim.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            claim.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {claim.status === 'approved' ? 'Disetujui' : claim.status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </BusinessLayout>
  );
}
