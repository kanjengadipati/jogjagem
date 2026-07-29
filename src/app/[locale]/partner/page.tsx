'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLocale } from '@/contexts/LocaleContext';
import { partners, partnerApplications, auth } from '@/lib/api';
import { useRouter } from '@/i18n/navigation';
import Image from 'next/image';
import {
  Briefcase,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Save,
  Shield,
  Sparkles,
  TrendingUp,
  BarChart3,
  Zap,
  Percent,
  Star,
  Building2,
  Users,
  ChevronDown,
  ArrowRight
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import type { BePartner, BePartnerApplication } from '@/lib/api';

const CATEGORIES = ['Kuliner', 'Hotel & Penginapan', 'Wisata & Destinasi', 'Oleh-oleh', 'Jasa', 'Lainnya'];
const LOCATIONS = ['Yogyakarta', 'Sleman', 'Bantul', 'Gunung Kidul', 'Kulon Progo'];

function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0f0f0d] flex items-center justify-center p-0 md:p-10">
      <div className="fixed inset-0 z-0">
        <Image src="/prambanan-bg.png" alt="Candi Prambanan" fill priority className="object-cover object-[30%_center]" />
        <div className="absolute inset-0 bg-black/55 backdrop-blur-[7px]" />
      </div>
      <div className="relative z-10 w-full max-w-[950px] bg-white rounded-none md:rounded-[20px] overflow-hidden shadow-[0_35px_100px_rgba(0,0,0,.35)] border-0 md:border border-white/80 flex flex-col md:flex-row">
        {children}
      </div>
    </div>
  );
}

function VisualPanel({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative md:w-[48%] min-h-[300px] md:min-h-[400px] overflow-hidden text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-black/70 scale-[1.02]" style={{ backgroundImage: `linear-gradient(180deg, rgba(15,15,12,.15) 0%, rgba(15,15,12,.05) 35%, rgba(15,15,12,.7) 100%), url(/prambanan-bg.png)`, backgroundSize: 'cover', backgroundPosition: '30% center' }} />
      <div className="relative z-[2] h-full flex flex-col p-[20px_18px_16px] md:p-[22px_28px_18px]">{children}</div>
    </div>
  );
}

function Benefits() {
  const { t } = useLocale();
  const items = [
    { icon: '♢', title: t('partner_page.benefit_verified'), desc: t('partner_page.benefit_verified_desc') },
    { icon: '↗', title: t('partner_page.benefit_reach'), desc: t('partner_page.benefit_reach_desc') },
    { icon: '☆', title: t('partner_page.benefit_exposure'), desc: t('partner_page.benefit_exposure_desc') },
  ];
  return (
    <div className="mt-auto grid grid-cols-3 p-[10px] md:p-[10px] bg-white/90 backdrop-blur rounded-[10px] text-stone-800">
      {items.map((item, i) => (
        <div key={i} className={`flex flex-col gap-[3px] ${i > 0 ? 'pl-[10px] border-l border-[#ddd5c8]' : ''} ${i < items.length - 1 ? 'pr-[10px]' : ''}`}>
          <span className="text-gold-500 text-[18px] mb-[2px]">{item.icon}</span>
          <strong className="text-[11px]">{item.title}</strong>
          <span className="text-[#777] text-[9px] leading-[1.3]">{item.desc}</span>
        </div>
      ))}
    </div>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-[7px]">
      <div className="w-[30px] h-[30px] bg-gold-500 rounded-[8px] flex items-center justify-center font-bold text-white text-[14px]">♧</div>
      <div>
        <span className="font-serif tracking-[.15em] text-[13px] text-white font-bold block leading-none">JOGJAGEM</span>
        <span className="text-[9px] text-[#eee] font-semibold tracking-widest uppercase">Partner</span>
      </div>
    </div>
  );
}

function CompleteListingForm({ listing, onSubmitted }: { listing: BePartner; onSubmitted: () => void }) {
  const { t } = useLocale();
  const [form, setForm] = useState({
    description: listing.description || '',
    address: listing.address || '',
    image: listing.image || '',
    phone: listing.phone || '',
    website: listing.website || '',
    price: listing.price || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveDraft = async () => {
    setSaving(true); setError('');
    const res = await partners.update(listing.id, form);
    if (res.status === 'success') { onSubmitted(); } else { setError(res.message || 'Gagal menyimpan draft'); }
    setSaving(false);
  };

  const handleSubmitForReview = async () => {
    if (!form.description.trim() || !form.address.trim()) {
      setError(t('partner_page.error_complete_required')); return;
    }
    setSaving(true); setError('');
    await partners.update(listing.id, form);
    const res = await partners.submitForReview(listing.id);
    if (res.status === 'success') { onSubmitted(); } else { setError(res.message || 'Gagal mengajukan review'); }
    setSaving(false);
  };

  return (
    <PartnerLayout>
      <VisualPanel>
        <Logo />
        <div className="mt-auto mb-auto">
          <h1 className="font-serif text-[clamp(24px,3.5vw,36px)] leading-[.9] tracking-[-1px]">{t('partner_page.complete_title')}</h1>
          <div className="w-[60px] h-[3px] bg-gold-500 my-[12px]" />
          <p className="text-white/80 text-xs md:text-sm">{t('partner_page.complete_subtitle')}</p>
        </div>
        <Benefits />
      </VisualPanel>
      <div className="md:w-[52%] p-[18px_18px_24px] md:p-[24px_28px_20px] flex flex-col justify-center">
        <div className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-gold-600 uppercase tracking-wider">{listing.category}</span>
            <h2 className="font-serif text-xl font-bold text-stone-900">{listing.name}</h2>
          </div>
          <div><label className="block text-xs font-semibold text-stone-700 mb-1">{t('partner_page.description')} *</label><textarea name="description" rows={3} value={form.description} onChange={handleChange} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400" placeholder={t('partner_page.description_placeholder')} /></div>
          <div><label className="block text-xs font-semibold text-stone-700 mb-1">{t('partner_page.address')} *</label><input name="address" value={form.address} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400" /></div>
          <div><label className="block text-xs font-semibold text-stone-700 mb-1">{t('partner_page.image_url')}</label><input name="image" value={form.image} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-xs font-semibold text-stone-700 mb-1">{t('partner_page.website')}</label><input name="website" value={form.website} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400" /></div>
            <div><label className="block text-xs font-semibold text-stone-700 mb-1">{t('partner_page.price')}</label><input name="price" value={form.price} onChange={handleChange} className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-400" /></div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={handleSaveDraft} disabled={saving} className="flex-1 py-3 border border-stone-200 text-stone-700 font-semibold rounded-xl hover:bg-stone-50 disabled:opacity-50 flex items-center justify-center gap-2"><Save className="w-4 h-4" /> {t('partner_page.save_draft')}</button>
            <button onClick={handleSubmitForReview} disabled={saving} className="flex-1 py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 disabled:opacity-50">{t('partner_page.submit_review')}</button>
          </div>
        </div>
      </div>
    </PartnerLayout>
  );
}

function ApplicationStatusCard({ application, onReapply }: { application: BePartnerApplication; onReapply: () => void }) {
  const { t } = useLocale();
  return (
    <PartnerLayout>
      <VisualPanel>
        <Logo />
        <div className="mt-auto mb-auto">
          <h1 className="font-serif text-[clamp(24px,3.5vw,36px)] leading-[.9] tracking-[-1px]">{t('partner_page.app_status_title')}</h1>
          <div className="w-[60px] h-[3px] bg-gold-500 my-[12px]" />
        </div>
        <Benefits />
      </VisualPanel>
      <div className="md:w-[52%] p-[18px_18px_24px] md:p-[24px_28px_20px] flex flex-col justify-center">
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 text-center">
          {application.status === 'rejected' ? (
            <>
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 text-red-500 flex items-center justify-center mx-auto"><XCircle className="w-6 h-6" /></div>
              <h2 className="font-serif text-lg font-bold text-stone-900">{t('partner_page.app_rejected_title')}</h2>
              {application.rejection_reason && <p className="text-xs text-stone-600 bg-stone-50 p-3 rounded-xl">{t('partner_page.app_rejected_reason')} {application.rejection_reason}</p>}
              <button onClick={onReapply} className="w-full py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-colors">{t('partner_page.reapply')}</button>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mx-auto"><Clock className="w-6 h-6" /></div>
              <h2 className="font-serif text-lg font-bold text-stone-900">{t('partner_page.app_pending_title')}</h2>
              <p className="text-xs text-stone-500 leading-relaxed">{t('partner_page.app_pending_desc')}</p>
            </>
          )}
        </div>
      </div>
    </PartnerLayout>
  );
}

/** Interactive Landing Page for Unauthenticated Visitors */
function InteractivePartnerLanding({ onOpenAuth }: { onOpenAuth: (mode?: 'login' | 'register') => void }) {
  const [calcCategory, setCalcCategory] = useState('Kuliner');
  const [calcLocation, setCalcLocation] = useState('Yogyakarta');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const baseMap: Record<string, number> = {
    'Kuliner': 18500,
    'Hotel & Penginapan': 24000,
    'Wisata & Destinasi': 32000,
    'Oleh-oleh': 14000,
    'Jasa': 9500,
    'Lainnya': 8000,
  };
  const locMult: Record<string, number> = {
    'Yogyakarta': 1.4,
    'Sleman': 1.25,
    'Bantul': 1.0,
    'Gunung Kidul': 0.95,
    'Kulon Progo': 0.85,
  };

  const base = baseMap[calcCategory] || 15000;
  const mult = locMult[calcLocation] || 1.0;
  const estimatedImpressions = Math.round(base * mult);
  const estimatedLeads = Math.round(estimatedImpressions * 0.14);

  const faqs = [
    {
      q: 'Berapa biaya pendaftaran untuk menjadi mitra di Jogjagem?',
      a: 'Pendaftaran mitra 100% GRATIS tanpa biaya pendaftaran maupun komisi pemotongan dari transaksi pengunjung Anda.'
    },
    {
      q: 'Berapa lama proses verifikasi akun mitra?',
      a: 'Tim verifikasi kami akan meninjau pengajuan usaha Anda maksimal 1x24 jam kerja setelah formulir diisi lengkap.'
    },
    {
      q: 'Apakah saya bisa mempromosikan promo khusus atau iklan bersponsor?',
      a: 'Tentu! Melalui Dashboard Mitra, Anda dapat mengaktifkan fitur Sponsored Ads dan promo musiman untuk meningkatkan visibilitas bisnis Anda di halaman utama dan pencarian rute.'
    },
    {
      q: 'Apa saja syarat utama untuk mendaftar sebagai mitra?',
      a: 'Memiliki usaha fisik atau layanan aktif yang beroperasi di wilayah D.I. Yogyakarta (Kota Jogja, Sleman, Bantul, Gunung Kidul, atau Kulon Progo).'
    }
  ];

  return (
    <div className="w-full bg-[#0d0d0b] text-stone-100 min-h-screen font-sans selection:bg-gold-500 selection:text-black">
      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-gold-500/10 via-amber-600/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gold-600/5 blur-[150px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d0d0b]/80 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-400 to-amber-600 flex items-center justify-center text-stone-900 font-bold shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
            ♧
          </div>
          <div>
            <span className="font-serif tracking-[.15em] text-sm text-stone-100 font-bold block leading-none">JOGJAGEM</span>
            <span className="text-[10px] text-gold-400 font-semibold tracking-widest uppercase">Partner Portal</span>
          </div>
        </a>

        <div className="flex items-center gap-2.5 md:gap-4">
          <button onClick={() => onOpenAuth('login')} className="px-3.5 py-2 text-xs md:text-sm font-semibold text-stone-300 hover:text-white transition-colors">
            Masuk
          </button>
          <button onClick={() => onOpenAuth('register')} className="px-4 py-2 text-xs md:text-sm font-semibold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-stone-950 rounded-xl shadow-lg shadow-gold-500/20 hover:shadow-gold-500/30 transition-all transform hover:-translate-y-0.5">
            Daftar Mitra Gratis
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-10 md:py-16 space-y-16 md:space-y-24">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6 md:space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-gold-400 animate-pulse" />
            <span>Platform Pariwisata & Mitra Resmi Yogyakarta</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight text-white">
            Tumbuhkan Bisnis Anda Bersama <br />
            <span className="bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500 bg-clip-text text-transparent">
              Wisatawan Jogja secara Real-Time
            </span>
          </h1>

          <p className="text-stone-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Jangkau puluhan ribu wisatawan aktif yang sedang merencanakan dan menjelajahi destinasi, penginapan, serta kuliner favorit di D.I. Yogyakarta.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <button onClick={() => onOpenAuth('register')} className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-gold-500 via-amber-500 to-gold-400 hover:from-gold-400 hover:to-amber-400 text-stone-950 font-bold text-sm md:text-base rounded-2xl shadow-xl shadow-gold-500/25 hover:shadow-gold-500/40 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2">
              <span>🚀 Registrasi Mitra Gratis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a href="#simulator" className="w-full sm:w-auto px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-stone-200 font-semibold text-sm md:text-base rounded-2xl transition-colors flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-gold-400" />
              <span>Hitung Potensi Bisnis</span>
            </a>
          </div>

          {/* Stats Ticker */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 pt-8">
            {[
              { label: 'Wisatawan Aktif/Bulan', val: '50.000+', icon: Users },
              { label: 'Mitra Terverifikasi', val: '120+', icon: Building2 },
              { label: 'Potongan Komisi', val: '0%', icon: Percent },
              { label: 'Kepuasan Mitra', val: '4.9 / 5.0 ★', icon: Star },
            ].map((st, i) => (
              <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4 text-left hover:border-gold-500/40 transition-colors">
                <st.icon className="w-5 h-5 text-gold-400 mb-2" />
                <div className="text-xl md:text-2xl font-bold text-white font-serif">{st.val}</div>
                <div className="text-xs text-stone-400 font-medium">{st.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* REACH SIMULATOR SECTION */}
        <section id="simulator" className="scroll-mt-24 bg-gradient-to-b from-stone-900/90 to-stone-950 border border-gold-500/20 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <div className="text-xs font-semibold tracking-wider text-gold-400 uppercase">Kalkulator Potensi Usaha</div>
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">Simulasikan Potensi Jangkauan Usaha Anda</h2>
            <p className="text-xs md:text-sm text-stone-400">Pilih kategori usaha dan wilayah untuk melihat estimasi kunjungan wisatawan per bulan.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* Controls */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2.5">1. Pilih Kategori Usaha</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(baseMap).map((cat) => (
                    <button key={cat} onClick={() => setCalcCategory(cat)} className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${calcCategory === cat ? 'bg-gold-500 text-stone-950 font-bold shadow-md shadow-gold-500/20' : 'bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10'}`}>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 uppercase tracking-wider mb-2.5">2. Pilih Lokasi Usaha</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(locMult).map((loc) => (
                    <button key={loc} onClick={() => setCalcLocation(loc)} className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${calcLocation === loc ? 'bg-gold-500 text-stone-950 font-bold shadow-md shadow-gold-500/20' : 'bg-white/5 border border-white/10 text-stone-300 hover:bg-white/10'}`}>
                      {loc}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Result Card */}
            <div className="bg-stone-900/90 border border-gold-500/30 rounded-2xl p-6 text-center space-y-5 shadow-xl relative">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
                ✓ Proyeksi Realistis Berdasarkan Data Wisatawan
              </div>

              <div className="grid grid-cols-2 gap-4 divide-x divide-white/10">
                <div className="p-2">
                  <div className="text-3xl md:text-4xl font-bold font-serif text-white">{estimatedImpressions.toLocaleString('id-ID')}</div>
                  <div className="text-xs text-stone-400 mt-1 font-medium">Estimasi Tayang / Bulan</div>
                </div>
                <div className="p-2">
                  <div className="text-3xl md:text-4xl font-bold font-serif text-gold-400">+{estimatedLeads.toLocaleString('id-ID')}</div>
                  <div className="text-xs text-stone-400 mt-1 font-medium">Calon Pengunjung Langsung</div>
                </div>
              </div>

              <div className="pt-2">
                <button onClick={() => onOpenAuth('register')} className="w-full py-3 bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-stone-950 font-bold text-sm rounded-xl shadow-lg transition-all">
                  Klaim Slot Listing {calcCategory} di {calcLocation}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* BENEFIT SHOWCASE TABS */}
        <section className="space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">Keuntungan Utama Bermitra di Jogjagem</h2>
            <p className="text-xs md:text-sm text-stone-400">Solusi digital menyeluruh untuk memajukan usaha pariwisata Anda.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'reach',
                icon: TrendingUp,
                title: 'Visibilitas Utama',
                desc: 'Usaha Anda ditampilkan langsung di halaman pencarian destinasi, peta lokasi interaktif, dan rekomendasi perjalanan AI.'
              },
              {
                id: 'analytics',
                icon: BarChart3,
                title: 'Dashboard Analitik',
                desc: 'Pantau jumlah penayangan (impressions), klik pengunjung, serta rating dan ulasan pelanggan secara real-time.'
              },
              {
                id: 'promos',
                icon: Zap,
                title: 'Iklan & Promo Musiman',
                desc: 'Aktifkan banner promosi khusus atau Sponsored Ads untuk menarik wisatawan saat musim liburan dan akhir pekan.'
              },
              {
                id: 'zero_commission',
                icon: Percent,
                title: '100% Bebas Komisi',
                desc: 'Seluruh transaksi dan pembayaran dari wisatawan langsung milik Anda tanpa ada komisi pemotongan platform.'
              }
            ].map((b) => (
              <div key={b.id} className="bg-white/5 border border-white/10 hover:border-gold-500/40 rounded-2xl p-6 space-y-3 transition-all transform hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                  <b.icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif font-bold text-lg text-white">{b.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 3-STEP EASY ONBOARDING TIMELINE */}
        <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">3 Langkah Mudah Bergabung</h2>
            <p className="text-xs md:text-sm text-stone-400">Proses pendaftaran cepat hanya butuh waktu kurang dari 2 menit.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 relative">
            {[
              {
                step: '01',
                title: 'Daftar & Ajukan Usaha',
                desc: 'Buat akun dan isi informasi dasar usaha Anda (Nama Usaha, Kategori & Kontak).'
              },
              {
                step: '02',
                title: 'Lengkapi Listing Usaha',
                desc: 'Tambahkan foto menarik, jam operasional, alamat lengkap, dan daftar promo unggulan Anda.'
              },
              {
                step: '03',
                title: 'Tayang & Sambut Pengunjung',
                desc: 'Listing Anda aktif dan siap ditemukan oleh puluhan ribu wisatawan di Jogja!'
              }
            ].map((st, idx) => (
              <div key={idx} className="bg-stone-900/80 border border-white/10 rounded-2xl p-6 space-y-3 relative">
                <div className="text-3xl font-serif font-bold text-gold-400">{st.step}</div>
                <h3 className="font-bold text-stone-100 text-base">{st.title}</h3>
                <p className="text-xs text-stone-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-white">Pertanyaan Umum (FAQ)</h2>
            <p className="text-xs md:text-sm text-stone-400">Hal yang sering ditanyakan seputar pendaftaran mitra Jogjagem.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-colors">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-4 md:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm md:text-base text-stone-200 hover:text-white">
                  <span>{f.q}</span>
                  <ChevronDown className={`w-4 h-4 text-gold-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-4 md:px-5 pb-5 pt-1 text-xs md:text-sm text-stone-400 leading-relaxed border-t border-white/5">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM FINAL CTA */}
        <section className="bg-gradient-to-r from-gold-500 via-amber-500 to-gold-400 rounded-3xl p-8 md:p-12 text-stone-950 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <h2 className="font-serif text-2xl sm:text-4xl font-bold">Siap Menjangkau Lebih Banyak Pengunjung?</h2>
          <p className="text-stone-900 text-xs sm:text-sm md:text-base max-w-xl mx-auto font-medium">
            Bergabunglah dengan ratusan pemilik usaha terpercaya di Yogyakarta. Proses pendaftaran gratis & mudah.
          </p>
          <div className="pt-2">
            <button onClick={() => onOpenAuth('register')} className="px-8 py-4 bg-stone-950 hover:bg-stone-900 text-gold-400 font-bold text-sm md:text-base rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5">
              🚀 Daftarkan Usaha Anda Sekarang
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function PartnerPage() {
  const { isAuthenticated, isLoading: authLoading, refreshProfile, user } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [myApplication, setMyApplication] = useState<BePartnerApplication | null>(null);
  const [myListing, setMyListing] = useState<BePartner | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ business_name: '', category: '', location: '', locations: [] as string[], phone: '', email: '' });

  useEffect(() => {
    if (user?.email && !form.email) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  const isFormValid = form.business_name.trim() && form.category && form.locations.length > 0 && form.phone.trim() && form.email.trim() && termsAccepted;

  const toggleLocation = (loc: string) => {
    setForm((prev) => ({
      ...prev,
      locations: prev.locations.includes(loc)
        ? prev.locations.filter((l) => l !== loc)
        : [...prev.locations, loc],
    }));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) { setLoading(false); return; }
    Promise.all([partners.getMine(), partnerApplications.getMine()]).then(([listingRes, appRes]) => {
      if (listingRes.status === 'success' && Array.isArray(listingRes.data) && listingRes.data.length > 0) setMyListing(listingRes.data[0]);
      if (appRes.status === 'success' && Array.isArray(appRes.data) && appRes.data.length > 0) setMyApplication(appRes.data[0]);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated, authLoading, submitted]);

  const resetToForm = () => { setMyApplication(null); setMyListing(null); setSubmitted(false); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const openAuthModal = (mode: 'login' | 'register' = 'register') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      openAuthModal('register');
      return;
    }
    if (!form.business_name || !form.category) { setError(t('partner_page.error_required')); return; }
    setSubmitting(true); setError('');
    const res = await partnerApplications.apply(form);
    if (res.status === 'success') {
      await auth.refreshToken();
      window.location.reload();
      return;
    } else {
      setError(res.message || t('partner_page.error_generic'));
    }
    setSubmitting(false);
  };

  const existingStatusCard = myListing && myListing.status !== 'draft';

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0d] flex items-center justify-center">
        <div className="fixed inset-0 z-0"><Image src="/prambanan-bg.png" alt="Candi Prambanan" fill priority className="object-cover object-[30%_center]" /><div className="absolute inset-0 bg-black/55 backdrop-blur-[7px]" /></div>
        <div className="relative z-10 w-6 h-6 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Unauthenticated visitors see the interactive landing page
  if (!isAuthenticated) {
    return (
      <>
        <InteractivePartnerLanding onOpenAuth={openAuthModal} />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode={authModalMode}
          onSuccess={() => {
            setShowAuthModal(false);
            refreshProfile();
          }}
        />
      </>
    );
  }

  if (existingStatusCard) {
    const status = myListing!.status || 'pending';
    const statusConfig = {
      pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: t('partner_page.listing_pending') },
      approved: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', label: t('partner_page.listing_approved') },
      rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: t('partner_page.listing_rejected') },
      suspended: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: t('partner_page.listing_suspended') },
    } as const;
    const sc = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = sc.icon;

    return (
      <PartnerLayout>
        <VisualPanel>
          <Logo />
          <div className="mt-auto mb-auto">
            <h1 className="font-serif text-[clamp(24px,3.5vw,36px)] leading-[.9] tracking-[-1px]">{t('partner_page.listing_title')}</h1>
            <div className="w-[60px] h-[3px] bg-gold-500 my-[12px]" />
          </div>
          <Benefits />
        </VisualPanel>
        <div className="md:w-[52%] p-[18px_18px_24px] md:p-[24px_28px_20px] flex flex-col justify-center">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
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
              <div className="flex justify-between py-2 border-b border-stone-100"><span className="text-stone-500">{t('partner_page.category')}</span><span className="font-medium text-stone-800">{myListing!.category}</span></div>
              <div className="flex justify-between py-2 border-b border-stone-100"><span className="text-stone-500">{t('partner_page.location')}</span><span className="font-medium text-stone-800">{myListing!.location || '-'}</span></div>
            </div>
            {status === 'approved' && (
              <a href={`${process.env.NEXT_PUBLIC_ADMIN_URL || 'http://localhost:3002'}/partner`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 bg-gold-500 text-white font-semibold rounded-xl hover:bg-gold-600 transition-colors">
                {t('partner_page.listing_approved_dashboard')} <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {status === 'approved' && myListing!.is_sponsored && myListing!.sponsor_payment_status !== 'paid' && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 leading-relaxed">
                <p className="font-semibold mb-0.5">{t('partner_page.sponsor_pending')}</p>
                <p className="text-xs text-amber-700 font-normal">{t('partner_page.sponsor_pending_desc')}</p>
              </div>
            )}
            {status === 'approved' && myListing!.is_sponsored && myListing!.sponsor_payment_status === 'paid' && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 leading-relaxed">
                <p className="font-semibold mb-0.5">{t('partner_page.sponsor_active')}</p>
                {myListing!.sponsor_end_at ? <p className="text-xs text-emerald-700 font-normal">{t('partner_page.sponsor_valid_until')} {new Date(myListing!.sponsor_end_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.</p> : <p className="text-xs text-emerald-700 font-normal">{t('partner_page.sponsor_active_desc')}</p>}
              </div>
            )}
            {status === 'pending' && <p className="text-xs text-stone-400 text-center">{t('partner_page.listing_pending_desc')}</p>}
          </div>
        </div>
      </PartnerLayout>
    );
  }

  if (myListing?.status === 'draft') return <CompleteListingForm listing={myListing} onSubmitted={() => setSubmitted(true)} />;

  if (myApplication && myApplication.status !== 'approved') return <ApplicationStatusCard application={myApplication} onReapply={resetToForm} />;

  return (
    <PartnerLayout>
      <VisualPanel>
        <Logo />
        <div className="mt-auto mb-auto">
          <h1 className="font-serif text-[clamp(24px,3.8vw,38px)] leading-[.9] tracking-[-.3px]">
            {t('partner_page.hero_title')}<br /><span className="text-gold-500">{t('partner_page.hero_title_highlight')}</span>
          </h1>
          <div className="w-[50px] h-[2px] bg-gold-500 my-[10px]" />
          <h2 className="md:text-[13px] font-semibold mb-[4px]">{t('partner_page.hero_subhead')}</h2>
          <p className="max-w-[340px] text-white/82 text-[12px] md:text-[12px] leading-[1.4]">{t('partner_page.hero_subtitle')}</p>
        </div>
        <Benefits />
      </VisualPanel>
      <div className="md:w-[52%] p-[18px_18px_24px] md:p-[24px_28px_20px] flex flex-col justify-center">
        <a href="/" className="text-stone-400 hover:text-stone-700 text-[11px] font-medium mb-3 block w-fit transition-colors">
          {t('partner_page.back')}
        </a>
        <div className="w-[34px] h-[34px] mb-[6px] flex items-center justify-center bg-[#f8f2e6] rounded-full text-gold-500 text-[15px]">♧</div>
        <h2 className="font-serif text-[20px] tracking-[-.3px] mb-[2px]">{t('partner_page.form_title')}</h2>
        <p className="text-[#77736d] text-[12px] mb-[14px]">{t('partner_page.form_subtitle')}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[11px]">
          <div>
            <label className="block text-[12px] font-bold mb-[4px]">{t('partner_page.business_name')} *</label>
            <input name="business_name" value={form.business_name} onChange={handleChange} required placeholder={t('partner_page.business_name_placeholder')} className="w-full h-[42px] md:h-[48px] px-[12px] md:px-[14px] border border-[#ddd9d1] rounded-[8px] text-[13px] outline-none focus:border-[#c98920] focus:shadow-[0_0_0_3px_rgba(201,137,32,.1)] transition" />
          </div>
          <div>
            <label className="block text-[12px] font-bold mb-[4px]">{t('partner_page.category')} *</label>
            <div className="relative">
              <select name="category" value={form.category} onChange={handleChange} required className="w-full h-[48px] md:h-[56px] px-[14px] md:px-[18px] pr-[36px] border border-[#ddd9d1] rounded-[10px] text-[14px] outline-none focus:border-[#c98920] focus:shadow-[0_0_0_3px_rgba(201,137,32,.1)] transition bg-white appearance-none cursor-pointer">
                <option value="">{t('partner_page.category_placeholder')}</option>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <span className="absolute right-[14px] top-1/2 -translate-y-1/2 text-[#aaa49b] text-[10px] pointer-events-none">▼</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            <div className="md:col-span-2">
              <label className="block text-[13px] font-bold mb-[6px] md:mb-[8px]">{t('partner_page.location')} *</label>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map((loc) => (
                  <label key={loc} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${form.locations.includes(loc) ? 'bg-gold-50 border-gold-400 text-gold-700' : 'bg-white border-[#ddd9d1] text-stone-600 hover:border-stone-300'}`}>
                    <input type="checkbox" checked={form.locations.includes(loc)} onChange={() => toggleLocation(loc)} className="sr-only" />
                    {loc}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-[6px] md:mb-[8px]">{t('partner_page.phone')} *</label>
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="0812-3456-7890" className="w-full h-[48px] md:h-[56px] px-[14px] md:px-[18px] border border-[#ddd9d1] rounded-[10px] text-[14px] outline-none focus:border-[#c98920] focus:shadow-[0_0_0_3px_rgba(201,137,32,.1)] transition" />
            </div>
            <div>
              <label className="block text-[13px] font-bold mb-[6px] md:mb-[8px]">{t('partner_page.email_business')} *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="email@domain.com" className="w-full h-[48px] md:h-[56px] px-[14px] md:px-[18px] border border-[#ddd9d1] rounded-[10px] text-[14px] outline-none focus:border-[#c98920] focus:shadow-[0_0_0_3px_rgba(201,137,32,.1)] transition" />
            </div>
          </div>

          <div className="flex items-start gap-[11px] md:gap-[13px] p-[12px_14px] md:p-[15px_17px] bg-[#faf6ed] border border-[#eee2cd] rounded-[10px]">
            <Shield className="w-[18px] md:w-[21px] h-[18px] md:h-[21px] text-gold-500 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="block text-[11px] md:text-xs mb-[3px]">{t('partner_page.security_title')}</strong>
              <span className="block text-[#77736d] text-[10px] md:text-[11px] leading-[1.5]">{t('partner_page.security_desc')}</span>
            </div>
          </div>

          <label className="flex items-start gap-[10px] md:gap-[11px] cursor-pointer text-[11px] md:text-xs leading-[1.55] text-[#55514b]">
            <input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} required className="appearance-none w-[18px] md:w-5 h-[18px] md:h-5 flex-shrink-0 mt-0.5 border-[1.5px] border-[#bdb7ad] rounded-[5px] checked:bg-gold-500 checked:border-gold-500 checked:after:content-['✓'] checked:after:text-white checked:after:flex checked:after:items-center checked:after:justify-center transition" />
            <span>{t('partner_page.terms_prefix')} <a href="/syarat-ketentuan" target="_blank" className="text-[#ad6f12] font-semibold no-underline hover:underline">{t('partner_page.terms_tc')}</a> {t('partner_page.terms_and')} <a href="/kebijakan-privasi" target="_blank" className="text-[#ad6f12] font-semibold no-underline hover:underline">{t('partner_page.terms_privacy')}</a> {t('partner_page.terms_suffix')}</span>
          </label>

          {error && <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-[10px] px-[14px] md:px-[17px] py-[12px] md:py-[15px]">{error}</p>}

          <button type="submit" disabled={!isFormValid || submitting}
            className="w-full h-[50px] md:h-[58px] border-none rounded-[10px] bg-[#c98920] text-white text-[15px] md:text-[16px] font-bold cursor-pointer hover:bg-[#ad6f12] hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(201,137,32,.25)] disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            ✈ &nbsp; {submitting ? t('partner_page.submitting') : t('partner_page.submit')}
          </button>
        </form>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode={authModalMode} />
    </PartnerLayout>
  );
}
