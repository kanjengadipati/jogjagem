'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { businesses, listingClaims, BeBusiness, SearchResult } from '@/lib/api';
import Image from 'next/image';
import {
  Briefcase, CheckCircle2, Shield, AlertCircle, ArrowLeft,
  Building2, Search, Loader2, Megaphone, BarChart2,
} from 'lucide-react';
import AuthModal from '@/components/AuthModal';
import { useLocale } from '@/contexts/LocaleContext';
import VerificationStepper from '@/components/business-portal/VerificationStepper';

const CATEGORIES = ['Kuliner', 'Hotel & Penginapan', 'Wisata & Destinasi', 'Oleh-oleh', 'Jasa', 'Lainnya'];
const REGIONS = ['Kota Yogyakarta', 'Sleman', 'Bantul', 'Kulon Progo', 'Gunungkidul', 'Near Yogyakarta'] as const;

function friendlyClaimError(raw: string): string {
  const s = (raw || '').toLowerCase();
  if (s.includes('not an owner') || s.includes('forbidden') || s.includes('bukan pemilik'))
    return 'Anda bukan pemilik bisnis yang dipilih. Silakan pilih bisnis yang benar.';
  if (s.includes('already claimed') || s.includes('already owned') || s.includes('conflict'))
    return 'Listing ini sudah diklaim oleh bisnis lain.';
  if (s.includes('already pending') || s.includes('sudah ada klaim'))
    return 'Listing ini sudah memiliki klaim aktif yang sedang ditinjau.';
  if (s.includes('invalid listing type') || s.includes('unsupported listing'))
    return 'Jenis listing tidak didukung untuk klaim kepemilikan.';
  if (s.includes('not found') || s.includes('tidak ditemukan'))
    return 'Listing tidak ditemukan. Periksa kembali ID listing yang dimasukkan.';
  if (s.includes('permission') || s.includes('unauthorized') || s.includes('unauthenticated'))
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  if (s.includes('validation') || s.includes('required'))
    return 'Data yang dimasukkan tidak lengkap atau tidak valid.';
  return 'Gagal mengirim klaim. Silakan coba beberapa saat lagi.';
}

function extractDataArray<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.data?.data)) return res.data.data;
  return [];
}

function validatePhone(phone: string): boolean {
  const cleanPhone = phone.trim();
  if (!cleanPhone) return true;
  const digitsOnly = cleanPhone.replace(/\D/g, '');
  if (digitsOnly.length < 9 || digitsOnly.length > 15) return false;
  return /^(\+62|62|0)[8][1-9][0-9]{6,11}$/.test(cleanPhone);
}

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

function validateEmail(email: string): boolean {
  const trimmed = email.trim();
  if (!trimmed) return true; // opsional, kosong = valid
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

// Cek keberadaan MX record domain email via DNS-over-HTTPS (fail-open).
async function checkEmailDomainValid(email: string): Promise<boolean> {
  const domain = email.split('@')[1];
  if (!domain) return false;
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
      { signal: AbortSignal.timeout(2500) }
    );
    if (!res.ok) return true; // gagal cek → fail-open
    const data = await res.json();
    return Array.isArray(data.Answer) && data.Answer.length > 0;
  } catch {
    return true; // timeout/network error → fail-open, jangan blokir user
  }
}

// ─── Verifikasi kecocokan kategori bisnis vs tipe listing ───────────────────

const LISTING_TYPE_LABELS: Record<string, string> = {
  destination: 'Wisata & Destinasi',
  attraction: 'Wisata & Destinasi',
  hotel: 'Hotel & Penginapan',
  accommodation: 'Hotel & Penginapan',
  restaurant: 'Kuliner',
  culinary: 'Kuliner',
  souvenir: 'Oleh-oleh',
  shopping: 'Oleh-oleh',
  rental: 'Jasa / Rental',
  guide: 'Guide Lokal',
  event: 'Event',
};

const CATEGORY_LISTING_TYPES: Record<string, string[]> = {
  'Kuliner': ['restaurant', 'culinary'],
  'Hotel & Penginapan': ['hotel', 'accommodation'],
  'Wisata & Destinasi': ['destination', 'attraction'],
  'Oleh-oleh': ['souvenir', 'shopping'],
  'Jasa': ['rental', 'guide'],
  'Lainnya': [],
};

/** Mengembalikan pesan peringatan bila kategori bisnis tidak cocok dengan tipe
 *  listing yang diklaim, atau null bila cocok / tidak bisa ditentukan. */
function categoryMismatchWarning(businessCategory: string, listingType: string): string | null {
  const allowed = CATEGORY_LISTING_TYPES[businessCategory?.trim()];
  if (!allowed || allowed.length === 0) return null; // 'Lainnya'/kategori tak dikenal → tidak diblokir
  if (allowed.includes(listingType)) return null;
  const typeLabel = LISTING_TYPE_LABELS[listingType] ?? listingType;
  return `Bisnis Anda berkategori "${businessCategory}", sedangkan listing yang diklaim berjenis "${typeLabel}". Pastikan Anda memang pemilik listing tersebut sebelum melanjutkan.`;
}

// ─── Visual Panel (sama persis dengan business/page.tsx) ───────────────────

function VisualPanel() {
  const { t } = useLocale();
  return (
    <div className="relative md:w-[48%] min-h-[220px] md:min-h-0 overflow-hidden text-white flex flex-col justify-between p-8">
      <Image src="/merapi.png" alt="Gunung Merapi" fill className="object-cover object-center" priority />
      <div className="absolute inset-0 bg-gradient-to-br from-black/75 via-black/55 to-black/40" />

      {/* Top */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-white text-xs font-semibold">
          <Image src="/logo-gold-new.png" alt="Jogjagem" width={16} height={16} className="object-contain" />
          <span>{t('business_page.platform_label')}</span>
        </div>
        <h1 className="mt-5 text-3xl md:text-[2.2rem] font-extrabold tracking-tight text-white leading-[1.15]">
          {t('business_page.visual_headline').split('\n').map((line, i) => (
            <span key={i}>{line}{i === 0 && <br />}</span>
          ))}{' '}
          <span className="text-amber-400">{t('business_page.visual_headline_accent')}</span>
          <span className="text-amber-400 ml-1">✦</span>
        </h1>
        <p className="mt-3 text-sm text-white/70 leading-relaxed max-w-xs">
          {t('business_page.visual_body')}
        </p>
      </div>

      {/* Bottom */}
      <div className="relative z-10 space-y-4">
        {[
          { Icon: Shield,    title: t('business_page.feature_claim_title'), desc: t('business_page.feature_claim_desc') },
          { Icon: Megaphone, title: t('business_page.feature_promo_title'), desc: t('business_page.feature_promo_desc') },
          { Icon: BarChart2, title: t('business_page.feature_rep_title'),   desc: t('business_page.feature_rep_desc') },
        ].map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
              <Icon className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">{title}</div>
              <div className="text-xs text-white/60">{desc}</div>
            </div>
          </div>
        ))}
        <p className="text-amber-400 italic font-semibold text-sm pt-2" style={{ fontFamily: 'Georgia, serif' }}>
          {t('business_page.tagline')}
        </p>
      </div>
    </div>
  );
}

// ─── Main claim form ────────────────────────────────────────────────────────

function ClaimFormContent() {
  const { t } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const rawType = searchParams.get('type') || 'destination';
  const listingType = rawType === 'culinary' ? 'restaurant'
    : rawType === 'shopping' ? 'souvenir'
    : rawType === 'accommodation' ? 'hotel'
    : rawType === 'attraction' ? 'destination'
    : rawType;
  const listingId   = searchParams.get('listingId') || '';
  const listingName = searchParams.get('name') || '';
  const placement   = searchParams.get('placement') || '';

  const goToBusinessDashboard = () => {
    router.push(placement ? `/business?placement=${encodeURIComponent(placement)}` : '/business');
  };

  const [manualListingId, setManualListingId]   = useState('');
  const [selectedListingId, setSelectedListingId] = useState('');
  const [searchResults, setSearchResults]       = useState<SearchResult[]>([]);
  const [searching, setSearching]               = useState(false);
  const [showResults, setShowResults]           = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const targetListingId = listingId || selectedListingId || manualListingId;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setSelectedListingId('');
    const search = async () => {
      if (manualListingId.length < 3) { setSearchResults([]); return; }
      setSearching(true);
      try {
        const res = await listingClaims.search(manualListingId);
        setSearchResults(res.data ?? []);
        setShowResults(true);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    };
    const t = setTimeout(search, 300);
    return () => clearTimeout(t);
  }, [manualListingId]);

  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal]   = useState(false);
  const [myBusinesses, setMyBusinesses]     = useState<BeBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<BeBusiness | 'new'>('new');
  const [loading, setLoading]               = useState(true);
  const [submitting, setSubmitting]         = useState(false);
  const [resultMessage, setResultMessage]   = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  type ClaimCheckStep = 'idle' | 'checking-name' | 'checking-email' | 'checking-category' | 'saving' | 'done';
  const [checkStep, setCheckStep]           = useState<ClaimCheckStep>('idle');
  const [categoryWarning, setCategoryWarning]   = useState<string | null>(null);
  const [ackMismatch, setAckMismatch]           = useState(false);
  const [emailWarning, setEmailWarning]         = useState<string | null>(null);

  const [newBizData, setNewBizData] = useState({
    name: '',
    category: listingType === 'hotel' ? 'Hotel & Penginapan'
      : listingType === 'restaurant' ? 'Kuliner'
      : listingType === 'souvenir' ? 'Oleh-oleh'
      : 'Wisata & Destinasi',
    phone: '',
    description: '',
    address: '',
    email: '',
    regions: [] as string[],
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadBusinesses();
    } else {
      setLoading(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_return_to', window.location.pathname + window.location.search);
      }
    }
  }, [isAuthenticated]);

  const loadBusinesses = async () => {
    setLoading(true);
    try {
      const data = await businesses.getMine();
      const list = extractDataArray<BeBusiness>(data);
      setMyBusinesses(list);
      setSelectedBusiness(list.length > 0 ? list[0] : 'new');
    } catch {
      setMyBusinesses([]);
      setSelectedBusiness('new');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isAuthenticated) { setShowAuthModal(true); return; }

    setResultMessage(null);
    setCategoryWarning(null);

    let succeeded = false;

    try {
      const isNewBiz = selectedBusiness === 'new';

      // ── 0) Validasi field dasar (bentuknya sama seperti registrasi) ──
      if (isNewBiz) {
        if (!newBizData.name.trim()) {
          setResultMessage({ type: 'error', text: 'Nama bisnis wajib diisi.' });
          return;
        }
        if (!newBizData.address.trim()) {
          setResultMessage({ type: 'error', text: 'Alamat usaha/kantor wajib diisi.' });
          return;
        }
        if (newBizData.regions.length === 0) {
          setResultMessage({ type: 'error', text: 'Pilih minimal 1 wilayah layanan.' });
          return;
        }
        if (newBizData.phone.trim() && !validatePhone(newBizData.phone)) {
          setResultMessage({ type: 'error', text: 'Nomor telepon tidak valid.' });
          return;
        }
        if (!validateEmail(newBizData.email)) {
          setResultMessage({ type: 'error', text: t('business_page.err_email_format') });
          return;
        }
      }

      // ── 1) Cek duplikasi nama bisnis (fail-open, sama seperti registrasi) ──
      setCheckStep('checking-name');
      if (isNewBiz && newBizData.name.trim()) {
        let nameTaken = false;
        await Promise.all([
          (async () => {
            try {
              const checkRes = await fetch(`/api/businesses/check-name?q=${encodeURIComponent(newBizData.name.trim())}`);
              if (checkRes.ok) {
                const checkData = await checkRes.json();
                const similar: Array<{ name: string }> = checkData?.data ?? [];
                const exactMatch = similar.find(
                  (b) => b.name?.trim().toLowerCase() === newBizData.name.trim().toLowerCase()
                );
                if (exactMatch) {
                  nameTaken = true;
                  setResultMessage({ type: 'error', text: `Nama bisnis "${exactMatch.name}" sudah terdaftar. Gunakan nama lain.` });
                }
              }
            } catch {
              // fail-open: kalau endpoint tidak bisa dijangkau, lanjut saja
            }
          })(),
          delay(800),
        ]);
        if (nameTaken) return;
      }

      // ── 2) Cek validitas domain email (DNS-over-HTTPS, non-blocking) ──
      setCheckStep('checking-email');
      setEmailWarning(null);
      if (isNewBiz && newBizData.email.trim()) {
        await Promise.all([
          checkEmailDomainValid(newBizData.email.trim()).then((validDomain) => {
            if (!validDomain) setEmailWarning(t('business_page.email_warning'));
          }),
          delay(800),
        ]);
      }

      // ── 3) Verifikasi kecocokan kategori bisnis vs tipe listing ──
      const bizCategory = isNewBiz
        ? newBizData.category
        : String((selectedBusiness as any)?.category ?? (selectedBusiness as any)?.data?.category ?? '');
      if (!ackMismatch) {
        setCheckStep('checking-category');
        await delay(800);
        const warning = categoryMismatchWarning(bizCategory, listingType);
        if (warning) {
          setCategoryWarning(warning);
          setCheckStep('idle');
          return;
        }
      }

      // ── 4) Simpan bisnis (bila baru) lalu kirim klaim ──
      setCheckStep('saving');
      setSubmitting(true);
      let targetBusinessExternalId = '';

      if (isNewBiz) {
        const [bizRes] = await Promise.all([businesses.create(newBizData), delay(700)]);
        if (bizRes.status === 'error') throw new Error(bizRes.message || 'Gagal mendaftarkan bisnis baru.');
        const rawBiz = (bizRes as any)?.data ?? (bizRes as any);
        targetBusinessExternalId = String(rawBiz?.external_id ?? rawBiz?.data?.external_id ?? '');
      } else {
        const biz = selectedBusiness as any;
        targetBusinessExternalId = String(biz?.external_id ?? biz?.data?.external_id ?? '');
      }

      if (!targetBusinessExternalId) throw new Error('Gagal mendapatkan identitas bisnis. Silakan refresh dan coba lagi.');
      if (!targetListingId.trim()) {
        setResultMessage({ type: 'error', text: 'Silakan isi ID / Nama listing yang hendak diklaim.' });
        setSubmitting(false);
        setCheckStep('idle');
        return;
      }

      const [claimRes] = await Promise.all([
        listingClaims.submit({
          business_external_id: targetBusinessExternalId,
          listing_type: listingType,
          listing_external_id: targetListingId,
        }),
        delay(700),
      ]);
      if (claimRes.status === 'error') throw new Error(friendlyClaimError(claimRes.message || ''));

      succeeded = true;
      setCheckStep('done');
      setResultMessage({
        type: 'success',
        text: 'Klaim kepemilikan berhasil dikirim! Tim Jogjagem akan meninjau klaim Anda dalam 1×24 jam.',
      });
      setTimeout(() => {
        goToBusinessDashboard();
      }, 1500);
      setTimeout(() => {
        setSubmitting(false);
        setCheckStep('idle');
      }, 1500);
    } catch (err) {
      setResultMessage({ type: 'error', text: friendlyClaimError(err instanceof Error ? err.message : '') });
    } finally {
      if (!succeeded) {
        setSubmitting(false);
        setCheckStep('idle');
      }
    }
  };

  return (
    <div className="min-h-screen md:h-screen flex items-center justify-center p-0 md:p-6 relative overflow-hidden bg-stone-950">
      {/* Bg image */}
      <Image src="/merapi.png" alt="Gunung Merapi" fill priority className="object-cover object-center" />
      <div className="absolute inset-0 bg-black/45" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[960px] md:h-[calc(100vh-3rem)] rounded-none md:rounded-3xl overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,.65)] flex flex-col md:flex-row">
        <VisualPanel />

        {/* Right panel */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#FAF6EF]">
          <div className="flex-1 overflow-y-auto px-6 py-5 md:px-8 md:py-6 flex flex-col justify-center">

            {/* Target listing info */}
            <div className="p-3.5 bg-amber-50 border border-amber-200/70 rounded-2xl flex items-start gap-3 text-xs text-amber-900 mb-4">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="w-full">
                <span className="font-bold text-[11px] text-amber-700 uppercase tracking-wider block">
                  {t('business_claim.target_listing')}
                </span>
                {listingName || listingId ? (
                  <>
                    <span className="font-bold text-stone-900 text-sm block mt-0.5">{listingName || listingId}</span>
                    <span className="text-[11px] text-stone-500 block mt-0.5">
                      {t('business_claim.category')} <span className="capitalize font-medium">{listingType}</span>
                    </span>
                  </>
                ) : (
                  <div className="mt-1.5 space-y-1.5 relative" ref={searchRef}>
                    <span className="text-xs text-stone-600 block font-medium">{t('business_claim.search_prompt')}</span>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t('business_claim.search_placeholder')}
                        value={manualListingId}
                        onChange={(e) => setManualListingId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs border border-stone-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                      {searching && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500 absolute right-2.5 top-2.5" />}
                    </div>
                    {showResults && searchResults.length > 0 && (
                      <ul className="absolute z-50 w-full bg-white border border-stone-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {searchResults.map((r) => (
                          <li
                            key={`${r.listing_type}:${r.id}`}
                            className="px-3 py-2 text-xs hover:bg-stone-50 cursor-pointer border-b last:border-0 border-stone-100"
                            onClick={() => { setManualListingId(r.name); setSelectedListingId(r.id); setShowResults(false); }}
                          >
                            <div className="font-semibold text-stone-900">{r.name}</div>
                            <div className="text-[10px] text-stone-400 capitalize">{r.listing_type}</div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Form card */}
            <div className="bg-white p-4 md:p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
              {/* Header */}
              <div>
                <h2 className="text-xl font-bold text-stone-900">{t('business_claim.title')}</h2>
                <p className="text-xs text-stone-500 mt-0.5">{t('business_claim.subtitle')}</p>
              </div>

              {/* Result message */}
              {resultMessage && (
                <div className={`p-3.5 rounded-xl text-xs font-medium flex items-start gap-2.5 ${
                  resultMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {resultMessage.type === 'success'
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
                  <div className="leading-relaxed">{resultMessage.text}</div>
                </div>
              )}

            {!isAuthenticated ? (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-stone-600">{t('business_claim.must_login')}</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-2.5 bg-stone-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors"
                >
                  {t('business_claim.login_btn')}
                </button>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8 text-stone-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Memuat data bisnis Anda...</span>
              </div>
            ) : (
              <form onSubmit={handleClaim} className="space-y-3">
                {/* Business selector */}
                {myBusinesses.length > 0 && (
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_claim.choose_business')}</label>
                    <select
                      value={selectedBusiness === 'new' ? 'new' : String((selectedBusiness as any).id || (selectedBusiness as any).ID || '')}
                      disabled={resultMessage?.type === 'success' || submitting}
                      onChange={(e) => {
                        setCategoryWarning(null);
                        setAckMismatch(false);
                        if (e.target.value === 'new') { setSelectedBusiness('new'); return; }
                        const found = myBusinesses.find(b => String((b as any).id || (b as any).ID) === e.target.value);
                        if (found) setSelectedBusiness(found);
                      }}
                      className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-stone-100"
                    >
                      {myBusinesses.map((b) => (
                        <option key={(b as any).id || (b as any).ID} value={String((b as any).id || (b as any).ID)}>
                          {b.name} ({b.category})
                        </option>
                      ))}
                      <option value="new">+ {t('business_claim.register_new')}</option>
                    </select>
                  </div>
                )}

                {/* Inline new business form */}
                {(myBusinesses.length === 0 || selectedBusiness === 'new') && (
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 pb-2 border-b border-stone-100">
                      <Building2 className="w-4 h-4 text-amber-600" />
                      <span>{t('business_claim.register_new')}</span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_claim.biz_name')}</label>
                      <input
                        type="text"
                        required
                        disabled={resultMessage?.type === 'success' || submitting}
                        value={newBizData.name}
                        onChange={(e) => setNewBizData({ ...newBizData, name: e.target.value })}
                        placeholder={t('business_claim.biz_name_placeholder')}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-stone-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_claim.category_label')}</label>
                        <select
                          value={newBizData.category}
                          disabled={resultMessage?.type === 'success' || submitting}
                          onChange={(e) => setNewBizData({ ...newBizData, category: e.target.value })}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-stone-100"
                        >
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_claim.whatsapp_label')}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          disabled={resultMessage?.type === 'success' || submitting}
                          value={newBizData.phone}
                          onChange={(e) => setNewBizData({ ...newBizData, phone: e.target.value.replace(/[^0-9+]/g, '') })}
                          placeholder={t('business_claim.whatsapp_placeholder')}
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white font-mono disabled:bg-stone-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_address')}</label>
                      <textarea
                        rows={2}
                        required
                        disabled={resultMessage?.type === 'success' || submitting}
                        value={newBizData.address}
                        onChange={(e) => setNewBizData({ ...newBizData, address: e.target.value })}
                        placeholder={t('business_page.field_address_placeholder')}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white resize-none disabled:bg-stone-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_email')}</label>
                      <input
                        type="email"
                        disabled={resultMessage?.type === 'success' || submitting}
                        value={newBizData.email}
                        onChange={(e) => setNewBizData({ ...newBizData, email: e.target.value })}
                        placeholder={t('business_page.field_email_placeholder')}
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white disabled:bg-stone-100"
                      />
                      {emailWarning && (
                        <p className="text-[10px] text-amber-600 mt-1">{emailWarning}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1">{t('business_page.field_regions')}</label>
                      <div className="flex flex-wrap gap-1.5">
                        {REGIONS.map((region) => {
                          const checked = newBizData.regions.includes(region);
                          return (
                            <button
                              key={region}
                              type="button"
                              disabled={resultMessage?.type === 'success' || submitting}
                              onClick={() =>
                                setNewBizData({
                                  ...newBizData,
                                  regions: checked
                                    ? newBizData.regions.filter((r) => r !== region)
                                    : [...newBizData.regions, region],
                                })
                              }
                              className={`px-2.5 py-1 text-[11px] rounded-full border transition-all disabled:opacity-50 ${
                                checked
                                  ? 'bg-amber-500 border-amber-500 text-white font-bold'
                                  : 'bg-white border-stone-300 text-stone-600 hover:border-amber-400'
                              }`}
                            >
                              {region}
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-stone-400 mt-1">{t('business_page.field_regions_hint')}</p>
                    </div>
                  </div>
                )}

                {categoryWarning && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-[11px] leading-relaxed space-y-2">
                    <p className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{categoryWarning}</span>
                    </p>
                    <label className="flex items-center gap-2 text-amber-950 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={ackMismatch}
                        onChange={(e) => setAckMismatch(e.target.checked)}
                        className="accent-amber-600"
                      />
                      Saya yakin dan ingin tetap melanjutkan klaim
                    </label>
                  </div>
                )}

                {/* Submit */}
                <div className="flex items-center justify-between pt-1 gap-3">
                  <button
                    type="button"
                    onClick={goToBusinessDashboard}
                    disabled={submitting || checkStep !== 'idle' || resultMessage?.type === 'success'}
                    className="px-5 py-2.5 text-xs font-bold bg-white border border-stone-300 hover:border-amber-500 hover:bg-amber-50 text-stone-700 hover:text-amber-700 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {t('business_page.btn_cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={resultMessage?.type === 'success' || submitting || checkStep !== 'idle'}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                  >
                    {submitting || checkStep !== 'idle'
                      ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {checkStep === 'done' ? 'Selesai!' : t('business_page.step_saving_fallback')}</>
                      : resultMessage?.type === 'success'
                      ? <><CheckCircle2 className="w-3.5 h-3.5" /> {t('business_claim.success_btn')}</>
                      : <><Briefcase className="w-3.5 h-3.5" /> {t('business_claim.submit_btn')}</>}
                  </button>
                </div>

                {resultMessage?.type === 'success' && (
                  <button
                    type="button"
                    onClick={goToBusinessDashboard}
                    className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors"
                  >
                    {t('business_claim.return_to_biz')}
                  </button>
                )}
              </form>
            )}
            </div>{/* end form card */}

          </div>{/* end overflow-y-auto */}
        </div>{/* end right panel */}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {checkStep !== 'idle' && (
        <VerificationStepper
          steps={[
            { id: 'checking-name', label: t('business_page.step_checking_name') },
            { id: 'checking-email', label: t('business_page.step_checking_email') },
            { id: 'checking-category', label: 'Memeriksa kecocokan kategori...' },
            { id: 'saving', label: t('business_page.step_saving') },
            { id: 'done', label: t('business_page.step_done') },
          ]}
          activeStep={checkStep}
          allDone={checkStep === 'done'}
        />
      )}
    </div>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-white text-xs">
        Loading...
      </div>
    }>
      <ClaimFormContent />
    </Suspense>
  );
}
